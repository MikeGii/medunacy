// Base user type for forum
export interface ForumUser {
  id: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'doctor' | 'admin';
}

// Category types
export interface ForumCategory {
  id: string;
  name: string;
  created_by?: string;
  created_at?: string;
  post_count?: number;
}

// Post types
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  category_id: string;
  is_deleted: boolean;
  user: ForumUser;
  category: ForumCategory;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

// Comment types
export interface ForumComment {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  post_id: string;
  user_id: string;
  is_deleted: boolean;
  user: ForumUser;
  likes_count: number;
  user_has_liked: boolean;
}