import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "AI product enhancement is not configured. Enter product details from verified source data.",
    },
    { status: 501 }
  );
}
