/**
 * Sharing Service
 * Handles share link generation, visibility management, and collaboration.
 */

import type { CourseVisibility, CourseShare } from "@/types";

// In-memory store for shares (replace with database in production)
const sharesStore = new Map<string, CourseShare>();
const tokenToShareMap = new Map<string, CourseShare>();

// Collaborator permissions
export type CollaboratorPermission =
  | "edit"
  | "add_modules"
  | "review"
  | "view_analytics"
  | "manage_publishing";

export interface CollaboratorInvite {
  id: string;
  courseId: string;
  email: string;
  permission: CollaboratorPermission;
  invitedBy: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  expiresAt?: string;
}

// In-memory store for collaborator invites
const collaboratorInvitesStore = new Map<string, CollaboratorInvite>();

/**
 * Generate a unique, unguessable share token using UUID v4
 */
function generateShareToken(): string {
  return crypto.randomUUID();
}

/**
 * Create a new share link for a course
 */
export async function createShareLink(
  courseId: string,
  createdBy: string,
  visibility: CourseVisibility,
  expiresAt?: string
): Promise<CourseShare> {
  // Check if share already exists for this course
  const existingShare = Array.from(sharesStore.values()).find(
    (s) => s.courseId === courseId
  );

  if (existingShare && visibility === existingShare.visibility) {
    return existingShare;
  }

  const share: CourseShare = {
    id: crypto.randomUUID(),
    courseId,
    shareToken: generateShareToken(),
    visibility,
    createdBy,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  sharesStore.set(share.id, share);
  tokenToShareMap.set(share.shareToken, share);

  return share;
}

/**
 * Get share by token
 */
export async function getShareByToken(
  token: string
): Promise<CourseShare | null> {
  return tokenToShareMap.get(token) || null;
}

/**
 * Get share for a course
 */
export async function getShareForCourse(
  courseId: string
): Promise<CourseShare | null> {
  return (
    Array.from(sharesStore.values()).find((s) => s.courseId === courseId) || null
  );
}

/**
 * Update share visibility
 */
export async function updateShareVisibility(
  courseId: string,
  visibility: CourseVisibility
): Promise<CourseShare | null> {
  const share = await getShareForCourse(courseId);

  if (!share) return null;

  const updated: CourseShare = {
    ...share,
    visibility,
  };

  sharesStore.set(share.id, updated);
  tokenToShareMap.set(share.shareToken, updated);

  return updated;
}

/**
 * Delete a share link
 */
export async function deleteShare(courseId: string): Promise<boolean> {
  const share = await getShareForCourse(courseId);

  if (!share) return false;

  sharesStore.delete(share.id);
  tokenToShareMap.delete(share.shareToken);

  return true;
}

/**
 * Check if a course is accessible via share token
 */
export async function isShareAccessible(
  token: string,
  userId?: string
): Promise<{ accessible: boolean; reason?: string }> {
  const share = await getShareByToken(token);

  if (!share) {
    return { accessible: false, reason: "Share not found" };
  }

  // Check expiration
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return { accessible: false, reason: "Share link expired" };
  }

  // Public and unlisted are always accessible
  if (share.visibility === "public" || share.visibility === "unlisted") {
    return { accessible: true };
  }

  // Invite-only requires user
  if (share.visibility === "invite" || share.visibility === "collaborative") {
    if (!userId) {
      return { accessible: false, reason: "Authentication required" };
    }
    return { accessible: true };
  }

  // Private is never accessible via share
  return { accessible: false, reason: "Course is private" };
}

/**
 * Create a collaborator invite
 */
export async function createCollaboratorInvite(
  courseId: string,
  email: string,
  permission: CollaboratorPermission,
  invitedBy: string,
  expiresInDays?: number
): Promise<CollaboratorInvite> {
  const invite: CollaboratorInvite = {
    id: crypto.randomUUID(),
    courseId,
    email,
    permission,
    invitedBy,
    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt: expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
  };

  collaboratorInvitesStore.set(invite.id, invite);

  return invite;
}

/**
 * Get pending invites for a course
 */
export async function getCourseInvites(
  courseId: string
): Promise<CollaboratorInvite[]> {
  return Array.from(collaboratorInvitesStore.values()).filter(
    (invite) => invite.courseId === courseId && invite.status === "pending"
  );
}

/**
 * Accept a collaborator invite
 */
export async function acceptCollaboratorInvite(
  inviteId: string
): Promise<boolean> {
  const invite = collaboratorInvitesStore.get(inviteId);

  if (!invite) return false;

  // Check expiration
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return false;
  }

  invite.status = "accepted";
  collaboratorInvitesStore.set(inviteId, invite);

  return true;
}

/**
 * Check if user has collaborator access to a course
 */
export async function hasCollaboratorAccess(
  courseId: string,
  email: string,
  requiredPermission?: CollaboratorPermission
): Promise<boolean> {
  const invites = Array.from(collaboratorInvitesStore.values()).filter(
    (invite) =>
      invite.courseId === courseId &&
      invite.email === email &&
      invite.status === "accepted"
  );

  if (!requiredPermission) return invites.length > 0;

  return invites.some((invite) => invite.permission === requiredPermission);
}
