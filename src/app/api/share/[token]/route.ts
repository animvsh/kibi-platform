import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { courseRepository } from "@/lib/db";
import {
  getShareByToken,
  isShareAccessible,
} from "@/lib/sharing/share-service";
import { getRemixCount } from "@/lib/sharing/remix-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const share = await getShareByToken(token);

    if (!share) {
      return NextResponse.json(
        { message: "Share link not found" },
        { status: 404 }
      );
    }

    // Check if share is accessible (public/unlisted don't need auth)
    const user = await getUserFromCookies();
    const { accessible, reason } = await isShareAccessible(
      token,
      user?.userId
    );

    if (!accessible) {
      return NextResponse.json(
        { message: reason || "Access denied" },
        { status: 403 }
      );
    }

    // Get course data
    const course = await courseRepository.getCourse(share.courseId);

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Return limited info for private/invite courses
    if (share.visibility === "private") {
      return NextResponse.json(
        { message: "This course is private" },
        { status: 403 }
      );
    }

    // Return public course info
    const remixCount = getRemixCount(course.id);

    return NextResponse.json({
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          difficulty: course.difficulty,
          estimatedDurationMinutes: course.estimatedDurationMinutes,
          thumbnailUrl: course.thumbnailUrl,
          remixable: course.remixable,
          status: course.status,
        },
        visibility: share.visibility,
        shareUrl: `/share/${token}`,
        remixCount,
        requiresAuth: share.visibility === "invite" || share.visibility === "collaborative",
      },
    });
  } catch (error) {
    console.error("Error fetching shared course:", error);
    return NextResponse.json(
      { message: "Failed to fetch shared course" },
      { status: 500 }
    );
  }
}
