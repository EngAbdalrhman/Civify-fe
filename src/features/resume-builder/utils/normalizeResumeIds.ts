import { v4 as uuidv4 } from "uuid";
import { ResumeData } from "@/features/upload-cv/types";

/**
 * Ensures that all items across all sections in the resume have globally unique identifiers.
 * This resolves issues with React keys, duplicate sortable objects, and state updates
 * when data loaded from the backend or AI pipeline has duplicate IDs within or across sections.
 *
 * It returns a new immutable copy of the ResumeData.
 */
export function ensureUniqueSectionItemIds(data: ResumeData | null): ResumeData | null {
  if (!data) return data;
  if (!data.sections) return data;

  const seenIds = new Set<string>();

  const newSections = data.sections.map((section) => {
    if (!section.items || section.items.length === 0) {
      return section;
    }

    const newItems = section.items.map((item) => {
      // If the item has no ID or the ID has already been seen, assign a new UUID
      if (!item.id || seenIds.has(item.id)) {
        const newId = `item_${uuidv4()}`;
        seenIds.add(newId);
        return { ...item, id: newId };
      }

      // Track the valid ID
      seenIds.add(item.id);
      return item;
    });

    return {
      ...section,
      items: newItems,
    };
  });

  return {
    ...data,
    sections: newSections,
  };
}
