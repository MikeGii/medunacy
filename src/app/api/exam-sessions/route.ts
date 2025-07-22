// src/app/api/exam-sessions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ExamSessionCreate } from "@/types/exam";

// POST - Create new exam session
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

    const sessionData: ExamSessionCreate = await request.json();

    // Get question count for this test
    const { data: questions, error: questionsError } = await supabase
      .from("test_questions")
      .select("id")
      .eq("test_id", sessionData.test_id);

    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 });
    }

    const totalQuestions = questions?.length || 0;

    // Create exam session
    const { data, error } = await supabase
      .from("exam_sessions")
      .insert({
        user_id: user.id,
        test_id: sessionData.test_id,
        mode: sessionData.mode,
        total_questions: totalQuestions,
      })
      .select(`
        *,
        test:tests(
          id,
          title,
          time_limit,
          passing_score
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Exam session created successfully",
    });
  } catch (error) {
    console.error("Error creating exam session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch user's exam sessions (optional - for history)
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

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('test_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from("exam_sessions")
      .select(`
        *,
        test:tests(
          id,
          title,
          category:test_categories(name)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (testId) {
      query = query.eq("test_id", testId);
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
    console.error("Error fetching exam sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}