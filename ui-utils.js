/**
 * Shared UI Utilities for Freebie
 */

/**
 * Shows an error message in the specified element.
 * @param {string|HTMLElement} elOrId - The element or its ID.
 * @param {string} msg - The error message to display.
 */
export function showError(elOrId, msg) {
  const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  el.style.display = 'block';
}

/**
 * Hides an error message in the specified element.
 * @param {string|HTMLElement} elOrId - The element or its ID.
 */
export function hideError(elOrId) {
  const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
  el.style.display = 'none';
}

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param {string} code - Firebase error code.
 * @returns {string} - Friendly error message.
 */
export function friendlyError(code) {
  const map = {
    'auth/user-not-found':      'No account found with this email.',
    'auth/wrong-password':      'Incorrect password.',
    'auth/invalid-credential':  'Incorrect email or password.',
    'auth/email-already-in-use':'An account with this email already exists.',
    'auth/weak-password':       'Password must be at least 6 characters.',
    'auth/invalid-email':       'Please enter a valid email address.',
    'auth/too-many-requests':   'Too many attempts. Try again in a few minutes.',
    'auth/popup-closed-by-user':'Google sign-in was cancelled.'
  };
  return map[code] || 'Something went wrong. Please try again.';
}
