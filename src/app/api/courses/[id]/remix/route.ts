import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { courseRepository } from "@/lib/db";
import {
  remixCourse,
  RemixPersonalization,
  incrementRemixCount,
} from "@/lib/sharing/remix-service";

// Validate personalization answers
function validatePersonalization(body: unknown): RemixPersonalization | null {
  if (typeof body !== "object" || body === null) return null;

  const obj = body as Record<string, unknown>;

  const validLevels = ["beginner", "intermediate", "advanced", "expert"];
  const validGoals = ["career", "hobby", "academic", "certification"];
  const validTimes = ["15min", "30min", "1hr", "2hr+"];
  const validDifficulties = ["easier", "same", "harder"];
  const validQuizFrequencies = ["more", "same", "less"];

  if (
    typeof obj.level === "string" &&
    validLevels.includes(obj.level) &&
    typeof obj.goal === "string" &&
    validGoals.includes(obj.goal) &&
    typeof obj.timeAvailable === "string" &&
    validTimes.includes(obj.timeAvailable) &&
    typeof obj.difficulty === "string" &&
    validDifficulties.includes(obj.difficulty) &&
    typeof obj.quizFrequency === "string" &&
    validQuizFrequencies.includes(obj.quizFrequency)
  ) {
    return {
      level: obj.level,
      goal: obj.goal,
      timeAvailable: obj.timeAvailable,
      difficulty: obj.difficulty,
      quizFrequency: obj.quizFrequency,
    };
  }

  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookies();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const body = await request.json();

    // Validate personalization answers
    const personalization = validatePersonalization(body);
    if (!personalization) {
      return NextResponse.json(
        {
          message:
            "Invalid personalization. Required: level, goal, timeAvailable, difficulty, quizFrequency",
        },
        { status: 400 }
      );
    }

    // Validate course exists
    const originalCourse = await courseRepository.getCourse(courseId);
    if (!originalCourse) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Check if course is remixable
    if (!originalCourse.remixable && originalCourse.ownerId !== user.userId) {
      return NextResponse.json(
        { message: "This course is not remixable" },
        { status: 403 }
      );
    }

    // Check if course is accessible
    const isOwner = originalCourse.ownerId === user.userId;
    const isAccessible =
      isOwner ||
      originalCourse.visibility === "public" ||
      originalCourse.visibility === "unlisted";

    if (!isAccessible) {
      return NextResponse.json(
        { message: "You don't have permission to remix this course" },
        { status: 403 }
      );
    }

    // Remix the course
    const remixed = await remixCourse(
      originalCourse,
      user.userId,
      personalization
    );

    // Save the remixed course
    await courseRepository.createCourse(remixed.course);

    // Increment remix count for analytics
    incrementRemixCount(courseId);

    return NextResponse.json({
      data: {
        courseId: remixed.course.id,
        title: remixed.course.title,
        slug: remixed.course.slug,
        difficulty: remixed.course.difficulty,
        estimatedDurationMinutes: remixed.course.estimatedDurationMinutes,
        remixUrl: `/courses/${remixed.course.id}`,
      },
      message: "Course remixed successfully",
    });
  } catch (error) {
    console.error("Error remixing course:", error);
    return NextResponse.json(
      { message: "Failed to remix course" },
      { status: 500 }
    );
  }
}
