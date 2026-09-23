import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/analyzer";
import type { AnalyzeRequest, AnalyzeResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.url) {
      return NextResponse.json(
        { success: false, error: "URL is required" } satisfies AnalyzeResponse,
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" } satisfies AnalyzeResponse,
        { status: 400 }
      );
    }

    const analysis = await analyzeWebsite(body.url);

    return NextResponse.json({
      success: true,
      data: analysis,
    } satisfies AnalyzeResponse);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("Analysis error:", message);

    return NextResponse.json(
      { success: false, error: message } satisfies AnalyzeResponse,
      { status: 500 }
    );
  }
}
