import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { processFile } from "@/lib/files/file-processor";
import { courseRepository } from "@/lib/db";
import type { Course, CourseUnit, Lesson, Flashcard, Concept } from "@/types";

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookies();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check content type
    const contentType = request.headers.get("content-type") || "";

    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { message: "No file provided" },
          { status: 400 }
        );
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: "File size exceeds 50MB limit" },
          { status: 400 }
        );
      }

      fileBuffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
      mimeType = file.type || detectMimeType(fileName);
    } else {
      // Handle JSON with base64 encoded file
      const body = await request.json();
      const { fileData, fileName: fn, mimeType: mt } = body;

      if (!fileData) {
        return NextResponse.json(
          { message: "No file data provided" },
          { status: 400 }
        );
      }

      fileBuffer = Buffer.from(fileData, "base64");
      fileName = fn || "document";
      mimeType = mt || detectMimeType(fileName);
    }

    // Process the file
    const processedContent = await processFile(fileBuffer, mimeType);

    const now = new Date().toISOString();
    const courseId = crypto.randomUUID();

    // Create course
    const course: Course = {
      id: courseId,
      ownerId: user.userId,
      title: processedContent.title,
      slug: `course-${courseId.slice(0, 8)}`,
      description: `Course generated from ${processedContent.type.toUpperCase()} file: ${fileName}`,
      sourceType: "file",
      sourceMetadata: {
        originalFileName: fileName,
        mimeType,
        fileType: processedContent.type,
        metadata: processedContent.metadata,
      },
      difficulty: "intermediate",
      estimatedDurationMinutes: processedContent.lessons.length * 10,
      visibility: "private",
      remixable: true,
      status: "ready",
      createdAt: now,
      updatedAt: now,
    };

    await courseRepository.createCourse(course);

    // Create units and lessons
    const units: CourseUnit[] = [];
    const lessons: Lesson[] = [];
    const flashcards: Flashcard[] = [];

    // Group lessons into units (max 5 lessons per unit)
    const lessonsPerUnit = 5;
    const numUnits = Math.ceil(processedContent.lessons.length / lessonsPerUnit);

    for (let u = 0; u < numUnits; u++) {
      const unitId = crypto.randomUUID();
      const unitLessons = processedContent.lessons.slice(
        u * lessonsPerUnit,
        (u + 1) * lessonsPerUnit
      );

      const unit: CourseUnit = {
        id: unitId,
        courseId,
        title: u === 0 ? "Main Content" : `Section ${u + 1}`,
        description: `Lessons from ${fileName}`,
        orderIndex: u,
        requiredMasteryScore: 85,
        status: u === 0 ? "available" : "locked",
        createdAt: now,
      };
      units.push(unit);
      await courseRepository.createUnit(unit);

      // Create lessons for this unit
      for (let i = 0; i < unitLessons.length; i++) {
        const procLesson = unitLessons[i];
        const lesson: Lesson = {
          id: crypto.randomUUID(),
          courseId,
          unitId,
          moduleId: crypto.randomUUID(),
          title: procLesson.title,
          lessonType: "article",
          contentJson: {
            markdown: procLesson.content,
            keyTakeaways: procLesson.keyTakeaways,
          },
          plainText: procLesson.content,
          orderIndex: i,
          estimatedMinutes: 10,
          status: "published",
          createdAt: now,
          updatedAt: now,
        };
        lessons.push(lesson);
        await courseRepository.createLesson(lesson);
      }
    }

    // Create flashcards
    for (const procFlashcard of processedContent.flashcards) {
      const flashcard: Flashcard = {
        id: crypto.randomUUID(),
        courseId,
        unitId: units[0]?.id,
        conceptId: undefined,
        front: procFlashcard.front,
        back: procFlashcard.back,
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
      fileType: processedContent.type,
      message: `Course created from ${processedContent.type.toUpperCase()} file`,
    });
  } catch (error) {
    console.error("File course generation error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to generate course from file" },
      { status: 500 }
    );
  }
}

function detectMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "txt":
      return "text/plain";
    case "md":
    case "markdown":
      return "text/markdown";
    case "csv":
      return "text/csv";
    default:
      return "application/octet-stream";
  }
}