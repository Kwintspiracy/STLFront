import { useState, useCallback, useEffect } from 'react';
import { Tag } from '@/types/product';
import { 
  searchTags, 
  validateTag, 
  validateTagLimit,
  TagValidationResult,
  TagSearchResult 
} from '@/lib/api/tags';

interface UseTagManagementProps {
  initialTags?: Tag[];
  maxTags?: number;
  onTagsChange?: (tags: Tag[]) => void;
}

interface TagSuggestion extends Tag {
  type: 'existing' | 'new';
  confidence?: number;
}

export function useTagManagement({ 
  initialTags = [], 
  maxTags = 5, 
  onTagsChange 
}: UseTagManagementProps = {}) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<TagValidationResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Update parent when tags change
  useEffect(() => {
    onTagsChange?.(selectedTags);
  }, [selectedTags, onTagsChange]);

  // Search tags with debouncing
  const searchTagsDebounced = useCallback(async (query: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(async () => {
      if (!query.trim() || query.trim().length < 3) {
        setSuggestions([]);
        setValidationResult(null);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Search existing tags
        const searchResult: TagSearchResult = await searchTags(query, 8);
        
        // Validate the input
        const validation = await validateTag(query);
        setValidationResult(validation);

        // Filter out already selected tags
        const selectedTagIds = selectedTags.map(tag => tag.id);
        const filteredResults = searchResult.results.filter(
          tag => !selectedTagIds.includes(tag.id)
        );

        // Prepare suggestions (only existing tags, no "create new" option)
        const tagSuggestions: TagSuggestion[] = filteredResults.map(tag => ({
          ...tag,
          type: 'existing' as const
        }));

        setSuggestions(tagSuggestions);
        setShowSuggestions(tagSuggestions.length > 0);

      } catch (error) {
        console.error('Error searching tags:', error);
        setError('Erreur lors de la recherche des tags');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    setDebounceTimer(timer);
  }, [selectedTags, debounceTimer]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    searchTagsDebounced(value);
  }, [searchTagsDebounced]);

  // Add a tag
  const addTag = useCallback(async (tagToAdd: TagSuggestion) => {
    setError(null);

    // Check tag limit (use temporary IDs for new tags)
    const currentTagIds = selectedTags.map(tag => tag.id);
    const newTagId = tagToAdd.type === 'new' ? -Math.random() : tagToAdd.id;
    
    const limitValidation = await validateTagLimit(
      currentTagIds,
      [newTagId]
    );

    if (!limitValidation.is_valid) {
      setError(limitValidation.error || `Maximum ${maxTags} tags autorisés`);
      return false;
    }

    try {
      let finalTag: Tag;

      if (tagToAdd.type === 'new') {
        // For new tags, create a temporary tag object that will be created later
        finalTag = {
          id: -Math.random(), // Temporary negative ID
          name: tagToAdd.name,
          slug: tagToAdd.slug,
          isTemporary: true // Mark as temporary
        } as Tag & { isTemporary: boolean };
      } else {
        // Use existing tag
        finalTag = tagToAdd;
      }

      // Check if tag is already selected (by name for new tags, by ID for existing)
      const isDuplicate = selectedTags.some(tag => {
        if (tagToAdd.type === 'new') {
          return tag.name.toLowerCase() === finalTag.name.toLowerCase();
        }
        return tag.id === finalTag.id;
      });

      if (isDuplicate) {
        // Don't show error, just silently ignore duplicate selection
        // Clear input and suggestions to continue workflow
        setInputValue('');
        setSuggestions([]);
        setShowSuggestions(false);
        setValidationResult(null);
        return true; // Return true to indicate successful handling
      }

      // Add to selected tags
      setSelectedTags(prev => [...prev, finalTag]);
      
      // Clear input and suggestions
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      setValidationResult(null);

      return true;

    } catch (error) {
      console.error('Error adding tag:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'ajout du tag');
      return false;
    }
  }, [selectedTags, maxTags]);

  // Remove a tag
  const removeTag = useCallback((tagId: number) => {
    setSelectedTags(prev => prev.filter(tag => tag.id !== tagId));
    setError(null);
  }, []);

  // Handle suggestion selection
  const selectSuggestion = useCallback((suggestion: TagSuggestion) => {
    addTag(suggestion);
  }, [addTag]);

  // Handle key press (Enter and Space)
  const handleKeyPress = useCallback(async (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      
      const trimmedInput = inputValue.trim();
      
      // Only process if we have at least 3 characters
      if (trimmedInput.length < 3) {
        return;
      }
      
      // If we have suggestions, use the first one
      if (suggestions.length > 0) {
        selectSuggestion(suggestions[0]);
      } else {
        // No suggestions found, create a new tag
        try {
          // Validate the input first
          const validation = await validateTag(trimmedInput);
          
          if (validation.is_valid) {
            const newTagSuggestion: TagSuggestion = {
              id: -Math.random(),
              name: trimmedInput,
              slug: validation.normalized_name,
              type: 'new'
            };
            
            await addTag(newTagSuggestion);
          } else {
            setError(validation.errors[0] || 'Tag invalide');
          }
        } catch (error) {
          console.error('Error validating tag:', error);
          setError('Erreur lors de la validation du tag');
        }
      }
    } else if (event.key === 'Escape') {
      // Close suggestions
      setShowSuggestions(false);
      setInputValue('');
    }
  }, [inputValue, suggestions, selectSuggestion, addTag]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (inputValue.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [inputValue, suggestions]);

  // Clear all tags
  const clearAllTags = useCallback(() => {
    setSelectedTags([]);
    setError(null);
  }, []);

  // Get validation status
  const getValidationStatus = useCallback(() => {
    if (!validationResult) return null;

    if (validationResult.errors.length > 0) {
      return {
        type: 'error' as const,
        message: validationResult.errors[0]
      };
    }

    if (validationResult.warnings.length > 0) {
      return {
        type: 'warning' as const,
        message: validationResult.warnings[0]
      };
    }

    if (validationResult.suggestions.length > 0) {
      const suggestion = validationResult.suggestions[0];
      if (suggestion.type === 'correction') {
        return {
          type: 'suggestion' as const,
          message: `Vouliez-vous dire "${suggestion.tag_name}" ?`
        };
      }
    }

    return null;
  }, [validationResult]);

  // Check if at tag limit
  const isAtLimit = selectedTags.length >= maxTags;

  return {
    // State
    selectedTags,
    inputValue,
    suggestions,
    isLoading,
    showSuggestions,
    error,
    isAtLimit,
    validationStatus: getValidationStatus(),
    
    // Actions
    handleInputChange,
    addTag,
    removeTag,
    selectSuggestion,
    handleKeyPress,
    handleBlur,
    handleFocus,
    clearAllTags,
    
    // Utils
    canAddMoreTags: selectedTags.length < maxTags,
    remainingSlots: maxTags - selectedTags.length,
  };
}
