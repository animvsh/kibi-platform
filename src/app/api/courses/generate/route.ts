import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { generateCourse } from "@/lib/ai/course-generator";
import type { GenerationProgress } from "@/types/generation";

// Store for active generations (in production, use Redis or similar)
const activeGenerations = new Map<string, ReadableStreamDefaultController>();

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookies();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, sourceType, sourceMetadata, preferences } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { message: "Prompt is required" },
        { status: 400 }
      );
    }

    const courseId = crypto.randomUUID();

    // Start generation in background
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: GenerationProgress) => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          } catch {
            // Controller might be closed
          }
        };

        const sendEntityEvent = (event: { type: string; data: unknown }) => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          } catch {
            // Controller might be closed
          }
        };

        try {
          const result = await generateCourse(
            prompt,
            sourceType || "prompt",
            sourceMetadata,
            user.userId,
            sendEvent,
            sendEntityEvent,
            courseId
          );

          // Store the generated course (in production, save to database)
          activeGenerations.set(courseId, controller);

          // Send completion event with full course data
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "completed",
                data: {
                  courseId: result.course.id,
                  title: result.course.title,
                  unitsCount: result.units.length,
                  lessonsCount: result.lessons.length,
                  quizzesCount: result.quizzes.length,
                  flashcardsCount: result.flashcards.length,
                },
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Generation failed";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                data: { message: errorMessage },
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Course generation error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to generate course" },
      { status: 500 }
    );
  }
}

// GET endpoint for SSE stream polling (alternative approach)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { message: "courseId is required" },
      { status: 400 }
    );
  }

  const controller = activeGenerations.get(courseId);

  if (!controller) {
    return NextResponse.json(
      { message: "Generation not found or expired" },
      { status: 404 }
    );
  }

  return new Response(
    new ReadableStream({
      start(controller) {
        // Transfer control to the existing controller
        activeGenerations.delete(courseId);
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
}
