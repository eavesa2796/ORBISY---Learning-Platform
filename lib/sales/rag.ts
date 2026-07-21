import { prisma } from "@/lib/prisma";

type RetrieveInput = {
  query: string;
  tags?: string[];
  limit?: number;
};

type RetrievedChunk = {
  id: string;
  content: string;
  documentTitle: string;
  score: number;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function overlapScore(
  queryTokens: string[],
  content: string,
  keywords: string[],
): number {
  const contentTokens = new Set([
    ...tokenize(content),
    ...keywords.map((k) => k.toLowerCase()),
  ]);
  let score = 0;
  for (const token of queryTokens) {
    if (contentTokens.has(token)) score += 1;
  }
  return score;
}

export async function retrieveKnowledge(
  input: RetrieveInput,
): Promise<RetrievedChunk[]> {
  const limit = Math.max(1, Math.min(input.limit ?? 5, 10));
  const queryTokens = tokenize(input.query);

  const docs = await prisma.salesKnowledgeDocument.findMany({
    where: {
      isActive: true,
      ...(input.tags && input.tags.length > 0
        ? {
            tags: {
              hasSome: input.tags,
            },
          }
        : {}),
    },
    include: {
      chunks: true,
    },
    take: 25,
    orderBy: { updatedAt: "desc" },
  });

  const ranked: RetrievedChunk[] = [];

  for (const doc of docs) {
    for (const chunk of doc.chunks) {
      const score = overlapScore(queryTokens, chunk.content, chunk.keywords);
      if (score > 0) {
        ranked.push({
          id: chunk.id,
          content: chunk.content,
          documentTitle: doc.title,
          score,
        });
      }
    }
  }

  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function chunkText(
  text: string,
  chunkSize = 700,
): { content: string; chunkIndex: number; keywords: string[] }[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const paragraphs = normalized.split(/\n\n+/).filter(Boolean);

  const chunks: { content: string; chunkIndex: number; keywords: string[] }[] =
    [];
  let current = "";
  let idx = 0;

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > chunkSize && current.length > 0) {
      const kws = Array.from(new Set(tokenize(current))).slice(0, 20);
      chunks.push({
        content: current.trim(),
        chunkIndex: idx++,
        keywords: kws,
      });
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }

  if (current.trim()) {
    const kws = Array.from(new Set(tokenize(current))).slice(0, 20);
    chunks.push({ content: current.trim(), chunkIndex: idx++, keywords: kws });
  }

  return chunks;
}
