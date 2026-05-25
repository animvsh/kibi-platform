import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { courseRepository } from "@/lib/db";

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

    // Validate course exists
    const originalCourse = await courseRepository.getCourse(courseId);
    if (!originalCourse) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Check if course is accessible (public, unlisted, or owned)
    const isOwner = originalCourse.ownerId === user.userId;
    const isAccessible =
      isOwner ||
      originalCourse.visibility === "public" ||
      originalCourse.visibility === "unlisted";

    if (!isAccessible) {
      return NextResponse.json(
        { message: "You don't have permission to duplicate this course" },
        { status: 403 }
      );
    }

    // Create a duplicate of the course
    const newCourseId = crypto.randomUUID();
    const newSlug = `${originalCourse.slug}-copy-${crypto.randomUUID().slice(0, 8)}`;

    const duplicatedCourse = {
      ...originalCourse,
      id: newCourseId,
      slug: newSlug,
      title: `${originalCourse.title} (Copy)`,
      ownerId: user.userId,
      visibility: "private" as const,
      status: "ready" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await courseRepository.createCourse(duplicatedCourse);

    return NextResponse.json({
      data: {
        courseId: duplicatedCourse.id,
        title: duplicatedCourse.title,
        slug: duplicatedCourse.slug,
        duplicateUrl: `/courses/${duplicatedCourse.id}`,
      },
      message: "Course duplicated successfully",
    });
  } catch (error) {
    console.error("Error duplicating course:", error);
    return NextResponse.json(
      { message: "Failed to duplicate course" },
      { status: 500 }
    );
  }
}
