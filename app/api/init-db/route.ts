import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/server/db/init";

// Simple middleware to protect the initialization endpoint
// In production, you'd want a more secure approach
const ADMIN_KEY = process.env.ADMIN_KEY || "secure-admin-key";

export async function GET(req: NextRequest) {
  // Check for admin key in query parameters
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== ADMIN_KEY) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized: Invalid admin key",
      },
      { status: 401 }
    );
  }

  try {
    const result = await initializeDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error initializing database: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
