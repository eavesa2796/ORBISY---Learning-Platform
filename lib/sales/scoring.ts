export type ScoringInput = {
  isHvacOnly: boolean;
  isResidentialService: boolean;
  isLocalRegional: boolean;
  isHugeFranchise: boolean;
  reviewCount: number;
  hasEmergencyService: boolean;
  hasFinancingServices: boolean;
  hasMultipleServiceAreas: boolean;
  hasAdsOrStrongSeo: boolean;
  hasMissedCallTextBack: boolean;
  hasInstantBookingOrQuote: boolean;
  hasPoorMobileUx: boolean;
  hasWeakEstimateFollowUpSignals: boolean;
  hasCommsComplaintsInReviews: boolean;
  hasSlowOrConfusingForms: boolean;
  hasPublicEmailOrForm: boolean;
  hasOwnerOrManagerContact: boolean;
  hasPhoneNumber: boolean;
  hasActiveBusinessProfile: boolean;
  usesAdvancedAutomationAlready: boolean;
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
  isQualified: boolean;
  explanation: string;
  evidence: ScoreEvidenceItem[];
};

function addEvidence(
  evidence: ScoreEvidenceItem[],
  code: string,
  label: string,
  points: number,
  detail?: string,
) {
  evidence.push({ code, label, points, detail });
}

export function scoreLead(input: ScoringInput): ScoreResult {
  const evidence: ScoreEvidenceItem[] = [];

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

  let revenuePotential = 0;
  if (input.reviewCount >= 50) {
    revenuePotential += 8;
    addEvidence(
      evidence,
      "REV_REVIEW_COUNT",
      "Strong review volume",
      8,
      `${input.reviewCount} reviews`,
    );
  }
  if (input.hasEmergencyService) {
    revenuePotential += 5;
    addEvidence(evidence, "REV_EMERGENCY", "Emergency service offered", 5);
  }
  if (input.hasFinancingServices) {
    revenuePotential += 5;
    addEvidence(evidence, "REV_FINANCING", "Financing/replacement services", 5);
  }
  if (input.hasMultipleServiceAreas) {
    revenuePotential += 4;
    addEvidence(evidence, "REV_SERVICE_AREAS", "Multiple service areas", 4);
  }
  if (input.hasAdsOrStrongSeo) {
    revenuePotential += 3;
    addEvidence(evidence, "REV_VISIBILITY", "Strong ad/SEO visibility", 3);
  }

  let painSignals = 0;
  if (!input.hasMissedCallTextBack) {
    painSignals += 8;
    addEvidence(
      evidence,
      "PAIN_NO_MISSED_CALL_TEXT",
      "No missed-call text-back",
      8,
    );
  }
  if (!input.hasInstantBookingOrQuote) {
    painSignals += 8;
    addEvidence(
      evidence,
      "PAIN_NO_INSTANT_QUOTE",
      "No instant booking/quote flow",
      8,
    );
  }
  if (input.hasPoorMobileUx) {
    painSignals += 6;
    addEvidence(evidence, "PAIN_MOBILE_UX", "Poor mobile UX", 6);
  }
  if (input.hasWeakEstimateFollowUpSignals) {
    painSignals += 5;
    addEvidence(
      evidence,
      "PAIN_WEAK_ESTIMATE_FOLLOWUP",
      "Weak estimate follow-up signals",
      5,
    );
  }
  if (input.hasCommsComplaintsInReviews) {
    painSignals += 5;
    addEvidence(
      evidence,
      "PAIN_REVIEW_COMMS",
      "Reviews mention communication/scheduling issues",
      5,
    );
  }
  if (input.hasSlowOrConfusingForms) {
    painSignals += 3;
    addEvidence(evidence, "PAIN_FORM_FRICTION", "Slow or confusing forms", 3);
  }

  let contactability = 0;
  if (input.hasPublicEmailOrForm) {
    contactability += 5;
    addEvidence(evidence, "CONTACT_EMAIL_FORM", "Public email/form exists", 5);
  }
  if (input.hasOwnerOrManagerContact) {
    contactability += 5;
    addEvidence(evidence, "CONTACT_OWNER", "Owner/manager identified", 5);
  }
  if (input.hasPhoneNumber) {
    contactability += 3;
    addEvidence(evidence, "CONTACT_PHONE", "Phone available", 3);
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

  let disqualifiers = 0;
  if (input.usesAdvancedAutomationAlready) {
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

  const totalScore =
    icpFit + revenuePotential + painSignals + contactability + disqualifiers;
  const isQualified =
    totalScore >= 70 && !input.isHugeFranchise && input.isHvacOnly;

  const topEvidence = [...evidence]
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
    .slice(0, 5)
    .map(
      (item) => `${item.label} (${item.points > 0 ? "+" : ""}${item.points})`,
    )
    .join(", ");

  const explanation = `Score ${totalScore}/100. Top signals: ${topEvidence}.`;

  return {
    icpFit,
    revenuePotential,
    painSignals,
    contactability,
    disqualifiers,
    totalScore,
    isQualified,
    explanation,
    evidence,
  };
}
