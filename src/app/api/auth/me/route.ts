import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { apiClient } from "@/lib/api/client";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET() {
  try {
    const tokenPayload = await getUserFromCookies();

    if (!tokenPayload) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get fresh user data from InsForge backend
    const response = await apiClient.get(AUTH_ENDPOINTS.ME);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to get user" },
      { status: 500 }
    );
  }
}
