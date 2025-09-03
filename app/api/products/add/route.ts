import { NextRequest, NextResponse } from "next/server";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN || "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const productData = await req.json();

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_DOMAIN}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("Authorization") || "",
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
