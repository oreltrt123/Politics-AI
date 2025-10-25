// app/api/chats/route.ts
import { db } from "@/config/db";
import { chatTable, frameTable, projectTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    if (!req.url) {
      return NextResponse.json({ error: "Invalid request context" }, { status: 500 });
    }
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const creatorId = user.id;

    const { messages, frameId, projectId, userId } = await req.json();
    if (!frameId || !projectId || !messages || userId !== creatorId) {
      return NextResponse.json({ error: "Missing fields or unauthorized" }, { status: 400 });
    }

    const projectResult = await db
      .select({ projectId: projectTable.projectId })
      .from(projectTable)
      .where(and(eq(projectTable.projectId, projectId), eq(projectTable.createdBy, creatorId)));
    if (!projectResult.length) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const frameResult = await db
      .select({ frameId: frameTable.frameId })
      .from(frameTable)
      .where(and(eq(frameTable.frameId, frameId), eq(frameTable.projectId, projectId)));
    if (!frameResult.length) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    const existingChats = await db
      .select()
      .from(chatTable)
      .where(and(eq(chatTable.frameId, frameId), eq(chatTable.createdBy, creatorId)))
      .limit(1);

    if (existingChats.length > 0) {
      await db
        .update(chatTable)
        .set({ chatMessage: messages })
        .where(and(eq(chatTable.frameId, frameId), eq(chatTable.createdBy, creatorId)));
    } else {
      await db.insert(chatTable).values({
        chatMessage: messages,
        frameId: frameId,
        createdBy: creatorId,
      });
    }

    return NextResponse.json({ result: 'updated' });
  } catch (error: any) {
    console.error("PUT /api/chats error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}