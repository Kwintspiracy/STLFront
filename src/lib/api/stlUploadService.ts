import { apiRequest } from "./httpClient";
import { PRODUCT_ENDPOINTS } from "./config";
import { getAccessToken, isTokenExpired } from "@/lib/utils/tokenService";

/**
 * Interface pour la requête de génération d'URLs signées
 */
export interface STLUploadRequest {
  studio_id: number;
  files: {
    filename: string;
    content_type: string;
  }[];
}

/**
 * Interface pour la réponse des URLs signées
 */
export interface SignedUploadResponse {
  urls: {
    filename: string;
    upload_url: string;
    file_path: string;
  }[];
}

/**
 * Interface pour le suivi du progrès d'upload
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Génère des URLs signées pour l'upload direct vers GCS
 */
export async function generateSignedUrls(
  studioId: number,
  files: File[]
): Promise<SignedUploadResponse> {
  // Log des paramètres d'entrée
  console.log('🔗 Generating signed URLs for files:', files.map(f => f.name));
  console.log('📊 Studio ID:', studioId, '(type:', typeof studioId, ')');
  console.log('📁 Files details:', files.map(f => ({
    name: f.name,
    type: f.type,
    size: f.size
  })));

  const requestData: STLUploadRequest = {
    studio_id: studioId,
    files: files.map(file => ({
      filename: file.name,
      content_type: file.type || "model/stl"
    }))
  };

  // Log de l'authentification
  const token = getAccessToken();
  console.log('🔑 Access Token:', token ? 'Present' : 'Missing');
  if (token) {
    console.log('🔑 Token expired:', isTokenExpired(token));
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
  }

  // Log de la requête finale
  console.log('🌐 Using endpoint:', PRODUCT_ENDPOINTS.STL_UPLOAD_URLS);
  console.log('📤 Request data:', JSON.stringify(requestData, null, 2));
  
  try {
    const response = await apiRequest.post<SignedUploadResponse>(
      PRODUCT_ENDPOINTS.STL_UPLOAD_URLS,
      requestData
    );

    console.log('✅ Request successful, checking response structure...');
    
    // Vérification de la structure de la réponse
    if (!response || !response.data) {
      console.error('❌ No response data received');
      throw new Error('Invalid response: no data received');
    }

    if (!response.data.urls || !Array.isArray(response.data.urls)) {
      console.error('❌ Response structure invalid:', response.data);
      throw new Error('Invalid response: urls array missing or invalid');
    }

    console.log('✅ Received signed URLs:', response.data.urls.length);
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Request failed - analyzing error...');
    // Log détaillé de l'erreur
    console.error('❌ Error generating signed URLs:');
    
    // Type guards for error handling
    const isAxiosError = (err: unknown): err is {
      response?: {
        status: number;
        statusText: string;
        data: unknown;
        headers: unknown;
        config?: { url?: string; method?: string; headers?: unknown };
      };
      request?: unknown;
      message?: string;
      config?: { url?: string; method?: string; headers?: unknown; data?: unknown };
    } => {
      return typeof err === 'object' && err !== null && ('response' in err || 'request' in err || 'config' in err);
    };
    
    const isErrorWithMessage = (err: unknown): err is Error => {
      return err instanceof Error;
    };
    
    if (isAxiosError(error) && error.response) {
      // Erreur HTTP avec réponse du serveur
      console.error('HTTP Error Response:');
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Request URL:', error.response.config?.url);
      console.error('Request Method:', error.response.config?.method);
      console.error('Request Headers Sent:', JSON.stringify(error.response.config?.headers, null, 2));
    } else if (isAxiosError(error) && error.request) {
      // Erreur réseau - requête envoyée mais pas de réponse
      console.error('Network Error - No response received:');
      console.error('Request:', error.request);
      if (isErrorWithMessage(error)) {
        console.error('Message:', error.message);
      }
    } else {
      // Erreur dans la configuration de la requête
      console.error('Request Configuration Error:');
      if (isErrorWithMessage(error)) {
        console.error('Message:', error.message);
      }
    }
    
    if (isAxiosError(error) && error.config) {
      console.error('Request Config:', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data
      });
    }
    
    // Test de connectivité avec OPTIONS
    console.error('🌐 Testing endpoint accessibility...');
    try {
      const testResponse = await fetch(PRODUCT_ENDPOINTS.STL_UPLOAD_URLS, {
        method: 'OPTIONS'
      });
      console.error('OPTIONS request status:', testResponse.status);
    } catch (fetchError) {
      console.error('Fetch test failed:', fetchError);
    }

    // Test direct avec fetch() pour contourner axios
    console.error('🔍 Testing direct POST with fetch...');
    try {
      const directResponse = await fetch(PRODUCT_ENDPOINTS.STL_UPLOAD_URLS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(requestData)
      });
      
      console.error('Direct POST Status:', directResponse.status);
      console.error('Direct POST Status Text:', directResponse.statusText);
      console.error('Direct POST Headers:', Object.fromEntries(directResponse.headers));
      
      const responseText = await directResponse.text();
      console.error('Direct POST Response Text:', responseText);
      
      try {
        const responseJson = JSON.parse(responseText);
        console.error('Direct POST Response JSON:', responseJson);
      } catch {
        console.error('Direct POST Response is not valid JSON');
      }
    } catch (directError) {
      console.error('Direct POST failed:', directError);
    }
    
    throw error;
  }
}

/**
 * Upload un fichier vers GCS en utilisant l'URL signée
 */
export async function uploadToGCS(
  uploadUrl: string,
  file: File,
  headers: { [key: string]: string },
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Configuration du suivi de progrès
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });
    }

    // Gestion de la fin d'upload
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('✅ Upload successful for:', file.name);
        resolve();
      } else {
        console.error('❌ Upload failed:', xhr.status, xhr.statusText);
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    // Gestion des erreurs
    xhr.addEventListener('error', () => {
      console.error('❌ Upload error for:', file.name);
      reject(new Error('Upload failed due to network error'));
    });

    // Gestion de l'annulation
    xhr.addEventListener('abort', () => {
      console.log('⚠️ Upload aborted for:', file.name);
      reject(new Error('Upload was aborted'));
    });

    // Configuration et envoi de la requête
    xhr.open('PUT', uploadUrl);
    
    // Ajout des headers requis
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    console.log('🚀 Starting upload for:', file.name, 'Size:', file.size);
    xhr.send(file);
  });
}

/**
 * Upload multiple fichiers STL de manière simultanée
 */
export async function uploadMultipleSTLFiles(
  studioId: number,
  files: File[],
  onFileProgress?: (fileIndex: number, progress: UploadProgress) => void,
  onFileComplete?: (fileIndex: number, objectKey: string) => void,
  onFileError?: (fileIndex: number, error: string) => void
): Promise<{ objectKey: string; fileName: string }[]> {
  
  console.log('📦 Starting batch upload for', files.length, 'files');
  
  // Étape 1: Générer les URLs signées
  const signedUrls = await generateSignedUrls(studioId, files);
  
  if (signedUrls.urls.length !== files.length) {
    throw new Error('Mismatch between files and signed URLs');
  }

  // Étape 2: Upload tous les fichiers en parallèle
  const uploadPromises = files.map(async (file, index) => {
    const uploadInfo = signedUrls.urls[index];
    
    // Générer les headers côté frontend puisque le backend ne les fournit pas
    const headers = {
      'Content-Type': file.type || 'model/stl'
    };
    
    try {
      await uploadToGCS(
        uploadInfo.upload_url,
        file,
        headers,
        (progress) => {
          onFileProgress?.(index, progress);
        }
      );
      
      console.log('✅ File upload complete:', file.name, '→', uploadInfo.file_path);
      onFileComplete?.(index, uploadInfo.file_path);
      
      return {
        objectKey: uploadInfo.file_path,
        fileName: uploadInfo.filename
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      console.error('❌ File upload failed:', file.name, errorMessage);
      onFileError?.(index, errorMessage);
      throw error;
    }
  });

  // Attendre que tous les uploads se terminent
  const results = await Promise.all(uploadPromises);
  console.log('🎉 All uploads completed successfully');
  
  return results;
}

/**
 * Supprime un fichier uploadé (pour l'instant, juste pour le frontend)
 * Note: La suppression côté GCS pourrait être ajoutée plus tard si nécessaire
 */
export async function deleteUploadedFile(objectKey: string): Promise<void> {
  console.log('🗑️ Marking file for deletion:', objectKey);
  // Pour l'instant, on ne fait rien côté serveur
  // Les fichiers temporaires seront nettoyés automatiquement par le backend
  // après expiration de la session
}

/**
 * Valide qu'un fichier est bien un fichier STL
 */
export function validateSTLFile(file: File): boolean {
  // Vérification de l'extension
  const isSTLExtension = file.name.toLowerCase().endsWith('.stl');
  
  // Vérification du type MIME (peut être vide pour les fichiers STL)
  const isSTLMimeType = file.type === 'model/stl' || 
                       file.type === 'application/octet-stream' || 
                       file.type === '';

  return isSTLExtension && isSTLMimeType;
}

/**
 * Formate la taille d'un fichier pour l'affichage
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
