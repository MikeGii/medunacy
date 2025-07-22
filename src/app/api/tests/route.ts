// src/app/api/tests/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TestCreate } from "@/types/exam";

// GET - Fetch published tests (with optional category filter)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const includeUnpublished = searchParams.get('include_unpublished') === 'true';

    let query = supabase
      .from("tests")
      .select(`
        *,
        category:test_categories(*),
        question_count:test_questions(count)
      `)
      .order("created_at", { ascending: false });

    // Filter by category if specified
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    // Only show published tests unless specifically requesting unpublished
    if (!includeUnpublished) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new test (doctors and admins only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || !["doctor", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const testData: TestCreate = await request.json();

    const { data, error } = await supabase
      .from("tests")
      .insert({
        ...testData,
        created_by: user.id,
        passing_score: testData.passing_score || 70,
        allow_multiple_attempts: testData.allow_multiple_attempts ?? true,
        show_correct_answers_in_training: testData.show_correct_answers_in_training ?? true,
      })
      .select(`
        *,
        category:test_categories(*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Test created successfully",
    });
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}