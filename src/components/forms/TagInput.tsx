"use client";

import React from 'react';
import { Tag } from '@/types/product';
import { useTagManagement } from '@/hooks/useTagManagement';
import { RiCloseLine, RiAddLine, RiLoader4Line, RiCheckLine, RiAlertLine } from 'react-icons/ri';

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  maxTags?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function TagInput({
  selectedTags,
  onTagsChange,
  maxTags = 5,
  placeholder = "Tapez pour rechercher ou créer des tags...",
  disabled = false,
  className = ""
}: TagInputProps) {
  const {
    inputValue,
    suggestions,
    isLoading,
    showSuggestions,
    error,
    isAtLimit,
    validationStatus,
    handleInputChange,
    removeTag,
    selectSuggestion,
    handleKeyPress,
    handleBlur,
    handleFocus,
    canAddMoreTags,
    remainingSlots
  } = useTagManagement({
    initialTags: selectedTags,
    maxTags,
    onTagsChange
  });

  return (
    <div className={`relative ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <div
              key={tag.id}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium"
            >
              <span>{tag.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag.id)}
                  className="hover:bg-accent-hover rounded-full p-0.5 transition-colors"
                  aria-label={`Supprimer le tag ${tag.name}`}
                >
                  <RiCloseLine className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            onFocus={handleFocus}
            disabled={disabled || isAtLimit}
            placeholder={isAtLimit ? `Maximum ${maxTags} tags atteint` : placeholder}
            className={`w-full bg-background border text-text-primary rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-accent transition-colors ${
              error ? 'border-red-500' : 'border-border'
            } ${disabled || isAtLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <RiLoader4Line className="w-5 h-5 text-text-secondary animate-spin" />
            </div>
          )}
        </div>

        {/* Validation Status */}
        {validationStatus && (
          <div className={`flex items-center gap-2 mt-2 text-sm ${
            validationStatus.type === 'error' ? 'text-red-500' :
            validationStatus.type === 'warning' ? 'text-yellow-500' :
            'text-blue-500'
          }`}>
            {validationStatus.type === 'error' && <RiAlertLine className="w-4 h-4" />}
            {validationStatus.type === 'warning' && <RiAlertLine className="w-4 h-4" />}
            {validationStatus.type === 'suggestion' && <RiCheckLine className="w-4 h-4" />}
            <span>{validationStatus.message}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
            <RiAlertLine className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background-secondary border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-background-hover transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <RiCheckLine className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-text-primary">{suggestion.name}</span>
                </div>
                
                <span className="text-green-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Disponible
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tag Counter */}
      <div className="flex items-center justify-between mt-3 text-sm text-text-secondary">
        <span>
          {selectedTags.length} / {maxTags} tags
          {canAddMoreTags && remainingSlots > 0 && (
            <span className="ml-2">({remainingSlots} restant{remainingSlots > 1 ? 's' : ''})</span>
          )}
        </span>
        
        {isAtLimit && (
          <span className="text-yellow-600 font-medium">
            Limite atteinte
          </span>
        )}
      </div>

      {/* Tag Guidelines */}
      <div className="mt-2 text-xs text-text-secondary">
        <div className="bg-background-secondary border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span className="text-xs font-medium text-text-primary">Recommandations de tags</span>
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-text-secondary">
              <span className="font-medium text-accent">Personnages :</span> Human - Male - Paladin - Flail - Shield
            </p>
            <p className="text-text-secondary">
              <span className="font-medium text-accent">Créatures :</span> Monster - Large - Female - Dragon
            </p>
            <p className="text-text-secondary opacity-75">
              Organisez vos tags du général au spécifique pour une meilleure découvrabilité
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
