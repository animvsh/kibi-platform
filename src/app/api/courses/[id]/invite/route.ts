import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { courseRepository } from "@/lib/db";
import {
  createShareLink,
  getShareForCourse,
} from "@/lib/sharing/share-service";

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
    const course = await courseRepository.getCourse(courseId);
    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Check ownership or collaborator access
    const hasAccess =
      course.ownerId === user.userId ||
      course.collaboratorIds?.includes(user.userId);

    if (!hasAccess) {
      return NextResponse.json(
        { message: "Only owners or collaborators can generate invite links" },
        { status: 403 }
      );
    }

    // Create or update share with invite visibility
    let share = await getShareForCourse(courseId);

    if (share && share.visibility === "invite") {
      // Return existing invite link
      return NextResponse.json({
        data: {
          inviteToken: share.shareToken,
          inviteUrl: `/share/${share.shareToken}`,
          expiresAt: share.expiresAt,
        },
        message: "Existing invite link returned",
      });
    }

    // Create new invite-only share
    share = await createShareLink(courseId, user.userId, "invite");

    return NextResponse.json({
      data: {
        inviteToken: share.shareToken,
        inviteUrl: `/share/${share.shareToken}`,
        expiresAt: share.expiresAt,
      },
      message: "Invite link created",
    });
  } catch (error) {
    console.error("Error creating invite link:", error);
    return NextResponse.json(
      { message: "Failed to create invite link" },
      { status: 500 }
    );
  }
}
