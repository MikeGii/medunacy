// src/app/api/tests/[testId]/questions/[questionId]/options/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { QuestionOptionCreate } from "@/types/exam";

interface RouteContext {
  params: Promise<{ testId: string; questionId: string }>;
}

// POST - Create new option for a question
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { testId, questionId } = await context.params;
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

    // Verify the question belongs to a test the user can edit
    const { data: question, error: questionError } = await supabase
      .from("test_questions")
      .select(
        `
        id,
        test:tests(id, created_by)
      `
      )
      .eq("id", questionId)
      .eq("test_id", testId)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const optionData: QuestionOptionCreate = await request.json();

    const { data, error } = await supabase
      .from("question_options")
      .insert({
        question_id: questionId,
        option_text: optionData.option_text,
        is_correct: optionData.is_correct,
        option_order: optionData.option_order || 1,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Option created successfully",
    });
  } catch (error) {
    console.error("Error creating option:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
