/**
 * Interface pour les fichiers uploadés (base commune)
 */
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  progress: number;
  url?: string;
  isUploading: boolean;
  error?: string;
  isMain?: boolean;
}

/**
 * Interface étendue pour les fichiers STL avec support upload GCS
 */
export interface UploadedSTLFile extends UploadedFile {
  object_key?: string;        // Clé GCS retournée par l'API
  uploadComplete: boolean;    // Upload terminé avec succès
  uploadError?: string;       // Erreur spécifique à l'upload GCS
  fileSize?: number;          // Taille du fichier en bytes
  fileSizeDisplay?: string;   // Taille formatée pour affichage
}


/**
 * État global des uploads pour un formulaire
 */
export interface UploadState {
  images: UploadedFile[];
  stlFiles: UploadedSTLFile[];
  hasUploadsInProgress: boolean;
  totalFiles: number;
  completedFiles: number;
}

/**
 * Callbacks pour les événements d'upload
 */
export interface UploadCallbacks {
  onProgress?: (fileId: string, progress: number) => void;
  onComplete?: (fileId: string, objectKey: string) => void;
  onError?: (fileId: string, error: string) => void;
  onRemove?: (fileId: string) => void;
}

/**
 * Configuration pour l'upload STL
 */
export interface STLUploadConfig {
  studioId: number;
  maxFiles?: number;
  maxFileSize?: number; // en bytes
  allowedExtensions?: string[];
  simultaneousUploads?: number;
}

/**
 * Résultat d'un upload STL
 */
export interface STLUploadResult {
  success: boolean;
  objectKey?: string;
  fileName: string;
  fileSize: number;
  error?: string;
}

/**
 * Données pour la création de produit avec STL
 */
export interface ProductSTLData {
  file_path: string;  // object_key de GCS
  title: string;      // nom du fichier sans extension
  description?: string;
}
