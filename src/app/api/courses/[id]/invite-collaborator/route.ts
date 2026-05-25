import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { courseRepository } from "@/lib/db";
import {
  createCollaboratorInvite,
  getCourseInvites,
  CollaboratorPermission,
} from "@/lib/sharing/share-service";

// Valid collaborator permissions
const VALID_PERMISSIONS: CollaboratorPermission[] = [
  "edit",
  "add_modules",
  "review",
  "view_analytics",
  "manage_publishing",
];

export async function GET(
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
        { message: "Only the course owner can view collaborator invites" },
        { status: 403 }
      );
    }

    const invites = await getCourseInvites(courseId);

    return NextResponse.json({
      data: invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        permission: invite.permission,
        status: invite.status,
        invitedAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching collaborator invites:", error);
    return NextResponse.json(
      { message: "Failed to fetch collaborator invites" },
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
    const { email, permission, expiresInDays } = body as {
      email?: string;
      permission?: CollaboratorPermission;
      expiresInDays?: number;
    };

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Valid email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate permission
    if (!permission || !VALID_PERMISSIONS.includes(permission)) {
      return NextResponse.json(
        {
          message: `Invalid permission. Must be one of: ${VALID_PERMISSIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

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
        { message: "Only the course owner can invite collaborators" },
        { status: 403 }
      );
    }

    // Create collaborator invite
    const invite = await createCollaboratorInvite(
      courseId,
      email,
      permission,
      user.userId,
      expiresInDays
    );

    return NextResponse.json({
      data: {
        inviteId: invite.id,
        email: invite.email,
        permission: invite.permission,
        inviteUrl: `/invite/${invite.id}`,
        expiresAt: invite.expiresAt,
      },
      message: "Collaborator invite created",
    });
  } catch (error) {
    console.error("Error creating collaborator invite:", error);
    return NextResponse.json(
      { message: "Failed to create collaborator invite" },
      { status: 500 }
    );
  }
}
