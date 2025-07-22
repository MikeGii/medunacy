// src/app/api/exam-answers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ExamAnswerCreate } from "@/types/exam";

// POST - Submit answer for a question
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const answerData: ExamAnswerCreate = await request.json();

    // Verify the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from("exam_sessions")
      .select("id, user_id")
      .eq("id", answerData.session_id)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 403 }
      );
    }

    // Get the question with options to calculate correctness
    const { data: question, error: questionError } = await supabase
      .from("test_questions")
      .select(
        `
        *,
        options:question_options(*)
      `
      )
      .eq("id", answerData.question_id)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Calculate correctness and points
    const correctOptionIds = question.options
      .filter((option) => option.is_correct)
      .map((option) => option.id);

    const selectedOptionIds = answerData.selected_option_ids;

    // Check if answer is correct (all correct options selected, no incorrect ones)
    const isCorrect =
      selectedOptionIds.length === correctOptionIds.length &&
      selectedOptionIds.every((id) => correctOptionIds.includes(id));

    const pointsEarned = isCorrect ? question.points : 0;

    // Check if answer already exists for this question in this session
    const { data: existingAnswer, error: checkError } = await supabase
      .from("exam_answers")
      .select("id")
      .eq("session_id", answerData.session_id)
      .eq("question_id", answerData.question_id)
      .single();

    let result;

    if (existingAnswer) {
      // Update existing answer
      const { data, error } = await supabase
        .from("exam_answers")
        .update({
          selected_option_ids: selectedOptionIds,
          is_correct: isCorrect,
          points_earned: pointsEarned,
          answered_at: new Date().toISOString(),
        })
        .eq("id", existingAnswer.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    } else {
      // Create new answer
      const { data, error } = await supabase
        .from("exam_answers")
        .insert({
          session_id: answerData.session_id,
          question_id: answerData.question_id,
          selected_option_ids: selectedOptionIds,
          is_correct: isCorrect,
          points_earned: pointsEarned,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: "Answer submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch answers for a session (optional - for review)
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from("exam_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("exam_answers")
      .select(
        `
        *,
        question:test_questions(
          *,
          options:question_options(*)
        )
      `
      )
      .eq("session_id", sessionId)
      .order("answered_at");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching exam answers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
