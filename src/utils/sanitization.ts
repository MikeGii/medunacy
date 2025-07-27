// src/utils/sanitization.ts
import DOMPurify from "isomorphic-dompurify";

/**
 * Basic input sanitization for form fields (names, titles, etc.)
 * Removes all HTML tags and potentially dangerous content
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  // First, decode any HTML entities to prevent double encoding
  const decoded = input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Remove all HTML tags and dangerous content
  const sanitized = DOMPurify.sanitize(decoded, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content of removed tags
  });

  // Additional cleanup for common XSS patterns
  return sanitized
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
};

/**
 * Sanitize content that may contain HTML (like rich text editors)
 * Allows basic formatting tags
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return "";

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "u",
      "s",
      "strike",
      "p",
      "br",
      "hr",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"], // Flat array instead of object
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"], // Allow target attribute
    FORCE_BODY: true,
  });
};

/**
 * Special sanitization for forum content that supports Markdown
 * This should be applied AFTER Markdown is converted to HTML
 */
export const sanitizeForumContent = (content: string): string => {
  if (!content) return "";

  // For Markdown content, we typically want to:
  // 1. Let the user write in Markdown
  // 2. Convert Markdown to HTML (done elsewhere)
  // 3. Sanitize the resulting HTML

  // Create a hook to add rel="noopener noreferrer" to external links
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    // Set external links to open in new tab with security
    if (node.tagName === "A") {
      if (node.hasAttribute("href")) {
        const href = node.getAttribute("href") || "";
        // Check if it's an external link
        if (href.startsWith("http://") || href.startsWith("https://")) {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        }
      }
    }
  });

  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      // Text formatting
      "b",
      "i",
      "em",
      "strong",
      "u",
      "s",
      "strike",
      "code",
      "kbd",
      // Structural elements
      "p",
      "br",
      "hr",
      "div",
      "span",
      // Headings
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      // Lists
      "ul",
      "ol",
      "li",
      // Links
      "a",
      // Quotes and code blocks
      "blockquote",
      "pre",
      // Tables (if you support them in Markdown)
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      // Images (if you want to allow them)
      // 'img',
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "title",
      "class",
      // 'src', 'alt', 'width', 'height', // If allowing images
    ],
    // Ensure external links open in new tab with security
    SANITIZE_DOM: true,
    ADD_ATTR: ["target", "rel"],
    FORCE_BODY: true,
    // Handle data URIs
    ALLOW_DATA_ATTR: false,
    // Ensure proper link handling
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });

  // Remove the hook after use to avoid affecting other sanitizations
  DOMPurify.removeHook("afterSanitizeAttributes");

  return sanitized;
};

/**
 * Sanitize Markdown content BEFORE converting to HTML
 * This prevents Markdown injection attacks
 */
export const sanitizeMarkdown = (markdown: string): string => {
  if (!markdown) return "";

  // Remove potentially dangerous Markdown patterns
  return (
    markdown
      // Remove HTML tags that might be in the Markdown
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      // Remove javascript: links in Markdown
      .replace(/\[([^\]]+)\]\(javascript:[^)]+\)/gi, "[$1](#)")
      // Remove event handlers that might slip through
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      // Keep the content readable
      .trim()
  );
};

/**
 * Sanitize search queries to prevent SQL injection
 * Note: You should still use parameterized queries in your backend
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return "";

  // Remove SQL meta-characters and keywords
  return (
    query
      // Remove SQL wildcards and escape characters
      .replace(/[%_\\]/g, "")
      // Remove quotes that could break out of strings
      .replace(/['"`]/g, "")
      // Remove SQL comment indicators
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "")
      // Remove common SQL keywords (case-insensitive)
      .replace(
        /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi,
        ""
      )
      // Remove null bytes
      .replace(/\0/g, "")
      // Trim and collapse multiple spaces
      .trim()
      .replace(/\s+/g, " ")
  );
};

/**
 * Sanitize filename for uploads
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return "";

  // Get the extension
  const lastDotIndex = filename.lastIndexOf(".");
  const name =
    lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";

  // Sanitize the name part
  const sanitizedName = name
    // Remove any non-alphanumeric characters except dash and underscore
    .replace(/[^a-zA-Z0-9\-_]/g, "_")
    // Remove multiple underscores
    .replace(/_+/g, "_")
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, "")
    // Limit length
    .substring(0, 50);

  // Sanitize extension
  const sanitizedExt = ext.replace(/[^a-zA-Z0-9.]/g, "").substring(0, 10);

  return sanitizedName + sanitizedExt;
};

/**
 * Create a safe excerpt from content
 */
export const createSafeExcerpt = (
  content: string,
  maxLength: number = 150
): string => {
  // First sanitize
  const safe = sanitizeInput(content);

  // Then truncate
  if (safe.length <= maxLength) return safe;

  // Try to break at a word boundary
  const truncated = safe.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
};

// Export type for sanitization options
export type SanitizationType =
  | "input"
  | "html"
  | "forum"
  | "markdown"
  | "search"
  | "filename";

/**
 * Universal sanitize function that picks the right sanitizer
 */
export const sanitize = (
  content: string,
  type: SanitizationType = "input"
): string => {
  switch (type) {
    case "input":
      return sanitizeInput(content);
    case "html":
      return sanitizeHTML(content);
    case "forum":
      return sanitizeForumContent(content);
    case "markdown":
      return sanitizeMarkdown(content);
    case "search":
      return sanitizeSearchQuery(content);
    case "filename":
      return sanitizeFilename(content);
    default:
      return sanitizeInput(content); // Safest default
  }
};
