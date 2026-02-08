// eslint-disable-next-line @typescript-eslint/no-require-imports
const DOMPurify = require('dompurify');
import { JSDOM } from 'jsdom';

// Create JSDOM instance and extract window
// JSDOM is a Node.js library that creates a DOM environment
const { window } = new JSDOM('');
const purify = DOMPurify(window as unknown as Window);

/**
 * Sanitize user input to prevent XSS attacks
 * Removes all HTML tags and script content, keeping only plain text
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags and script content, keep only text
  return purify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content but remove tags
  });
}

/**
 * Sanitize text for display (allows basic formatting)
 */
export function sanitizeForDisplay(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return purify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}
