import { Tag } from '@/types/product';
import { createTag } from '@/lib/api/tags';

export interface ProcessedTags {
  tagIds: number[];
  errors: string[];
}

/**
 * Traite les tags sélectionnés en créant les nouveaux tags et retournant les IDs finaux
 * @param selectedTags - Liste des tags sélectionnés (incluant les temporaires)
 * @returns Promise avec les IDs des tags et les erreurs éventuelles
 */
export async function processTagsForSubmission(selectedTags: Tag[]): Promise<ProcessedTags> {
  const tagIds: number[] = [];
  const errors: string[] = [];

  for (const tag of selectedTags) {
    try {
      // Si c'est un tag temporaire (nouveau), le créer
      if (tag.id < 0 || (tag as any).isTemporary) {
        console.log(`Creating new tag: ${tag.name}`);
        const result = await createTag(tag.name);
        tagIds.push(result.tag.id);
        console.log(`Created tag with ID: ${result.tag.id}`);
      } else {
        // Tag existant, utiliser son ID
        tagIds.push(tag.id);
      }
    } catch (error) {
      console.error(`Error processing tag ${tag.name}:`, error);
      errors.push(`Erreur lors de la création du tag "${tag.name}": ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  return { tagIds, errors };
}

/**
 * Vérifie si un tag est temporaire (nouveau, pas encore créé en base)
 * @param tag - Le tag à vérifier
 * @returns true si le tag est temporaire
 */
export function isTemporaryTag(tag: Tag): boolean {
  return tag.id < 0 || (tag as any).isTemporary === true;
}

/**
 * Sépare les tags temporaires des tags existants
 * @param tags - Liste des tags
 * @returns Objet avec les tags temporaires et existants séparés
 */
export function separateTemporaryTags(tags: Tag[]): { temporary: Tag[]; existing: Tag[] } {
  const temporary: Tag[] = [];
  const existing: Tag[] = [];

  tags.forEach(tag => {
    if (isTemporaryTag(tag)) {
      temporary.push(tag);
    } else {
      existing.push(tag);
    }
  });

  return { temporary, existing };
}
