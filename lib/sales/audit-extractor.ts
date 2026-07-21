/**
 * HVAC website audit extractor — v1
 *
 * Fetches a company's homepage (and up to 2 discovered internal pages) then
 * runs pattern-matching checks against the combined HTML to produce
 * evidence-backed signal detections.
 *
 * Design principles:
 *  - Pure function at the core: extract(html, url) → signals
 *  - Each detection rule states its own confidence level
 *  - Rules are strictly pattern-based — no AI/LLM dependency
 *  - Detects both presence (positive) and confirmed absence (negative)
 *  - Tool fingerprinting runs on <script src>, inline JS globals, and meta tags
 */

import type { ScoringSignals, EvidencedSignal } from "./scoring";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditSignalCode =
  | "hasMissedCallTextBack"
  | "hasOnlineBookingFlow"
  | "hasChatOrTextOption"
  | "hasAfterHoursCapture"
  | "hasClearEstimateFlow"
  | "hasFastResponsePromise"
  | "hasEmergencyService"
  | "hasFinancingServices"
  | "hasMultipleServiceAreas"
  | "hasPoorMobileUx"
  | "hasWeakEstimateFollowup"
  | "hasCommsComplaintsInReviews"
  | "hasSlowOrConfusingForms"
  | "hasPublicEmailOrForm"
  | "hasOwnerOrManagerContact"
  | "usesAdvancedAutomationAlready"
  | "hasAdsOrStrongSeo";

export type AuditEvidenceItem = {
  code: AuditSignalCode;
  label: string;
  observed: boolean;
  confidence: number; // 0–100
  severity: "high" | "medium" | "low";
  sourceUrl: string;
  snippet: string | null;
};

export type AuditExtractResult = {
  signals: ScoringSignals;
  evidence: AuditEvidenceItem[];
  detectedTools: string[];
  auditedUrl: string;
  pagesChecked: string[];
  crawlStatus: "ok" | "partial" | "failed";
  crawlError: string | null;
  hasOnlineBooking: boolean;
  hasEmergencyCta: boolean;
  hasMissedCallTextBack: boolean;
  hasFastResponsePromise: boolean;
  hasFinancingCta: boolean;
  hasAfterHoursCapture: boolean;
  hasChatOrTextOption: boolean;
  hasStrongReviewProcess: boolean;
  hasClearEstimateFlow: boolean;
};

// ─── Known tool fingerprints ───────────────────────────────────────────────

const TOOL_PATTERNS: Array<{ name: string; patterns: RegExp[] }> = [
  {
    name: "servicetitan",
    patterns: [/servicetitan\.com/i, /ServiceTitanWebWidget/i, /st_widget/i],
  },
  {
    name: "housecall_pro",
    patterns: [/housecallpro\.com/i, /hcpro_widget/i, /HousecallPro/i],
  },
  {
    name: "jobber",
    patterns: [/getjobber\.com/i, /jobber\.com\/booking/i, /JobberWidget/i],
  },
  {
    name: "podium",
    patterns: [/podium\.com/i, /reviews\.podium\.com/i, /PodiumWebChat/i],
  },
  {
    name: "callrail",
    patterns: [/callrail\.com/i, /calltrk\./i, /CallTrk/i],
  },
  {
    name: "schedule_engine",
    patterns: [/scheduleengine\.com/i, /ScheduleEngine/i],
  },
  {
    name: "service_fusion",
    patterns: [/servicefusion\.com/i, /ServiceFusion/i],
  },
  {
    name: "fieldedge",
    patterns: [/fieldedge\.com/i, /FieldEdge/i],
  },
  {
    name: "hatch",
    patterns: [/usehatch\.com/i, /HatchMessaging/i],
  },
  {
    name: "solutionreach",
    patterns: [/solutionreach\.com/i, /SolutionReach/i],
  },
];

// ─── Detection rules ────────────────────────────────────────────────────────

type Rule = {
  code: AuditSignalCode;
  label: string;
  severity: "high" | "medium" | "low";
  /** Returns { observed, confidence, snippet } or null if rule cannot determine */
  detect: (
    html: string,
    url: string,
  ) => { observed: boolean; confidence: number; snippet: string | null } | null;
};

const RULES: Rule[] = [
  // ── Missed-call text-back ────────────────────────────────────────────────
  {
    code: "hasMissedCallTextBack",
    label: "Missed-call text-back system",
    severity: "high",
    detect(html) {
      const positive = [
        /missed.{0,15}call.{0,30}text/i,
        /text.{0,15}back.{0,15}missed/i,
        /we.{0,15}text.{0,15}(you|back).{0,20}miss/i,
        /hatch/i,
        /solutionreach/i,
        /podium/i,
      ];
      const negative = [
        /voicemail/i,
        /leave.{0,15}message/i,
        /call.{0,15}back.{0,15}during.{0,15}(business|office)/i,
      ];
      const matched = positive.find((p) => p.test(html));
      if (matched) {
        const idx = html.search(matched);
        return {
          observed: true,
          confidence: 85,
          snippet: html
            .slice(Math.max(0, idx - 30), idx + 80)
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
      const negMatched = negative.find((p) => p.test(html));
      if (negMatched) {
        return { observed: false, confidence: 70, snippet: null };
      }
      return { observed: false, confidence: 60, snippet: null };
    },
  },

  // ── Online booking flow ──────────────────────────────────────────────────
  {
    code: "hasOnlineBookingFlow",
    label: "Online booking or schedule flow",
    severity: "high",
    detect(html) {
      const strong = [
        /book.{0,10}(online|now|appointment)/i,
        /schedule.{0,10}(online|now|service|appointment)/i,
        /request.{0,10}appointment/i,
        /online.{0,10}booking/i,
        /book.{0,10}a.{0,10}(visit|service|call)/i,
      ];
      const weak = [/schedule/i, /book/i, /appointment/i];
      const sMatch = strong.find((p) => p.test(html));
      if (sMatch) {
        const idx = html.search(sMatch);
        return {
          observed: true,
          confidence: 90,
          snippet: html
            .slice(Math.max(0, idx - 20), idx + 80)
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
      const wMatch = weak.find((p) => p.test(html));
      if (wMatch) {
        return { observed: true, confidence: 65, snippet: null };
      }
      return { observed: false, confidence: 75, snippet: null };
    },
  },

  // ── Chat or text option ──────────────────────────────────────────────────
  {
    code: "hasChatOrTextOption",
    label: "Chat or text option on site",
    severity: "medium",
    detect(html) {
      const patterns = [
        /live.{0,10}chat/i,
        /chat.{0,10}(now|with us|online)/i,
        /text.{0,10}us/i,
        /sms.{0,10}(us|chat)/i,
        /intercom/i,
        /tawk\.to/i,
        /drift\.com/i,
        /crisp\.chat/i,
        /freshchat/i,
        /podium/i,
      ];
      const m = patterns.find((p) => p.test(html));
      if (m) {
        const idx = html.search(m);
        return {
          observed: true,
          confidence: 85,
          snippet: html
            .slice(Math.max(0, idx - 20), idx + 60)
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
      return { observed: false, confidence: 65, snippet: null };
    },
  },

  // ── After-hours capture ──────────────────────────────────────────────────
  {
    code: "hasAfterHoursCapture",
    label: "After-hours lead capture",
    severity: "high",
    detect(html) {
      const positive = [
        /24.{0,5}(hour|hr|\/7)/i,
        /after.{0,10}hours?/i,
        /available.{0,20}(night|evening|weekend)/i,
        /emergency.{0,20}service/i,
        /anytime/i,
        /around.{0,5}the.{0,5}clock/i,
        /always.{0,10}available/i,
      ];
      const m = positive.find((p) => p.test(html));
      if (m) {
        const idx = html.search(m);
        return {
          observed: true,
          confidence: 80,
          snippet: html
            .slice(Math.max(0, idx - 20), idx + 80)
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
      return { observed: false, confidence: 65, snippet: null };
    },
  },

  // ── Clear estimate / quote flow ─────────────────────────────────────────
  {
    code: "hasClearEstimateFlow",
    label: "Clear estimate or quote request flow",
    severity: "high",
    detect(html) {
      const strong = [
        /free.{0,10}estimate/i,
        /get.{0,10}(a|your).{0,10}(quote|estimate)/i,
        /request.{0,10}(a|your).{0,10}(quote|estimate)/i,
        /instant.{0,10}(quote|estimate)/i,
      ];
      const weak = [/estimate/i, /quote/i];
      const sMatch = strong.find((p) => p.test(html));
      if (sMatch) {
        const idx = html.search(sMatch);
        return {
          observed: true,
          confidence: 88,
          snippet: html
            .slice(Math.max(0, idx - 20), idx + 80)
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
      if (weak.find((p) => p.test(html))) {
        return { observed: true, confidence: 60, snippet: null };
      }
      return { observed: false, confidence: 75, snippet: null };
    },
  },

  // ── Fast response promise ────────────────────────────────────────────────
  {
    code: "hasFastResponsePromise",
    label: "Fast response promise (e.g. 'respond within 1 hour')",
    severity: "medium",
    detect(html) {
      const patterns = [
        /respond.{0,20}(within|in).{0,10}(1|one|2|two|hour|minute)/i,
        /reply.{0,20}(within|in).{0,10}(1|one|hour|minute)/i,
        /same.{0,10}day.{0,10}(service|response|call)/i,
        /callback.{0,15}within/i,
        /we.{0,15}(call|contact).{0,15}you.{0,10}(within|in)/i,
      ];
      const m = patterns.find((p) => p.test(html));
      if (m) {
        const idx = html.search(m);
        return {
          observed: true,
          confidence: 82,
          snippet: html
            .slice(Math.max(0, idx - 20), idx + 80)
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
      return { observed: false, confidence: 60, snippet: null };
    },
  },

  // ── Emergency service ────────────────────────────────────────────────────
  {
    code: "hasEmergencyService",
    label: "Emergency HVAC service offering",
    severity: "medium",
    detect(html) {
      const strong = [
        /emergency.{0,20}(hvac|ac|heat|repair|service)/i,
        /hvac.{0,20}emergency/i,
        /24.{0,5}hour.{0,20}emergency/i,
        /emergency.{0,15}(call|response|repair)/i,
      ];
      const m = strong.find((p) => p.test(html));
      if (m) {
        const idx = html.search(m);
        return {
          observed: true,
          confidence: 88,
          snippet: html
            .slice(Math.max(0, idx - 20), idx + 80)
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
      return { observed: false, confidence: 65, snippet: null };
    },
  },

  // ── Financing ────────────────────────────────────────────────────────────
  {
    code: "hasFinancingServices",
    label: "Financing or payment plan options",
    severity: "medium",
    detect(html) {
      const patterns = [
        /financ(e|ing)/i,
        /payment.{0,15}plan/i,
        /0%.{0,15}interest/i,
        /monthly.{0,15}payment/i,
        /apply.{0,15}(for.{0,10})?(financing|credit)/i,
        /greensky/i,
        /synchrony/i,
        /wisetack/i,
        /enerbank/i,
      ];
      const m = patterns.find((p) => p.test(html));
      if (m) {
        const idx = html.search(m);
        return {
          observed: true,
          confidence: 85,
          snippet: html
            .slice(Math.max(0, idx - 20), idx + 80)
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
      return { observed: false, confidence: 70, snippet: null };
    },
  },

  // ── Multiple service areas ───────────────────────────────────────────────
  {
    code: "hasMultipleServiceAreas",
    label: "Multiple service area coverage",
    severity: "low",
    detect(html) {
      const patterns = [
        /service.{0,10}area/i,
        /we.{0,10}serve.{0,30}(and|,)/i,
        /serving.{0,30}(county|counties|metro)/i,
        /cities.{0,20}we.{0,10}serve/i,
      ];
      const m = patterns.find((p) => p.test(html));
      if (m) {
        const idx = html.search(m);
        return {
          observed: true,
          confidence: 75,
          snippet: html
            .slice(Math.max(0, idx - 20), idx + 80)
            .replace(/\s+/g, " ")
            .trim(),
        };
      }
      return { observed: false, confidence: 55, snippet: null };
    },
  },

  // ── Poor mobile UX proxy (no viewport meta) ──────────────────────────────
  {
    code: "hasPoorMobileUx",
    label: "Poor or missing mobile UX signals",
    severity: "medium",
    detect(html) {
      const hasViewport = /meta[^>]+viewport/i.test(html);
      const hasResponsive =
        /responsive/i.test(html) ||
        /bootstrap/i.test(html) ||
        /tailwind/i.test(html);
      if (!hasViewport) {
        return {
          observed: true,
          confidence: 82,
          snippet: "No viewport meta tag detected",
        };
      }
      if (hasViewport && !hasResponsive) {
        return {
          observed: true,
          confidence: 55,
          snippet: "Viewport present but no responsive framework detected",
        };
      }
      return { observed: false, confidence: 70, snippet: null };
    },
  },

  // ── Weak estimate follow-up signals ─────────────────────────────────────
  {
    code: "hasWeakEstimateFollowup",
    label: "Weak estimate follow-up signals",
    severity: "high",
    detect(html) {
      // Positive = they have follow-up language (reduces pain signal)
      const positive = [
        /follow.{0,10}up/i,
        /we.{0,20}(call|contact|reach).{0,15}you.{0,15}(back|shortly|soon)/i,
        /expect.{0,20}(call|response|reply)/i,
      ];
      const hasFollowup = positive.some((p) => p.test(html));
      if (hasFollowup) {
        return { observed: false, confidence: 70, snippet: null }; // NOT weak
      }
      return { observed: true, confidence: 65, snippet: null }; // weak follow-up
    },
  },

  // ── Slow or confusing forms ──────────────────────────────────────────────
  {
    code: "hasSlowOrConfusingForms",
    label: "Slow or confusing contact forms",
    severity: "medium",
    detect(html) {
      // Count form input fields as a friction proxy
      const inputCount = (html.match(/<input/gi) || []).length;
      const textareaCount = (html.match(/<textarea/gi) || []).length;
      const totalFields = inputCount + textareaCount;
      if (totalFields > 8) {
        return {
          observed: true,
          confidence: 72,
          snippet: `${totalFields} form fields detected (high friction)`,
        };
      }
      if (totalFields === 0) {
        return {
          observed: false,
          confidence: 60,
          snippet: "No form fields detected on page",
        };
      }
      return { observed: false, confidence: 65, snippet: null };
    },
  },

  // ── Public email or contact form ─────────────────────────────────────────
  {
    code: "hasPublicEmailOrForm",
    label: "Public email address or contact form",
    severity: "low",
    detect(html) {
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const formPattern = /<form/i;
      const contactLink = /href=["'][^"']*contact[^"']*["']/i;

      const emailMatch = html.match(emailPattern);
      const hasForm = formPattern.test(html);
      const hasContactLink = contactLink.test(html);

      if (emailMatch) {
        return { observed: true, confidence: 90, snippet: emailMatch[0] };
      }
      if (hasForm || hasContactLink) {
        return { observed: true, confidence: 75, snippet: null };
      }
      return { observed: false, confidence: 70, snippet: null };
    },
  },
];

// ─── Tool fingerprinting ─────────────────────────────────────────────────────

function detectTools(html: string): string[] {
  const found: string[] = [];
  for (const tool of TOOL_PATTERNS) {
    if (tool.patterns.some((p) => p.test(html))) {
      found.push(tool.name);
    }
  }
  return found;
}

// ─── Internal page discovery ─────────────────────────────────────────────────

const PRIORITY_PATHS = [
  "/services",
  "/hvac",
  "/contact",
  "/book",
  "/schedule",
  "/financing",
  "/emergency",
  "/about",
];

function discoverInternalLinks(html: string, baseUrl: string): string[] {
  const origin = new URL(baseUrl).origin;
  const hrefPattern = /href=["']([^"'#?]+)["']/gi;
  const found = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = hrefPattern.exec(html)) !== null) {
    const href = match[1];
    try {
      const resolved = new URL(href, origin).toString();
      if (
        resolved.startsWith(origin) &&
        resolved !== baseUrl &&
        !resolved.match(/\.(pdf|jpg|png|gif|svg|css|js|xml|ico)$/i)
      ) {
        found.add(resolved);
      }
    } catch {
      // ignore malformed hrefs
    }
  }

  // Prioritise known high-signal paths
  const priority = PRIORITY_PATHS.map((p) => origin + p).filter((u) =>
    found.has(u),
  );

  const rest = [...found].filter((u) => !priority.includes(u));
  return [...priority, ...rest].slice(0, 3); // cap at 3 additional pages
}

// ─── Fetch with timeout ──────────────────────────────────────────────────────

async function fetchPage(
  url: string,
  timeoutMs = 10000,
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ORBISYAuditBot/1.0; +https://orbisy.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Strip HTML tags, scripts, styles for cleaner text matching
function stripToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ");
}

// ─── Main extractor ──────────────────────────────────────────────────────────

export async function extractAudit(
  websiteUrl: string,
): Promise<AuditExtractResult> {
  // Normalise URL
  let baseUrl = websiteUrl.trim();
  if (!baseUrl.startsWith("http")) baseUrl = "https://" + baseUrl;

  const pagesChecked: string[] = [];
  let combinedHtml = "";
  let crawlStatus: "ok" | "partial" | "failed" = "failed";
  let crawlError: string | null = null;

  // Fetch homepage
  const homepageHtml = await fetchPage(baseUrl);
  if (homepageHtml) {
    combinedHtml += homepageHtml;
    pagesChecked.push(baseUrl);
    crawlStatus = "ok";

    // Discover and fetch additional internal pages (max 2)
    const internalLinks = discoverInternalLinks(homepageHtml, baseUrl).slice(
      0,
      2,
    );
    for (const link of internalLinks) {
      const pageHtml = await fetchPage(link);
      if (pageHtml) {
        combinedHtml += " " + pageHtml;
        pagesChecked.push(link);
      }
    }
  } else {
    crawlStatus = "failed";
    crawlError = "Homepage could not be fetched (timeout or non-200 response)";
  }

  // Always run rules on whatever HTML we have (may be empty for failed crawls)
  const textContent = stripToText(combinedHtml);

  // Detect tools from raw HTML (scripts, globals)
  const detectedTools = combinedHtml ? detectTools(combinedHtml) : [];

  // Run all detection rules
  const evidence: AuditEvidenceItem[] = [];
  const signals: ScoringSignals = { detectedTools };

  for (const rule of RULES) {
    const result = rule.detect(textContent, baseUrl);
    if (result === null) continue;

    evidence.push({
      code: rule.code,
      label: rule.label,
      observed: result.observed,
      confidence: result.confidence,
      severity: rule.severity,
      sourceUrl: pagesChecked[0] ?? baseUrl,
      snippet: result.snippet,
    });

    // Map to ScoringSignals
    const signal: EvidencedSignal = {
      observed: result.observed,
      confidence: result.confidence,
      source: pagesChecked[0] ?? baseUrl,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (signals as any)[rule.code] = signal;
  }

  // Detect if tools imply advanced automation (ServiceTitan, FieldEdge etc.)
  const ADVANCED = [
    "servicetitan",
    "housecall_pro",
    "service_fusion",
    "fieldedge",
  ];
  if (detectedTools.some((t) => ADVANCED.includes(t))) {
    signals.usesAdvancedAutomationAlready = { observed: true, confidence: 90 };
  }

  // Mark partial if some pages fetched but homepage failed
  if (pagesChecked.length > 0 && pagesChecked.length < 2) {
    crawlStatus = "partial";
  } else if (pagesChecked.length >= 2) {
    crawlStatus = "ok";
  }

  // Derive SalesWebsiteAudit boolean fields from evidence results
  const get = (code: AuditSignalCode): boolean =>
    evidence.find((e) => e.code === code)?.observed ?? false;

  return {
    signals,
    evidence,
    detectedTools,
    auditedUrl: pagesChecked[0] ?? baseUrl,
    pagesChecked,
    crawlStatus,
    crawlError,
    // SalesWebsiteAudit boolean fields
    hasOnlineBooking: get("hasOnlineBookingFlow"),
    hasEmergencyCta: get("hasEmergencyService"),
    hasMissedCallTextBack: get("hasMissedCallTextBack"),
    hasFastResponsePromise: get("hasFastResponsePromise"),
    hasFinancingCta: get("hasFinancingServices"),
    hasAfterHoursCapture: get("hasAfterHoursCapture"),
    hasChatOrTextOption: get("hasChatOrTextOption"),
    hasStrongReviewProcess: !evidence.find(
      (e) => e.code === "hasCommsComplaintsInReviews",
    )?.observed,
    hasClearEstimateFlow: get("hasClearEstimateFlow"),
  };
}
