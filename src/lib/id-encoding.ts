/**
 * ID Encoding Utility
 * Handles encoding/decoding of IDs for secure API communication
 * Uses HMAC-SHA256 signature with Base62 encoding
 * 
 * NOTE: The actual encoding/decoding happens on the backend.
 * Frontend should pass encoded IDs as-is to the API.
 * This utility is for handling encoded IDs from API responses.
 */

export type EntityType = 
  | 'USER'
  | 'PLAN'
  | 'SUBSCRIPTION'
  | 'PROMO_CODE'
  | 'TOKEN_PACKAGE'
  | 'API_KEY'
  | 'JOB_APPLICATION'
  | 'GROUP'
  | 'PERMISSION'
  | 'CV'
  | 'NOTIFICATION'
  | 'INVOICE';

// Entity type prefixes (must match backend)
const ENTITY_PREFIXES: Record<EntityType, string> = {
  USER: 'U',
  PLAN: 'P',
  SUBSCRIPTION: 'S',
  PROMO_CODE: 'R',
  TOKEN_PACKAGE: 'T',
  API_KEY: 'K',
  JOB_APPLICATION: 'J',
  GROUP: 'G',
  PERMISSION: 'M',
  CV: 'C',
  NOTIFICATION: 'N',
  INVOICE: 'I',
};

/**
 * Check if an ID is encoded (starts with entity prefix)
 */
export function isEncodedId(id: string | number): boolean {
  if (typeof id === 'number') return false;
  if (!id || id.length < 2) return false;
  
  const prefix = id.charAt(0);
  return Object.values(ENTITY_PREFIXES).includes(prefix);
}

/**
 * Get entity type from encoded ID prefix
 */
export function getEntityTypeFromId(encodedId: string): EntityType | null {
  if (!encodedId || encodedId.length < 2) return null;
  
  const prefix = encodedId.charAt(0);
  for (const [type, p] of Object.entries(ENTITY_PREFIXES)) {
    if (p === prefix) {
      return type as EntityType;
    }
  }
  return null;
}

/**
 * Validate that an encoded ID has the expected entity type
 */
export function validateEncodedId(encodedId: string, expectedType: EntityType): boolean {
  const actualType = getEntityTypeFromId(encodedId);
  return actualType === expectedType;
}

/**
 * Helper to ensure an ID is always a string (for API calls)
 * If numeric ID is passed, it will throw an error since encoding
 * should only happen on the backend.
 */
export function ensureEncodedId(id: string | number, entityType: EntityType): string {
  if (typeof id === 'number') {
    throw new Error(`Expected encoded ${entityType} ID but got numeric ID. IDs should be encoded.`);
  }
  
  if (!validateEncodedId(id, entityType)) {
    // Allow backward compatibility - if it looks like a number string, warn but allow
    if (/^\d+$/.test(id)) {
      console.warn(`Legacy numeric ID detected for ${entityType}. Please update to use encoded IDs.`);
      return id;
    }
    throw new Error(`Invalid encoded ID format for ${entityType}`);
  }
  
  return id;
}
