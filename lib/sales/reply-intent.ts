/**
 * Reply intent classifier for inbound HVAC outreach replies.
 *
 * Classifies a reply body into one of 5 intents:
 *   BOOK_REQUEST  — wants to schedule / get a quote
 *   POSITIVE      — interested, positive, asking questions
 *   NEUTRAL       — no clear signal
 *   NEGATIVE      — not interested
 *   UNSUBSCRIBE   — remove me / stop emailing
 *
 * Returns the intent + a short snippet (first 200 chars, sanitized).
 */

export type ReplyIntent =
  | "BOOK_REQUEST"
  | "POSITIVE"
  | "NEUTRAL"
  | "NEGATIVE"
  | "UNSUBSCRIBE";

const BOOK_REQUEST_PATTERNS = [
  /\bschedul/i,
  /\bbook\b/i,
  /\bappointment/i,
  /\bset\s+up\s+(a\s+)?call/i,
  /\bget\s+(a\s+)?quote/i,
  /\bsend\s+(me\s+)?pricing/i,
  /\binterested\s+in\s+(a\s+)?call/i,
  /\bwhat.s\s+(your\s+)?availability/i,
  /\bwhen\s+can\s+(we|you)/i,
  /\bwould\s+love\s+to\s+(connect|chat|talk)/i,
];

const POSITIVE_PATTERNS = [
  /\binterested\b/i,
  /\btell\s+me\s+more/i,
  /\bsounds\s+good/i,
  /\bopen\s+to\s+(a\s+)?chat/i,
  /\bgood\s+timing/i,
  /\byes\b/i,
  /\bsure\b/i,
  /\babsolutely\b/i,
  /\bwould\s+like\s+(to\s+)?learn/i,
  /\bmore\s+info/i,
  /\bsend\s+(me\s+)?(more|info|details)/i,
];

const NEGATIVE_PATTERNS = [
  /\bnot\s+interested\b/i,
  /\bno\s+thank(s|\s+you)\b/i,
  /\bdon.t\s+(need|want)\b/i,
  /\bwe.re\s+(all\s+)?set\b/i,
  /\bwe\s+already\s+have\b/i,
  /\bplease\s+don.t\s+contact/i,
  /\bstop\s+emailing\b/i,
  /\bnot\s+at\s+this\s+time\b/i,
  /\bnot\s+a\s+good\s+(fit|time)\b/i,
];

const UNSUBSCRIBE_PATTERNS = [
  /\bunsubscribe\b/i,
  /\bremove\s+(me|us)\b/i,
  /\btake\s+(me|us)\s+off\b/i,
  /\bopt\s*[-\s]?out\b/i,
  /\bdo\s+not\s+(email|contact|send)\b/i,
  /\bstop\s+sending\b/i,
  /\bno\s+more\s+email/i,
];

function matches(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

export function classifyReplyIntent(body: string): {
  intent: ReplyIntent;
  snippet: string;
} {
  const trimmed = body.trim();
  const snippet = trimmed.slice(0, 200).replace(/\s+/g, " ");

  if (matches(trimmed, UNSUBSCRIBE_PATTERNS)) {
    return { intent: "UNSUBSCRIBE", snippet };
  }
  if (matches(trimmed, BOOK_REQUEST_PATTERNS)) {
    return { intent: "BOOK_REQUEST", snippet };
  }
  if (matches(trimmed, POSITIVE_PATTERNS)) {
    return { intent: "POSITIVE", snippet };
  }
  if (matches(trimmed, NEGATIVE_PATTERNS)) {
    return { intent: "NEGATIVE", snippet };
  }
  return { intent: "NEUTRAL", snippet };
}
