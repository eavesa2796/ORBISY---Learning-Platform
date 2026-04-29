/**
 * Evidence-gated lead scoring engine — v2
 *
 * Scoring rules:
 *  - ICP signals (HVAC category, residential, local, not-franchise) come from
 *    structured API data and are always trusted.
 *  - Review count comes from Google Places and is always trusted.
 *  - ALL behavioral signals (pain, revenue potential, disqualifiers) ONLY
 *    contribute to the score when the system has evidence:
 *      - signal must be present in `input.signals`
 *      - signal.confidence must be >= MIN_EVIDENCE_CONFIDENCE (60)
 *  - Omitting a signal = zero contribution (not assumed, not penalized).
 */

export type EvidencedSignal = {
  /** true = feature exists on site, false = feature is absent */
  observed: boolean;
  /** 0–100. Signals below MIN_EVIDENCE_CONFIDENCE are not scored. */
  confidence: number;
  /** Optional: URL or CSS selector where evidence was found */
  source?: string;
};

export type ScoringSignals = {
  // Revenue potential (presence = good)
  hasEmergencyService?: EvidencedSignal;
  hasFinancingServices?: EvidencedSignal;
  hasMultipleServiceAreas?: EvidencedSignal;
  hasAdsOrStrongSeo?: EvidencedSignal;

  // Pain signals — ABSENCE of feature is the pain (observed: false = +pain points)
  hasMissedCallTextBack?: EvidencedSignal;
  hasOnlineBookingFlow?: EvidencedSignal;
  hasChatOrTextOption?: EvidencedSignal;
  hasAfterHoursCapture?: EvidencedSignal;
  hasClearEstimateFlow?: EvidencedSignal;
  hasFastResponsePromise?: EvidencedSignal;

  // Confirmed friction (presence = pain points)
  hasPoorMobileUx?: EvidencedSignal;
  hasWeakEstimateFollowup?: EvidencedSignal;
  hasCommsComplaintsInReviews?: EvidencedSignal;
  hasSlowOrConfusingForms?: EvidencedSignal;

  // Contactability
  hasPublicEmailOrForm?: EvidencedSignal;
  hasOwnerOrManagerContact?: EvidencedSignal;

  // Disqualifiers
  usesAdvancedAutomationAlready?: EvidencedSignal;

  /** Tools detected on the site, e.g. "servicetitan", "housecall_pro", "jobber" */
  detectedTools?: string[];
};

export type ScoringInput = {
  // ─── ICP — from Places API / structured data (always trusted) ─────────────
  isHvacOnly: boolean;
  isResidentialService: boolean;
  isLocalRegional: boolean;
  isHugeFranchise: boolean;
  reviewCount: number;

  // ─── Direct contactability (Places / manual — always trusted) ─────────────
  hasPhoneNumber: boolean;
  hasWebsite: boolean;
  hasActiveBusinessProfile: boolean;

  // ─── Behavioral signals (evidence-gated — omit = zero contribution) ───────
  signals?: ScoringSignals;
};

export type ScoreEvidenceItem = {
  code: string;
  label: string;
  points: number;
  detail?: string;
};

export type ScoreResult = {
  icpFit: number;
  revenuePotential: number;
  painSignals: number;
  contactability: number;
  disqualifiers: number;
  totalScore: number;
  buyingLikelihood: number;
  isQualified: boolean;
  explanation: string;
  dealThesis: string;
  thesisConfidence: number;
  evidence: ScoreEvidenceItem[];
};

const MIN_EVIDENCE_CONFIDENCE = 60;
const ADVANCED_TOOLS = [
  "servicetitan",
  "housecall_pro",
  "service_fusion",
  "fieldedge",
];
const MODERATE_TOOLS = ["jobber", "housecallpro", "podium"];

/** Returns observed boolean when signal meets confidence threshold, null otherwise. */
function gate(signal: EvidencedSignal | undefined): boolean | null {
  if (!signal) return null;
  if (signal.confidence < MIN_EVIDENCE_CONFIDENCE) return null;
  return signal.observed;
}

function addEvidence(
  evidence: ScoreEvidenceItem[],
  code: string,
  label: string,
  points: number,
  detail?: string,
) {
  evidence.push({ code, label, points, detail });
}

function generateDealThesis(
  input: ScoringInput,
  evidence: ScoreEvidenceItem[],
  buyingLikelihood: number,
): { thesis: string; confidence: number } {
  const s = input.signals ?? {};
  const positives: string[] = [];
  const negatives: string[] = [];
  const tools = s.detectedTools ?? [];

  const detectedAdvanced = tools.filter((t) =>
    ADVANCED_TOOLS.includes(t.toLowerCase()),
  );
  if (detectedAdvanced.length > 0) {
    return {
      thesis: `Possible disqualify: advanced tool(s) detected (${detectedAdvanced.join(", ")}). Verify manually before outreach.`,
      confidence: 50,
    };
  }

  if (input.reviewCount >= 50 && input.reviewCount <= 500)
    positives.push(
      `${input.reviewCount} Google reviews (proven local traction)`,
    );
  if (gate(s.hasEmergencyService) === true)
    positives.push("emergency service offering");
  if (gate(s.hasFinancingServices) === true)
    positives.push("financing / replacement services");
  if (gate(s.hasAdsOrStrongSeo) === true)
    positives.push("strong ad or SEO visibility");
  if (gate(s.hasMultipleServiceAreas) === true)
    positives.push("multiple service areas");

  if (gate(s.hasMissedCallTextBack) === false)
    negatives.push("no missed-call text-back");
  if (gate(s.hasOnlineBookingFlow) === false)
    negatives.push("no online booking flow");
  if (gate(s.hasChatOrTextOption) === false)
    negatives.push("no chat or text option");
  if (gate(s.hasAfterHoursCapture) === false)
    negatives.push("no after-hours lead capture");
  if (gate(s.hasClearEstimateFlow) === false)
    negatives.push("weak estimate follow-up");
  if (gate(s.hasPoorMobileUx) === true) negatives.push("poor mobile UX");
  if (gate(s.hasCommsComplaintsInReviews) === true)
    negatives.push("communication complaints in reviews");
  if (gate(s.hasSlowOrConfusingForms) === true)
    negatives.push("slow or confusing contact forms");

  if (positives.length === 0 && negatives.length === 0) {
    return {
      thesis:
        "Insufficient evidence for a deal thesis. Run a website audit to populate behavioral signals.",
      confidence: 0,
    };
  }

  const posStr =
    positives.length > 0 ? `They have ${positives.join(", ")}. ` : "";
  const negStr =
    negatives.length > 0
      ? `But they have ${negatives.join(", ")} — all gaps ORBISY closes in days.`
      : "";
  const thesis = `Good target: ${posStr}${negStr}`.trim();
  const dataPoints = positives.length + negatives.length;
  const confidence = Math.min(
    100,
    dataPoints * 14 + (buyingLikelihood > 50 ? 15 : 0),
  );
  return { thesis, confidence };
}

export function scoreLead(input: ScoringInput): ScoreResult {
  const evidence: ScoreEvidenceItem[] = [];
  const s = input.signals ?? {};

  // ─── ICP Fit (always scored — trusted structured data) ────────────────────
  let icpFit = 0;
  if (input.isHvacOnly) {
    icpFit += 10;
    addEvidence(evidence, "ICP_HVAC_ONLY", "HVAC-only business", 10);
  }
  if (input.isResidentialService) {
    icpFit += 8;
    addEvidence(evidence, "ICP_RESIDENTIAL", "Residential service focus", 8);
  }
  if (input.isLocalRegional) {
    icpFit += 5;
    addEvidence(evidence, "ICP_LOCAL", "Local/regional operator", 5);
  }
  if (!input.isHugeFranchise) {
    icpFit += 2;
    addEvidence(evidence, "ICP_NON_FRANCHISE", "Not a large franchise", 2);
  }

  // ─── Revenue Potential (evidence-gated) ────────────────────────────────────
  let revenuePotential = 0;
  if (input.reviewCount >= 50 && input.reviewCount < 500) {
    revenuePotential += 8;
    addEvidence(
      evidence,
      "REV_REVIEW_COUNT",
      "Strong review volume (50–499)",
      8,
      `${input.reviewCount} reviews`,
    );
  } else if (input.reviewCount >= 500) {
    revenuePotential += 4;
    addEvidence(
      evidence,
      "REV_HIGH_REVIEW_COUNT",
      "High review volume (500+, may be regional chain)",
      4,
      `${input.reviewCount} reviews`,
    );
  }

  const emergency = gate(s.hasEmergencyService);
  if (emergency === true) {
    revenuePotential += 5;
    addEvidence(
      evidence,
      "REV_EMERGENCY",
      "Emergency service offering observed",
      5,
    );
  }
  const financing = gate(s.hasFinancingServices);
  if (financing === true) {
    revenuePotential += 5;
    addEvidence(
      evidence,
      "REV_FINANCING",
      "Financing/replacement services observed",
      5,
    );
  }
  const multiArea = gate(s.hasMultipleServiceAreas);
  if (multiArea === true) {
    revenuePotential += 4;
    addEvidence(
      evidence,
      "REV_SERVICE_AREAS",
      "Multiple service areas observed",
      4,
    );
  }
  const adsSeo = gate(s.hasAdsOrStrongSeo);
  if (adsSeo === true) {
    revenuePotential += 3;
    addEvidence(
      evidence,
      "REV_VISIBILITY",
      "Strong ad/SEO visibility observed",
      3,
    );
  }

  // ─── Pain Signals (evidence-gated — confirmed absence = pain) ─────────────
  let painSignals = 0;
  const textBack = gate(s.hasMissedCallTextBack);
  if (textBack === false) {
    painSignals += 8;
    addEvidence(
      evidence,
      "PAIN_NO_MISSED_CALL_TEXT",
      "No missed-call text-back confirmed",
      8,
    );
  }
  const booking = gate(s.hasOnlineBookingFlow);
  if (booking === false) {
    painSignals += 8;
    addEvidence(
      evidence,
      "PAIN_NO_ONLINE_BOOKING",
      "No online booking flow confirmed",
      8,
    );
  }
  const chat = gate(s.hasChatOrTextOption);
  if (chat === false) {
    painSignals += 5;
    addEvidence(
      evidence,
      "PAIN_NO_CHAT_TEXT",
      "No chat or text option confirmed",
      5,
    );
  }
  const afterHours = gate(s.hasAfterHoursCapture);
  if (afterHours === false) {
    painSignals += 5;
    addEvidence(
      evidence,
      "PAIN_NO_AFTER_HOURS",
      "No after-hours lead capture confirmed",
      5,
    );
  }
  const estimateFlow = gate(s.hasClearEstimateFlow);
  if (estimateFlow === false) {
    painSignals += 5;
    addEvidence(
      evidence,
      "PAIN_WEAK_ESTIMATE_FLOW",
      "Weak or no estimate follow-up confirmed",
      5,
    );
  }
  const poorMobile = gate(s.hasPoorMobileUx);
  if (poorMobile === true) {
    painSignals += 6;
    addEvidence(evidence, "PAIN_MOBILE_UX", "Poor mobile UX confirmed", 6);
  }
  const weakFollowup = gate(s.hasWeakEstimateFollowup);
  if (weakFollowup === true) {
    painSignals += 5;
    addEvidence(
      evidence,
      "PAIN_WEAK_ESTIMATE_FOLLOWUP",
      "Weak estimate follow-up signals observed",
      5,
    );
  }
  const commsComplaints = gate(s.hasCommsComplaintsInReviews);
  if (commsComplaints === true) {
    painSignals += 5;
    addEvidence(
      evidence,
      "PAIN_REVIEW_COMMS",
      "Communication complaints in reviews",
      5,
    );
  }
  const formFriction = gate(s.hasSlowOrConfusingForms);
  if (formFriction === true) {
    painSignals += 3;
    addEvidence(
      evidence,
      "PAIN_FORM_FRICTION",
      "Slow or confusing forms confirmed",
      3,
    );
  }

  // ─── Contactability ────────────────────────────────────────────────────────
  let contactability = 0;
  const emailForm = gate(s.hasPublicEmailOrForm);
  if (emailForm === true || input.hasWebsite) {
    contactability += 5;
    addEvidence(
      evidence,
      "CONTACT_EMAIL_FORM",
      "Public email/form or website exists",
      5,
    );
  }
  const ownerContact = gate(s.hasOwnerOrManagerContact);
  if (ownerContact === true) {
    contactability += 5;
    addEvidence(evidence, "CONTACT_OWNER", "Owner/manager identified", 5);
  }
  if (input.hasPhoneNumber) {
    contactability += 3;
    addEvidence(evidence, "CONTACT_PHONE", "Phone number available", 3);
  }
  if (input.hasActiveBusinessProfile) {
    contactability += 2;
    addEvidence(
      evidence,
      "CONTACT_ACTIVE_PROFILE",
      "Active business profile",
      2,
    );
  }

  // ─── Disqualifiers (evidence-gated) ────────────────────────────────────────
  let disqualifiers = 0;
  const advancedAuto = gate(s.usesAdvancedAutomationAlready);
  if (advancedAuto === true) {
    disqualifiers -= 10;
    addEvidence(
      evidence,
      "DISQ_ADVANCED_AUTOMATION",
      "Already using advanced automation",
      -10,
    );
  }
  if (input.isHugeFranchise) {
    disqualifiers -= 15;
    addEvidence(evidence, "DISQ_FRANCHISE", "Large franchise", -15);
  }
  const tools = s.detectedTools ?? [];
  const detectedAdvanced = tools.filter((t) =>
    ADVANCED_TOOLS.includes(t.toLowerCase()),
  );
  if (detectedAdvanced.length > 0 && advancedAuto !== false) {
    disqualifiers -= 8;
    addEvidence(
      evidence,
      "DISQ_ADVANCED_TOOLS",
      `Advanced tool(s) detected: ${detectedAdvanced.join(", ")}`,
      -8,
    );
  }
  const detectedModerate = tools.filter((t) =>
    MODERATE_TOOLS.includes(t.toLowerCase()),
  );
  if (detectedModerate.length > 0) {
    disqualifiers -= 3;
    addEvidence(
      evidence,
      "DISQ_MODERATE_TOOLS",
      `Scheduling tool(s) detected: ${detectedModerate.join(", ")}`,
      -3,
    );
  }

  const totalScore =
    icpFit + revenuePotential + painSignals + contactability + disqualifiers;

  // ─── Buying Likelihood (0–100, separate axis) ─────────────────────────────
  const confirmedPains = evidence.filter(
    (e) => e.code.startsWith("PAIN_") && e.points > 0,
  ).length;
  const confirmedRevenue = evidence.filter((e) =>
    e.code.startsWith("REV_"),
  ).length;
  let buyingLikelihood = 0;
  if (confirmedPains >= 3) buyingLikelihood += 40;
  else buyingLikelihood += confirmedPains * 12;
  if (confirmedRevenue >= 2) buyingLikelihood += 20;
  else if (confirmedRevenue >= 1) buyingLikelihood += 10;
  if (input.reviewCount >= 50 && input.reviewCount <= 500)
    buyingLikelihood += 15;
  if (input.hasPhoneNumber && (input.hasWebsite || emailForm === true))
    buyingLikelihood += 10;
  if (advancedAuto === true || detectedAdvanced.length > 0)
    buyingLikelihood = Math.max(0, buyingLikelihood - 25);
  if (detectedModerate.length > 0)
    buyingLikelihood = Math.max(0, buyingLikelihood - 10);
  if (input.isHugeFranchise) buyingLikelihood = 0;
  buyingLikelihood = Math.min(100, Math.max(0, buyingLikelihood));

  // ─── Qualification (requires HVAC ICP + score achievable only with evidence)
  const isQualified =
    totalScore >= 50 && !input.isHugeFranchise && input.isHvacOnly;

  // ─── Explanation ───────────────────────────────────────────────────────────
  const ICP_CODES = new Set([
    "ICP_HVAC_ONLY",
    "ICP_RESIDENTIAL",
    "ICP_LOCAL",
    "ICP_NON_FRANCHISE",
    "CONTACT_PHONE",
    "CONTACT_ACTIVE_PROFILE",
  ]);
  const behavioralCount = evidence.filter((e) => !ICP_CODES.has(e.code)).length;
  const topEvidence = [...evidence]
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
    .slice(0, 5)
    .map(
      (item) => `${item.label} (${item.points > 0 ? "+" : ""}${item.points})`,
    )
    .join(", ");
  const explanation =
    `Score ${totalScore}/100 · Buying likelihood ${buyingLikelihood}/100 · ` +
    `${behavioralCount} evidenced signals. ` +
    (topEvidence
      ? `Top: ${topEvidence}.`
      : "ICP data only — run a website audit to populate behavioral signals.");

  const { thesis: dealThesis, confidence: thesisConfidence } =
    generateDealThesis(input, evidence, buyingLikelihood);

  return {
    icpFit,
    revenuePotential,
    painSignals,
    contactability,
    disqualifiers,
    totalScore,
    buyingLikelihood,
    isQualified,
    explanation,
    dealThesis,
    thesisConfidence,
    evidence,
  };
}
