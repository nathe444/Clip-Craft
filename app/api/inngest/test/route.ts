import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

// GET or POST /api/inngest/test triggers the hello-world event
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "Developer";

    const result = await inngest.send({
      name: "test/hello.world",
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event 'test/hello.world' triggered successfully!",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = body?.name || "Developer";

    const result = await inngest.send({
      name: "test/hello.world",
      data: {
        name,
        ...body,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event 'test/hello.world' triggered successfully!",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
