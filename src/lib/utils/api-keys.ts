/**
 * API Key Generation and Management Utilities
 * Handles API key generation, hashing, and masking
 */



/**
 * Mask an API key for display
 * Shows first 8 and last 4 characters
 * @param apiKey - The API key to mask
 * @returns string - The masked API key
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey?.length < 12) return apiKey;
  const start = apiKey?.substring(0, 8);
  const end = apiKey?.substring(apiKey?.length - 4);
  return `${start}...${end}`;
}

/**
 * Validate API key format
 * @param apiKey - The API key to validate
 * @returns boolean - True if valid format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return apiKey.startsWith("cv-fy-") && apiKey.length === 40;
}

