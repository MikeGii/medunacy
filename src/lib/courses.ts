import { supabase } from "./supabase";
import { Course, CourseCategory, CourseEnrollment } from "@/types/course.types";

// Helper function to calculate course status
export function getCourseStatus(startDate: string): "upcoming" | "past" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const courseStartDate = new Date(startDate);
  courseStartDate.setHours(0, 0, 0, 0);

  return courseStartDate > today ? "upcoming" : "past";
}

// Category functions
export async function getCourseCategories() {
  const { data, error } = await supabase
    .from("course_categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data as CourseCategory[];
}

export async function createCourseCategory(
  category: Omit<CourseCategory, "id" | "created_at" | "created_by">
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("course_categories")
    .insert({
      ...category,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CourseCategory;
}

export async function updateCourseCategory(
  id: string,
  updates: Partial<Omit<CourseCategory, "id" | "created_at" | "created_by">>
) {
  const { data, error } = await supabase
    .from("course_categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as CourseCategory;
}

export async function deleteCourseCategory(id: string) {
  const { error } = await supabase
    .from("course_categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Course functions
export async function getCourses(filters?: {
  status?: "upcoming" | "past";
  category_id?: string;
  user_id?: string;
}) {
  let query = supabase
    .from("courses")
    .select(
      `
      *,
      category:course_categories(*),
      enrollments:course_enrollments(count)
    `
    )
    .order("start_date", { ascending: true });

  if (filters?.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Ensure we have an array even if data is null
  const courses = data || [];

  // Add computed status for ALL courses
  const coursesWithStatus = courses.map((course) => ({
    ...course,
    status: getCourseStatus(course.start_date),
    enrollment_count: course.enrollments?.[0]?.count || 0,
  }));

  // Check enrollment status for specific user
  if (filters?.user_id) {
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("user_id", filters.user_id);

    const enrolledCourseIds = new Set(
      enrollments?.map((e) => e.course_id) || []
    );

    return coursesWithStatus.map((course) => ({
      ...course,
      is_enrolled: enrolledCourseIds.has(course.id),
    }));
  }

  return coursesWithStatus;
}

export async function getCourse(id: string) {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      category:course_categories(*),
      enrollments:course_enrollments(
        *,
        user:users(user_id, first_name, last_name, email)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    ...data,
    status: getCourseStatus(data.start_date),
    enrollment_count: data.enrollments?.length || 0,
  } as Course & { enrollments: CourseEnrollment[] };
}

export async function createCourse(
  course: Omit<
    Course,
    | "id"
    | "created_at"
    | "updated_at"
    | "created_by"
    | "status"
    | "category"
    | "enrollment_count"
    | "is_enrolled"
  >
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Clean up the data before sending
  const courseData = {
    ...course,
    created_by: user?.id,
    // Convert empty string to null for optional date field
    end_date: course.end_date || null,
  };

  const { data, error } = await supabase
    .from("courses")
    .insert(courseData)
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  return data as Course;
}

export async function updateCourse(
  id: string,
  updates: Partial<
    Omit<
      Course,
      | "id"
      | "created_at"
      | "updated_at"
      | "created_by"
      | "status"
      | "category"
      | "enrollment_count"
      | "is_enrolled"
    >
  >
) {
  // Clean up the data before sending
  const updateData = {
    ...updates,
    // Convert empty string to null for optional date field
    end_date: updates.end_date || null,
  };

  const { data, error } = await supabase
    .from("courses")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  return data as Course;
}

export async function deleteCourse(id: string) {
  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) throw error;
}

// Enrollment functions
export async function enrollInCourse(courseId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("course_enrollments")
    .insert({
      course_id: courseId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new Error("Already enrolled in this course");
    }
    throw error;
  }

  return data as CourseEnrollment;
}

export async function unenrollFromCourse(courseId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("course_enrollments")
    .delete()
    .eq("course_id", courseId)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function getCourseEnrollments(courseId: string) {
  const { data, error } = await supabase
    .from("course_enrollments")
    .select(
      `
      *,
      user:users(user_id, first_name, last_name, email)
    `
    )
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false });

  if (error) throw error;
  return data as CourseEnrollment[];
}

export async function getUserEnrollments(userId: string) {
  const { data, error } = await supabase
    .from("course_enrollments")
    .select(
      `
      *,
      course:courses(*, category:course_categories(*))
    `
    )
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error) throw error;

  // Add status to courses
  return data.map((enrollment) => ({
    ...enrollment,
    course: enrollment.course
      ? {
          ...enrollment.course,
          status: getCourseStatus(enrollment.course.start_date),
        }
      : null,
  })) as CourseEnrollment[];
}
