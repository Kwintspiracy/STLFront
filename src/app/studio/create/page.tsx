'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/context/StudioContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import { FaArrowLeft, FaUpload, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

export default function CreateStudioPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState<File | null>(null);
  const [badge, setBadge] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [badgePreview, setBadgePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const { createNewStudio } = useStudio();
  const { isAuthenticated } = useAuth();
  const { showError, showSuccess } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // Handle file upload for banner
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors(prev => ({ ...prev, banner: 'Banner image must be less than 2MB' }));
        return;
      }
      setBanner(file);
      setErrors(prev => ({ ...prev, banner: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setBannerPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for badge
  const handleBadgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        setErrors(prev => ({ ...prev, badge: 'Badge image must be less than 1MB' }));
        return;
      }
      setBadge(file);
      setErrors(prev => ({ ...prev, badge: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setBadgePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Remove banner
  const removeBanner = () => {
    setBanner(null);
    setBannerPreview(null);
    setErrors(prev => ({ ...prev, banner: '' }));
  };

  // Remove badge
  const removeBadge = () => {
    setBadge(null);
    setBadgePreview(null);
    setErrors(prev => ({ ...prev, badge: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Studio name is required';
    } else if (name.length > 128) {
      newErrors.name = 'Studio name must be less than 128 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const studioData = {
        name: name.trim(),
        description: description.trim() || undefined,
        banner: banner || undefined,
        badge: badge || undefined,
      };

      const newStudio = await createNewStudio(studioData);
      
      showSuccess('Studio created successfully!');
      router.push(`/studio/${newStudio.id}`);
      
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error ||
          (error as { message?: string }).message ||
          'Failed to create studio. Please try again.'
        : 'Failed to create studio. Please try again.';
      showError(errorMessage);
      
      // Handle specific field errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { name?: string[] } } };
        if (axiosError.response?.data?.name && axiosError.response.data.name.length > 0) {
          setErrors(prev => ({ ...prev, name: axiosError.response!.data!.name![0] }));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primarybackground py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Studio</h1>
          <p className="text-gray-400">
            Set up your creative space and start sharing your work with the community.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-6">
          
          {/* Studio Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Studio Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-3 bg-neutral-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                errors.name ? 'border-red-500' : 'border-neutral-600 focus:border-primary'
              }`}
              placeholder="Enter your studio name"
              maxLength={128}
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            <p className="text-gray-500 text-xs mt-1">{name.length}/128 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`w-full p-3 bg-neutral-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none ${
                errors.description ? 'border-red-500' : 'border-neutral-600 focus:border-primary'
              }`}
              placeholder="Tell us about your studio and what you create..."
              maxLength={500}
              disabled={isLoading}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            <p className="text-gray-500 text-xs mt-1">{description.length}/500 characters</p>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Studio Banner
            </label>
            <p className="text-gray-500 text-xs mb-3">Recommended: 800x200px, max 2MB (JPEG, PNG, GIF, WebP)</p>
            
            {bannerPreview ? (
              <div className="relative">
                <div className="relative w-full h-32 bg-neutral-800 rounded-lg overflow-hidden">
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  disabled={isLoading}
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  id="banner"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="banner"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <FaUpload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-gray-400 text-sm">Click to upload banner</span>
                </label>
              </div>
            )}
            {errors.banner && <p className="text-red-500 text-sm mt-1">{errors.banner}</p>}
          </div>

          {/* Badge Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Studio Badge
            </label>
            <p className="text-gray-500 text-xs mb-3">Recommended: 100x100px, max 1MB (JPEG, PNG, GIF, WebP)</p>
            
            {badgePreview ? (
              <div className="relative inline-block">
                <div className="relative w-20 h-20 bg-neutral-800 rounded-lg overflow-hidden">
                  <Image
                    src={badgePreview}
                    alt="Badge preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeBadge}
                  className="absolute -top-1 -right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  disabled={isLoading}
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="relative inline-block">
                <input
                  type="file"
                  id="badge"
                  accept="image/*"
                  onChange={handleBadgeChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="badge"
                  className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <FaUpload className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="text-gray-400 text-xs">Badge</span>
                </label>
              </div>
            )}
            {errors.badge && <p className="text-red-500 text-sm mt-1">{errors.badge}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-black font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating Studio...' : 'Create Studio'}
            </button>
            
            <Link
              href="/"
              className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-2">Studio Guidelines</h3>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Studio names must be unique across the platform</li>
            <li>• You can only be a member of one studio at a time</li>
            <li>• As the creator, you'll automatically become the studio owner</li>
            <li>• You can update your studio information anytime after creation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
