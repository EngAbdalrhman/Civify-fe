/**
 * API Key Generation and Management Utilities
 * Handles API key generation, hashing, and masking
 */

/**
 * Generate a random API key
 * Format: hicv_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (40 chars total)
 */
export function generateApiKey(): string {
  const prefix = "hicv_";
  const length = 35; // Total length will be 40 with prefix
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let key = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    key += chars[randomValues[i] % chars.length];
  }

  return prefix + key;
}

/**
 * Hash an API key using SHA-256
 * @param apiKey - The API key to hash
 * @returns Promise<string> - The hashed API key in hex format
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Mask an API key for display
 * Shows first 8 and last 4 characters
 * @param apiKey - The API key to mask
 * @returns string - The masked API key
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length < 12) return apiKey;
  const start = apiKey.substring(0, 8);
  const end = apiKey.substring(apiKey.length - 4);
  return `${start}...${end}`;
}

/**
 * Validate API key format
 * @param apiKey - The API key to validate
 * @returns boolean - True if valid format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return apiKey.startsWith("hicv_") && apiKey.length === 40;
}

