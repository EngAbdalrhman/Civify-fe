/**
 * License Key and API Key Generation Utilities
 */

// Character set excluding similar-looking characters (I, O, 0, 1)
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PREFIX = "HICV";
const NUM_SEGMENTS = 3;
const SEGMENT_LENGTH = 4;

/**
 * Generate a license key in the format: HICV-XXXX-XXXX-XXXX
 * @returns A new license key
 */
export function generateLicenseKey(): string {
  const segments: string[] = [];
  
  for (let i = 0; i < NUM_SEGMENTS; i++) {
    let segment = "";
    for (let j = 0; j < SEGMENT_LENGTH; j++) {
      const randomIndex = Math.floor(Math.random() * CHARSET.length);
      segment += CHARSET[randomIndex];
    }
    segments.push(segment);
  }
  
  return `${PREFIX}-${segments.join("-")}`;
}

/**
 * Validate license key format
 * @param key - The license key to validate
 * @returns True if the format is valid
 */
export function isValidLicenseKeyFormat(key: string): boolean {
  const pattern = new RegExp(`^${PREFIX}-[${CHARSET}]{${SEGMENT_LENGTH}}-[${CHARSET}]{${SEGMENT_LENGTH}}-[${CHARSET}]{${SEGMENT_LENGTH}}$`);
  return pattern.test(key);
}

/**
 * Generate an API key in the format: hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 * @returns A new API key
 */
export function generateApiKey(): string {
  const API_KEY_LENGTH = 32;
  const API_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  
  let randomPart = "";
  for (let i = 0; i < API_KEY_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * API_CHARSET.length);
    randomPart += API_CHARSET[randomIndex];
  }
  
  return `hicv_live_${randomPart}`;
}

/**
 * Hash an API key using SHA-256
 * @param apiKey - The API key to hash
 * @returns The hashed API key
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Verify an API key against its hash
 * @param apiKey - The API key to verify
 * @param hash - The hash to verify against
 * @returns True if the API key matches the hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  const computedHash = await hashApiKey(apiKey);
  return computedHash === hash;
}

/**
 * Mask an API key for display (show only first and last 4 characters)
 * @param apiKey - The API key to mask
 * @returns The masked API key
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) return apiKey;
  
  const prefix = apiKey.substring(0, 10); // "hicv_live_"
  const firstPart = apiKey.substring(10, 14);
  const lastPart = apiKey.substring(apiKey.length - 4);
  const maskedMiddle = "*".repeat(apiKey.length - 18);
  
  return `${prefix}${firstPart}${maskedMiddle}${lastPart}`;
}

/**
 * Get a preview of the API key (first 16 characters)
 * @param apiKey - The API key
 * @returns The preview
 */
export function getApiKeyPreview(apiKey: string): string {
  return apiKey.substring(0, Math.min(16, apiKey.length)) + "...";
}

