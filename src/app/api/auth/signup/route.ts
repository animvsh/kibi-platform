import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { apiClient } from "@/lib/api/client";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user via InsForge backend
    const response = await apiClient.post(AUTH_ENDPOINTS.SIGNUP, {
      email,
      password: passwordHash,
      name,
    });

    const { user } = response as { user: { id: string; email: string; name: string } };

    // Generate JWT
    const token = signToken({ userId: user.id, email: user.email });

    // Set HttpOnly cookie
    const response_ = NextResponse.json({ user, message: "Signup successful" });
    response_.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response_;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Signup failed" },
      { status: 500 }
    );
  }
}
