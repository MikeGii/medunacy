"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ForumPost, ForumCategory } from "@/types/forum.types";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";

// State interface
interface ForumState {
  posts: ForumPost[];
  categories: ForumCategory[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  postsCache: Map<string, { data: ForumPost[]; timestamp: number }>;
  // Pagination state
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasMore: boolean;
}

// Action types
type ForumAction =
  | { type: "SET_POSTS"; payload: ForumPost[] }
  | { type: "SET_CATEGORIES"; payload: ForumCategory[] }
  | { type: "SET_SELECTED_CATEGORY"; payload: string | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_POST"; payload: ForumPost }
  | { type: "DELETE_POST"; payload: string }
  | { type: "ADD_POST"; payload: ForumPost }
  | { type: "CACHE_POSTS"; payload: { key: string; data: ForumPost[] } }
  | { type: "CLEAR_CACHE" }
  // Pagination actions
  | {
      type: "SET_PAGINATION";
      payload: {
        currentPage: number;
        totalPages: number;
        totalPosts: number;
        hasMore: boolean;
      };
    }
  | { type: "SET_PAGE"; payload: number }
  | { type: "RESET_PAGINATION" };

// Initial state
const initialState: ForumState = {
  posts: [],
  categories: [],
  selectedCategory: null,
  searchQuery: "",
  isLoading: false,
  error: null,
  postsCache: new Map(),
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalPosts: 0,
  hasMore: false,
};

// Context
const ForumContext = createContext<
  | {
      state: ForumState;
      dispatch: React.Dispatch<ForumAction>;
    }
  | undefined
>(undefined);

// Reducer function
function forumReducer(state: ForumState, action: ForumAction): ForumState {
  switch (action.type) {
    case "SET_POSTS":
      return { ...state, posts: action.payload };

    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };

    case "SET_SELECTED_CATEGORY":
      return {
        ...state,
        selectedCategory: action.payload,
        currentPage: 1, // Reset page when category changes
      };

    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
        currentPage: 1, // Reset page when search changes
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "UPDATE_POST":
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.payload.id ? action.payload : post
        ),
      };

    case "DELETE_POST":
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
        totalPosts: Math.max(0, state.totalPosts - 1),
      };

    case "ADD_POST":
      return {
        ...state,
        posts: [action.payload, ...state.posts].slice(
          0,
          FORUM_CONSTANTS.POSTS_PER_PAGE
        ),
        totalPosts: state.totalPosts + 1,
      };

    case "CACHE_POSTS":
      const newCache = new Map(state.postsCache);
      newCache.set(action.payload.key, {
        data: action.payload.data,
        timestamp: Date.now(),
      });
      return { ...state, postsCache: newCache };

    case "CLEAR_CACHE":
      return {
        ...state,
        postsCache: new Map(),
      };

    case "SET_PAGINATION":
      return {
        ...state,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        totalPosts: action.payload.totalPosts,
        hasMore: action.payload.hasMore,
      };

    case "SET_PAGE":
      return {
        ...state,
        currentPage: action.payload,
      };

    case "RESET_PAGINATION":
      return {
        ...state,
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        hasMore: false,
      };

    default:
      return state;
  }
}

// Provider component
export function ForumProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(forumReducer, initialState);
  const pathname = usePathname();
  const _locale = pathname.startsWith("/ukr") ? "ukr" : "et";

  return (
    <ForumContext.Provider value={{ state, dispatch }}>
      {children}
    </ForumContext.Provider>
  );
}

// Custom hook to use the Forum context
export function useForumContext() {
  const context = useContext(ForumContext);
  if (context === undefined) {
    throw new Error("useForumContext must be used within a ForumProvider");
  }
  return context;
}
