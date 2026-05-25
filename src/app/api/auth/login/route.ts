import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { apiClient } from "@/lib/api/client";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user from InsForge backend
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
    });

    const { user } = response as { user: { id: string; email: string; name: string; passwordHash: string } };

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signToken({ userId: user.id, email: user.email });

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;

    // Set HttpOnly cookie
    const response_ = NextResponse.json({ user: userWithoutPassword, message: "Login successful" });
    response_.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response_;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    );
  }
}
