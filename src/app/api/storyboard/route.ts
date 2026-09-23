import { NextRequest, NextResponse } from "next/server";
import { generateStoryboard } from "@/lib/storyboard-ai";
import type { StoryboardRequest, StoryboardResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: StoryboardRequest = await request.json();

    if (!body.analysis) {
      return NextResponse.json(
        {
          success: false,
          error: "Website analysis data is required",
        } satisfies StoryboardResponse,
        { status: 400 }
      );
    }

    const storyboard = await generateStoryboard(
      body.analysis,
      body.style || "hook-feature-cta",
      body.durationTarget || 60
    );

    return NextResponse.json({
      success: true,
      data: storyboard,
    } satisfies StoryboardResponse);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Storyboard generation failed";
    console.error("Storyboard error:", message);

    return NextResponse.json(
      { success: false, error: message } satisfies StoryboardResponse,
      { status: 500 }
    );
  }
}
