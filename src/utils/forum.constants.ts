export const FORUM_CONSTANTS = {
  // Pagination
  POSTS_PER_PAGE: 10,
  COMMENTS_PER_PAGE: 20,
  
  // Validation
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 10000,
  MIN_CATEGORY_NAME_LENGTH: 2,
  MAX_CATEGORY_NAME_LENGTH: 50,
  
  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Debounce
  SEARCH_DEBOUNCE_MS: 300,
  
  // Error message keys (for translations)
  ERROR_KEYS: {
    FETCH_POSTS: 'forum.errors.fetch_posts',
    CREATE_POST: 'forum.errors.create_post',
    UPDATE_POST: 'forum.errors.update_post',
    DELETE_POST: 'forum.errors.delete_post',
    FETCH_COMMENTS: 'forum.errors.fetch_comments',
    CREATE_COMMENT: 'forum.errors.create_comment',
    UPDATE_COMMENT: 'forum.errors.update_comment',
    DELETE_COMMENT: 'forum.errors.delete_comment',
    UNAUTHORIZED: 'forum.errors.unauthorized',
  }
} as const;