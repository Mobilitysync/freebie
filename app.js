/**
 * Freebie - Deal Tracker
 * Common utility functions and constants.
 */

console.log("Freebie - Deal Tracker loaded.");

/**
 * Formats a date string into a readable format.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD).
 * @param {boolean} [isIndianFormat=true] - Whether to use Indian locale format.
 * @returns {string} Formatted date.
 */
export function formatDate(dateStr, isIndianFormat = true) {
  if (!dateStr) return isIndianFormat ? 'No deadline' : '—';

  if (isIndianFormat) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } else {
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
  }
}

/**
 * Formats a number as Indian currency (INR).
 * @param {number|string} amount - The amount to format.
 * @returns {string} Formatted currency string.
 */
export function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/**
 * Safely truncates text and adds an ellipsis if it exceeds the limit.
 * @param {string} str - The text to truncate.
 * @param {number} [limit=60] - Character limit.
 * @returns {string} Truncated text.
 */
export function safeText(str, limit = 60) {
  if (!str) return 'Untitled work';
  return str.length > limit ? str.substring(0, limit) + '…' : str;
}

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param {string} code - Firebase error code.
 * @returns {string} Friendly error message.
 */
export function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.'
  };
  return map[code] || 'Something went wrong. Please try again.';
}
