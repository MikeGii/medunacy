// src/utils/sanitization.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (input: string): string => {
  // Basic sanitization for general inputs
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const sanitizeHTML = (html: string): string => {
  // For rich text content that needs some HTML
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

export const sanitizeForumContent = (content: string): string => {
  // Special sanitization for forum posts
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });
};

// Prevent SQL injection in search queries
export const sanitizeSearchQuery = (query: string): string => {
  // Remove special characters that could be used in SQL injection
  return query.replace(/[%_'"\\]/g, '');
};