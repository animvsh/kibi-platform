import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { courseRepository } from "@/lib/db";
import {
  createShareLink,
  updateShareVisibility,
  deleteShare,
  getShareForCourse,
} from "@/lib/sharing/share-service";
import type { CourseVisibility } from "@/types";

// Visibility options for validation
const VALID_VISIBILITY: CourseVisibility[] = [
  "private",
  "unlisted",
  "public",
  "invite",
  "collaborative",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;

    const share = await getShareForCourse(courseId);

    if (!share) {
      return NextResponse.json(
        { message: "No share link found for this course" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        shareToken: share.shareToken,
        visibility: share.visibility,
        shareUrl: `/share/${share.shareToken}`,
        expiresAt: share.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error fetching share link:", error);
    return NextResponse.json(
      { message: "Failed to fetch share link" },
      { status: 500 }
    );
  }
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
    const { visibility, expiresAt } = body as {
      visibility?: CourseVisibility;
      expiresAt?: string;
    };

    // Validate course exists
    const course = await courseRepository.getCourse(courseId);
    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (course.ownerId !== user.userId) {
      return NextResponse.json(
        { message: "Only the course owner can create share links" },
        { status: 403 }
      );
    }

    // Validate visibility
    if (visibility && !VALID_VISIBILITY.includes(visibility)) {
      return NextResponse.json(
        { message: `Invalid visibility. Must be one of: ${VALID_VISIBILITY.join(", ")}` },
        { status: 400 }
      );
    }

    // If visibility is provided and share exists, update it
    if (visibility) {
      const existingShare = await getShareForCourse(courseId);

      if (existingShare) {
        const updated = await updateShareVisibility(courseId, visibility);
        return NextResponse.json({
          data: {
            shareToken: updated!.shareToken,
            visibility: updated!.visibility,
            shareUrl: `/share/${updated!.shareToken}`,
            expiresAt: updated!.expiresAt,
          },
          message: "Share visibility updated",
        });
      }

      const share = await createShareLink(
        courseId,
        user.userId,
        visibility,
        expiresAt
      );

      return NextResponse.json({
        data: {
          shareToken: share.shareToken,
          visibility: share.visibility,
          shareUrl: `/share/${share.shareToken}`,
          expiresAt: share.expiresAt,
        },
        message: "Share link created",
      });
    }

    // Create default unlisted share
    const share = await createShareLink(courseId, user.userId, "unlisted");

    return NextResponse.json({
      data: {
        shareToken: share.shareToken,
        visibility: share.visibility,
        shareUrl: `/share/${share.shareToken}`,
        expiresAt: share.expiresAt,
      },
      message: "Share link created",
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { message: "Failed to create share link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const course = await courseRepository.getCourse(courseId);
    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (course.ownerId !== user.userId) {
      return NextResponse.json(
        { message: "Only the course owner can delete share links" },
        { status: 403 }
      );
    }

    const deleted = await deleteShare(courseId);

    if (!deleted) {
      return NextResponse.json(
        { message: "No share link found to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Share link deleted",
    });
  } catch (error) {
    console.error("Error deleting share link:", error);
    return NextResponse.json(
      { message: "Failed to delete share link" },
      { status: 500 }
    );
  }
}
