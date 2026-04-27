import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chunkText } from "@/lib/sales/rag";

export const runtime = "nodejs";

type CreateKnowledgePayload = {
  title: string;
  text: string;
  sourceType?: string;
  tags?: string[];
};

export async function GET() {
  try {
    const docs = await prisma.salesKnowledgeDocument.findMany({
      include: {
        _count: {
          select: { chunks: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      ok: true,
      documents: docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        sourceType: doc.sourceType,
        tags: doc.tags,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        chunkCount: doc._count.chunks,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateKnowledgePayload;

    if (!body.title?.trim() || !body.text?.trim()) {
      return NextResponse.json(
        { ok: false, error: "title and text are required" },
        { status: 400 },
      );
    }

    const document = await prisma.salesKnowledgeDocument.create({
      data: {
        title: body.title.trim(),
        text: body.text,
        sourceType: body.sourceType || "internal",
        tags: body.tags || [],
      },
    });

    const chunks = chunkText(body.text);

    if (chunks.length > 0) {
      await prisma.salesKnowledgeChunk.createMany({
        data: chunks.map((chunk) => ({
          documentId: document.id,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          keywords: chunk.keywords,
        })),
      });
    }

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      chunkCount: chunks.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 },
    );
  }
}
