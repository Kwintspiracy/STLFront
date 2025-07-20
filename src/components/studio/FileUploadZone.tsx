"use client";

import { useState, useRef, useEffect, DragEvent } from "react";
import { RiUploadCloud2Line, RiCloseLine, RiDragMove2Line, RiImageLine, RiStarLine, RiStarFill, RiGridLine, RiListUnordered, RiBox3Line } from "react-icons/ri";
import { useToast } from "@/context/ToastContext";

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  progress: number;
  url?: string;
  isUploading: boolean;
  error?: string;
  isMain?: boolean;
}

interface FileUploadZoneProps {
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  onFilesAdded: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onFileRemove: (id: string) => void;
  onFileReorder?: (files: UploadedFile[]) => void;
  onMainImageSelect?: (id: string) => void;
  onFileRename?: (id: string, newName: string) => void;
  label: string;
  fileType: "image" | "stl";
}

export default function FileUploadZone({
  accept,
  multiple = true,
  maxFiles,
  onFilesAdded,
  uploadedFiles,
  onFileRemove,
  onFileReorder,
  onMainImageSelect,
  onFileRename,
  label,
  fileType
}: FileUploadZoneProps) {
  const { showError, showWarning } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<{ index: number; position: 'before' | 'after' } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Clean up drag counter on unmount
  useEffect(() => {
    return () => {
      dragCounterRef.current = 0;
    };
  }, []);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Increment counter
    dragCounterRef.current++;
    
    // Check if dragging files (not reordering)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Decrement counter
    dragCounterRef.current--;
    
    // Only set isDragging to false if we've left the drop zone completely
    if (dragCounterRef.current === 0) {
      // Add a small delay to prevent flickering
      setTimeout(() => {
        if (dragCounterRef.current === 0) {
          setIsDragging(false);
        }
      }, 50);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Keep the drag state active
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0 && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset counter
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter files based on type
    const validFiles = files.filter(file => {
      if (fileType === "stl") {
        // Check if file is STL
        const isSTL = file.name.toLowerCase().endsWith('.stl');
        if (!isSTL) {
          console.warn(`Fichier rejeté: ${file.name} n'est pas un fichier STL`);
        }
        return isSTL;
      } else if (fileType === "image") {
        // Check if file is an image
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        const isImage = validImageTypes.includes(file.type.toLowerCase()) || 
                       /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
        if (!isImage) {
          console.warn(`Fichier rejeté: ${file.name} n'est pas une image`);
        }
        return isImage;
      }
      return true;
    });

    // Alert if some files were rejected
    if (validFiles.length < files.length) {
      const rejectedCount = files.length - validFiles.length;
      
      if (fileType === "stl") {
        if (rejectedCount === 1) {
          showError("Ce fichier n'est pas un fichier STL. Veuillez sélectionner uniquement des fichiers .stl");
        } else {
          showError(`${rejectedCount} fichiers ne sont pas des fichiers STL. Veuillez sélectionner uniquement des fichiers .stl`);
        }
      } else {
        if (rejectedCount === 1) {
          showError("Ce fichier n'est pas une image valide. Formats acceptés : JPG, PNG, GIF, WebP ou SVG");
        } else {
          showError(`${rejectedCount} fichiers ne sont pas des images valides. Formats acceptés : JPG, PNG, GIF, WebP ou SVG`);
        }
      }
    }

    // Check max files limit with valid files only
    if (maxFiles && uploadedFiles.length + validFiles.length > maxFiles) {
      const remaining = maxFiles - uploadedFiles.length;
      if (remaining === 0) {
        showWarning(`Limite atteinte ! Vous avez déjà ${maxFiles} fichiers. Veuillez en supprimer pour en ajouter de nouveaux.`);
      } else if (remaining === 1) {
        showWarning(`Vous ne pouvez ajouter qu'un seul fichier supplémentaire. Limite : ${maxFiles} fichiers au total`);
      } else {
        showWarning(`Vous ne pouvez ajouter que ${remaining} fichiers supplémentaires. Limite : ${maxFiles} fichiers au total`);
      }
      return;
    }

    // If no valid files, return early
    if (validFiles.length === 0) {
      return;
    }
    
    // Sort files by name if they have numeric patterns
    const sortedFiles = validFiles.sort((a, b) => {
      const aMatch = a.name.match(/(\d+)/);
      const bMatch = b.name.match(/(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return a.name.localeCompare(b.name);
    });
    
    onFilesAdded(sortedFiles);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverItem = (e: DragEvent<HTMLDivElement>, id: string, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (!draggedItem || draggedItem === id) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Determine if we're on the left or right half
    if (x < width / 2) {
      setDropPosition({ index, position: 'before' });
      setDragOverItem(null);
    } else if (x > width / 2) {
      setDropPosition({ index, position: 'after' });
      setDragOverItem(null);
    }
  };

  const handleDragLeaveItem = () => {
    setDragOverItem(null);
    setDropPosition(null);
  };

  const handleDropItem = (e: DragEvent<HTMLDivElement>, targetId: string, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem || !onFileReorder) return;

    const draggedIndex = uploadedFiles.findIndex(f => f.id === draggedItem);
    
    if (draggedIndex !== -1) {
      const newFiles = [...uploadedFiles];
      const [removed] = newFiles.splice(draggedIndex, 1);
      
      // Calculate the new index based on drop position
      let newIndex = targetIndex;
      if (dropPosition) {
        if (dropPosition.position === 'after') {
          newIndex = targetIndex + 1;
        }
        // Adjust index if dragging from before to after the same position
        if (draggedIndex < targetIndex) {
          newIndex--;
        }
      }
      
      newFiles.splice(newIndex, 0, removed);
      onFileReorder(newFiles);
    }

    setDraggedItem(null);
    setDragOverItem(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    setDropPosition(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-[#FDD811] bg-[#FDD811]/10 scale-[1.02]"
            : "border-[#2A2D30] hover:border-[#FDD811]/50"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <RiUploadCloud2Line className="w-12 h-12 mx-auto mb-4 text-gray-400 pointer-events-none" />
        <p className="text-gray-300 mb-2 pointer-events-none">
          Glissez et déposez vos {fileType === "stl" ? "fichiers STL" : "images"} ici
        </p>
        <p className="text-sm text-gray-500 pointer-events-none">
          ou <span className="text-[#FDD811] cursor-pointer">parcourez</span>
        </p>
        <p className="text-xs text-gray-600 mt-2 pointer-events-none">
          {fileType === "stl" 
            ? "Formats acceptés : .stl" 
            : "Formats acceptés : JPG, PNG, GIF, WebP, SVG"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* View Mode Toggle and Files List */}
      {uploadedFiles.length > 0 && (
        <>
          {/* View Mode Toggle and Info */}
          <div className="flex justify-between items-center mb-4">
            {/* Info about star */}
            {fileType === "image" && (
              <div className="flex items-center text-sm text-gray-400">
                <RiStarFill className="w-4 h-4 text-[#FDD811] mr-1.5" />
                <span>= Image de couverture</span>
              </div>
            )}
            
            {/* View Mode Toggle */}
            <div className="flex bg-[#131618] border border-[#2A2D30] rounded-lg p-1 ml-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-[#FDD811] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Vue grille"
              >
                <RiGridLine className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#FDD811] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Vue liste"
              >
                <RiListUnordered className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Files Display */}
          <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-2"}>
            {uploadedFiles.map((file, index) => (
              <div key={file.id} className="relative">
                {/* Drop indicator for between items */}
                {dropPosition && dropPosition.index === index && dropPosition.position === 'before' && (
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#FDD811] rounded-full z-10" />
                )}
                
                <div
                  draggable={!file.isUploading}
                  onDragStart={(e) => handleDragStart(e, file.id)}
                  onDragOver={(e) => handleDragOverItem(e, file.id, index)}
                  onDragLeave={handleDragLeaveItem}
                  onDrop={(e) => handleDropItem(e, file.id, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative bg-[#131618] border rounded-lg transition-all ${
                    !file.isUploading ? "cursor-move" : ""
                  } ${
                    draggedItem === file.id 
                      ? "opacity-50 scale-95 border-[#FDD811]" 
                      : dragOverItem === file.id 
                        ? "border-[#FDD811] scale-105 shadow-lg shadow-[#FDD811]/20" 
                        : "border-[#2A2D30]"
                  } ${
                    viewMode === 'grid' ? 'p-3' : 'p-3 flex items-center space-x-4'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      {/* File Preview */}
                      <div className="relative aspect-square mb-2 bg-[#1A1C21] rounded flex items-center justify-center overflow-hidden">
                        {fileType === "image" && file.url ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : fileType === "image" ? (
                          <RiImageLine className="w-8 h-8 text-gray-500" />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <RiBox3Line className="w-10 h-10 text-[#FDD811]" />
                            <span className="text-[10px] text-gray-500 mt-1">STL</span>
                          </div>
                        )}

                        {/* Remove Button */}
                        {!file.isUploading && (
                          <button
                            type="button"
                            onClick={() => onFileRemove(file.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded transition-colors"
                          >
                            <RiCloseLine className="w-4 h-4 text-white" />
                          </button>
                        )}

                        {/* Drag Handle */}
                        {!file.isUploading && onFileReorder && (
                          <div className="absolute top-1 left-1 p-1 bg-[#131618]/80 rounded">
                            <RiDragMove2Line className="w-4 h-4 text-gray-400" />
                          </div>
                        )}

                        {/* Main Image Selector for images */}
                        {fileType === "image" && onMainImageSelect && !file.isUploading && (
                          <button
                            type="button"
                            onClick={() => onMainImageSelect(file.id)}
                            className={`absolute bottom-1 left-1 p-1.5 rounded transition-all ${
                              file.isMain
                                ? "bg-[#FDD811] text-black"
                                : "bg-black/50 text-white hover:bg-black/70"
                            }`}
                            title={file.isMain ? "Image principale" : "Définir comme image principale"}
                          >
                            {file.isMain ? (
                              <RiStarFill className="w-3 h-3" />
                            ) : (
                              <RiStarLine className="w-3 h-3" />
                            )}
                          </button>
                        )}

                        {/* File number indicator */}
                        <div className="absolute top-1 right-8 bg-[#131618]/80 text-white text-xs px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </div>
                      </div>

                      {/* File Name / Progress Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          value={file.name}
                          readOnly={file.isUploading}
                          className="w-full bg-[#1A1C21] border border-[#2A2D30] text-white text-xs rounded px-2 py-1 pr-8 focus:outline-none focus:border-[#FDD811] transition-colors"
                          onChange={(e) => {
                            if (onFileRename && !file.isUploading) {
                              onFileRename(file.id, e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                        
                        {/* Progress Bar */}
                        {file.isUploading && (
                          <div
                            className="absolute bottom-0 left-0 h-full bg-[#FDD811]/20 rounded transition-all"
                            style={{ width: `${file.progress}%` }}
                          />
                        )}

                        {/* Progress Text */}
                        {file.isUploading && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#FDD811]">
                            {file.progress}%
                          </span>
                        )}
                      </div>

                      {/* Error Message */}
                      {file.error && (
                        <p className="text-xs text-red-400 mt-1">{file.error}</p>
                      )}
                    </>
                  ) : (
                    // List View
                    <>
                      {/* Drag Handle */}
                      {!file.isUploading && onFileReorder && (
                        <div className="p-2">
                          <RiDragMove2Line className="w-5 h-5 text-gray-400" />
                        </div>
                      )}

                      {/* File Preview - Smaller in list view */}
                      <div className="relative w-16 h-16 bg-[#1A1C21] rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                        {fileType === "image" && file.url ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : fileType === "image" ? (
                          <RiImageLine className="w-6 h-6 text-gray-500" />
                        ) : (
                          <RiBox3Line className="w-6 h-6 text-[#FDD811]" />
                        )}
                        
                        {/* File number indicator */}
                        <div className="absolute top-0 right-0 bg-[#131618] text-white text-xs px-1 rounded-bl">
                          #{index + 1}
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="relative">
                          <input
                            type="text"
                            value={file.name}
                            readOnly={file.isUploading}
                            className="w-full bg-[#1A1C21] border border-[#2A2D30] text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[#FDD811] transition-colors"
                            onChange={(e) => {
                              if (onFileRename && !file.isUploading) {
                                onFileRename(file.id, e.target.value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                          />
                          
                          {/* Progress Bar */}
                          {file.isUploading && (
                            <div
                              className="absolute bottom-0 left-0 h-full bg-[#FDD811]/20 rounded transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          )}
                        </div>
                        
                        {/* Error Message */}
                        {file.error && (
                          <p className="text-xs text-red-400 mt-1">{file.error}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {/* Progress Text */}
                        {file.isUploading && (
                          <span className="text-sm text-[#FDD811]">
                            {file.progress}%
                          </span>
                        )}

                        {/* Main Image Selector for images */}
                        {fileType === "image" && onMainImageSelect && !file.isUploading && (
                          <button
                            type="button"
                            onClick={() => onMainImageSelect(file.id)}
                            className={`p-2 rounded transition-all ${
                              file.isMain
                                ? "bg-[#FDD811] text-black"
                                : "bg-[#1A1C21] text-gray-400 hover:text-white"
                            }`}
                            title={file.isMain ? "Image principale" : "Définir comme image principale"}
                          >
                            {file.isMain ? (
                              <RiStarFill className="w-4 h-4" />
                            ) : (
                              <RiStarLine className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Remove Button */}
                        {!file.isUploading && (
                          <button
                            type="button"
                            onClick={() => onFileRemove(file.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <RiCloseLine className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Drop indicator for after last item */}
                {dropPosition && dropPosition.index === index && dropPosition.position === 'after' && index === uploadedFiles.length - 1 && (
                  <div className="absolute -right-2 top-0 bottom-0 w-1 bg-[#FDD811] rounded-full z-10" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
