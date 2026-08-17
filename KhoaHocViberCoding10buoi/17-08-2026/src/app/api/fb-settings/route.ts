import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.facebookSettings.findUnique({
      where: { id: "default" }
    });
    return NextResponse.json({ selectedModel: settings?.selectedModel || "gemini-3.5-flash" });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = await prisma.facebookSettings.upsert({
      where: { id: "default" },
      update: {
        selectedModel: body.selectedModel
      },
      create: {
        id: "default",
        selectedModel: body.selectedModel || "gemini-3.5-flash"
      }
    });
    return NextResponse.json({ selectedModel: settings.selectedModel });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
