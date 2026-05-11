/**
 * Hashes a PIN using SHA-256.
 * @param {string} pin - The PIN to hash.
 * @returns {Promise<string>} The hex-encoded SHA-256 hash.
 */
export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
