// src/app/api/tests/[testId]/questions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TestQuestionCreate } from "@/types/exam";

interface RouteContext {
  params: Promise<{ testId: string }>;
}

// GET - Fetch questions for a test
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { testId } = await context.params;
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

    const { data, error } = await supabase
      .from("test_questions")
      .select(`
        *,
        options:question_options(*)
      `)
      .eq("test_id", testId)
      .order("question_order");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sort options by order
    const questionsWithSortedOptions = data.map(question => ({
      ...question,
      options: question.options.sort((a, b) => a.option_order - b.option_order),
    }));

    return NextResponse.json({
      success: true,
      data: questionsWithSortedOptions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new question (doctors and admins only)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { testId } = await context.params;
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

    const questionData: TestQuestionCreate = await request.json();

    const { data, error } = await supabase
      .from("test_questions")
      .insert({
        ...questionData,
        test_id: testId,
        points: questionData.points || 1,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Question created successfully",
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}