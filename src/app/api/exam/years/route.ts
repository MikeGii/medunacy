// src/app/api/exam/years/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client
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

    // Get distinct years from exam_questions table (no auth check needed for reading available years)
    const { data, error } = await supabase
      .from("exam_questions")
      .select("year")
      .order("year", { ascending: false });

    if (error) {
      console.error("Error fetching exam years:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no questions exist, return empty array
    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        years: [],
      });
    }

    // Get unique years and count questions for each year
    const yearCounts = data.reduce((acc: Record<number, number>, item) => {
      acc[item.year] = (acc[item.year] || 0) + 1;
      return acc;
    }, {});

    const availableYears = Object.entries(yearCounts)
      .map(([year, count]) => ({
        year: parseInt(year),
        questionCount: count,
      }))
      .sort((a, b) => b.year - a.year); // Sort by year descending

    return NextResponse.json({
      success: true,
      years: availableYears,
    });
  } catch (error) {
    console.error("Fetch years error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
