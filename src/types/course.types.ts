export interface CourseCategory {
  id: string;
  name: string;
  name_et: string;
  name_uk: string;
  created_at: string;
  created_by: string | null;
}

export interface Course {
  id: string;
  name: string;
  provider: string;
  description: string | null;
  category_id: string | null;
  start_date: string;
  end_date: string | null;
  location_type: "online" | "hybrid" | "in_person";
  course_type: "paid" | "free";
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_premium: boolean;
  // Computed field
  status?: "upcoming" | "past";
  // Joined data
  category?: CourseCategory;
  enrollment_count?: number;
  is_enrolled?: boolean;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  // Joined data
  course?: Course;
  user?: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export type CourseFormData = Omit<
  Course,
  | "id"
  | "created_at"
  | "updated_at"
  | "created_by"
  | "status"
  | "category"
  | "enrollment_count"
  | "is_enrolled"
>;
export type CategoryFormData = Omit<
  CourseCategory,
  "id" | "created_at" | "created_by"
>;
