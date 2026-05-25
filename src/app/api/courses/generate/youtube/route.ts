import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { extractYouTubeContent } from "@/lib/video/youtube-extractor";
import { courseRepository } from "@/lib/db";
import type { Course, CourseUnit, Lesson, Flashcard, Concept } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookies();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { youtubeUrl } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { message: "YouTube URL is required" },
        { status: 400 }
      );
    }

    // Extract video ID and validate
    const videoIdMatch = youtubeUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );

    if (!videoIdMatch) {
      return NextResponse.json(
        { message: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Extract content from YouTube video
    const content = await extractYouTubeContent(youtubeUrl);

    if (!content) {
      return NextResponse.json(
        { message: "Failed to extract video content" },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();
    const courseId = crypto.randomUUID();

    // Create course
    const course: Course = {
      id: courseId,
      ownerId: user.userId,
      title: content.video.title,
      slug: `course-${courseId.slice(0, 8)}`,
      description: `Learn from this YouTube video: ${content.video.title}`,
      sourceType: "youtube",
      sourceMetadata: {
        videoId: content.video.videoId,
        thumbnailUrl: content.video.thumbnailUrl,
        channelName: content.video.channelName,
      },
      difficulty: "intermediate",
      estimatedDurationMinutes: Math.round(content.transcript.length / 60),
      visibility: "private",
      remixable: true,
      status: "ready",
      createdAt: now,
      updatedAt: now,
    };

    await courseRepository.createCourse(course);

    // Create units and lessons from transcript
    const units: CourseUnit[] = [];
    const lessons: Lesson[] = [];
    const flashcards: Flashcard[] = [];

    // Create a single unit for YouTube content
    const unitId = crypto.randomUUID();
    const unit: CourseUnit = {
      id: unitId,
      courseId,
      title: "Video Lessons",
      description: `Lessons extracted from the YouTube video`,
      orderIndex: 0,
      requiredMasteryScore: 85,
      status: "available",
      createdAt: now,
    };
    units.push(unit);
    await courseRepository.createUnit(unit);

    // Create lessons from YouTube lessons
    for (let i = 0; i < content.lessons.length; i++) {
      const ytLesson = content.lessons[i];
      const lesson: Lesson = {
        id: crypto.randomUUID(),
        courseId,
        unitId,
        moduleId: crypto.randomUUID(),
        title: ytLesson.title,
        lessonType: "video",
        contentJson: {
          markdown: ytLesson.content,
          videoUrl: youtubeUrl,
          startTime: ytLesson.startTime,
          endTime: ytLesson.endTime,
          keyTakeaways: ytLesson.keyTakeaways,
        },
        plainText: ytLesson.content,
        orderIndex: i,
        estimatedMinutes: Math.round((ytLesson.endTime - ytLesson.startTime) / 60) || 5,
        status: "published",
        createdAt: now,
        updatedAt: now,
      };
      lessons.push(lesson);
      await courseRepository.createLesson(lesson);
    }

    // Create flashcards from YouTube flashcards
    for (let i = 0; i < content.flashcards.length; i++) {
      const ytFlashcard = content.flashcards[i];
      const flashcard: Flashcard = {
        id: crypto.randomUUID(),
        courseId,
        unitId,
        conceptId: undefined,
        front: ytFlashcard.front,
        back: ytFlashcard.back,
        difficulty: "intermediate",
        createdAt: now,
      };
      flashcards.push(flashcard);
    }
    await courseRepository.createFlashcards(flashcards);

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
      },
      units: units.length,
      lessons: lessons.length,
      flashcards: flashcards.length,
      message: `Course created from YouTube video`,
    });
  } catch (error) {
    console.error("YouTube course generation error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to generate course from YouTube" },
      { status: 500 }
    );
  }
}