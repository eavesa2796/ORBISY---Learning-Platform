import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  scoreLead,
  type ScoringInput,
  type ScoringSignals,
} from "@/lib/sales/scoring";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";

export const runtime = "nodejs";

function toSlug(name: string, city?: string | null): string {
  return [name, city]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const exists = await prisma.salesCompany.findUnique({ where: { slug } });
    if (!exists) return slug;
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
}

type IncomingLead = {
  name: string;
  website?: string;
  phone?: string;
  city?: string;
  state?: string;
  category?: string;
  placeId?: string;
  rating?: number;
  reviewCount?: number;
  sourceRef?: string;
  contact?: {
    fullName?: string;
    role?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
  };
  signals?: ScoringSignals;
  auditNotes?: string;
  mobilePerformanceScore?: number;
};

type Payload = {
  sourceType?: "GOOGLE_PLACES" | "CSV_IMPORT" | "MANUAL" | "OTHER";
  leads: IncomingLead[];
};

function defaultScoringInput(lead: IncomingLead): ScoringInput {
  const category = (lead.category || "").toLowerCase();

  return {
    isHvacOnly:
      category.includes("hvac") ||
      category.includes("air") ||
      category.includes("heating"),
    isResidentialService: true,
    isLocalRegional: true,
    isHugeFranchise: false,
    reviewCount: lead.reviewCount || 0,
    hasPhoneNumber: !!lead.phone,
    hasWebsite: !!lead.website,
    hasActiveBusinessProfile: true,
    // Pass evidenced signals directly from the lead payload
    signals: lead.signals,
  };
}

export async function POST(request: NextRequest) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }
  }

  try {
    const body = (await request.json()) as Payload;

    if (!body.leads || !Array.isArray(body.leads) || body.leads.length === 0) {
      return NextResponse.json(
        { error: "leads array is required" },
        { status: 400 },
      );
    }

    const sourceType = body.sourceType || "OTHER";
    const summary = {
      created: 0,
      updated: 0,
      scored: 0,
      qualified: 0,
      rejected: 0,
      errors: [] as string[],
    };

    for (const lead of body.leads) {
      if (!lead.name?.trim()) {
        summary.errors.push("Skipped lead with missing name");
        continue;
      }

      try {
        const existing = await prisma.salesCompany.findFirst({
          where: {
            OR: [
              ...(lead.placeId ? [{ placeId: lead.placeId }] : []),
              ...(lead.website ? [{ website: lead.website }] : []),
              {
                name: lead.name,
                city: lead.city || null,
                state: lead.state || null,
              },
            ],
          },
        });

        const company = existing
          ? await prisma.salesCompany.update({
              where: { id: existing.id },
              data: {
                name: lead.name,
                website: lead.website,
                phone: lead.phone,
                city: lead.city,
                state: lead.state,
                placeId: lead.placeId,
                category: lead.category,
                rating: lead.rating,
                reviewCount: lead.reviewCount,
                sourceType,
                sourceRef: lead.sourceRef,
              },
            })
          : await prisma.salesCompany.create({
              data: {
                slug: await uniqueSlug(toSlug(lead.name, lead.city)),
                name: lead.name,
                website: lead.website,
                phone: lead.phone,
                city: lead.city,
                state: lead.state,
                placeId: lead.placeId,
                category: lead.category,
                rating: lead.rating,
                reviewCount: lead.reviewCount,
                sourceType,
                sourceRef: lead.sourceRef,
              },
            });

        if (existing) {
          summary.updated += 1;
        } else {
          summary.created += 1;
        }

        if (
          lead.contact &&
          (lead.contact.fullName || lead.contact.email || lead.contact.phone)
        ) {
          await prisma.salesContact.create({
            data: {
              companyId: company.id,
              fullName: lead.contact.fullName,
              role: lead.contact.role,
              email: lead.contact.email,
              phone: lead.contact.phone,
              isPrimary: lead.contact.isPrimary ?? true,
              confidence: lead.contact.fullName ? 70 : 55,
              source: String(sourceType),
            },
          });
        }

        await prisma.salesWebsiteAudit.create({
          data: {
            companyId: company.id,
            notes: lead.auditNotes,
            mobilePerformanceScore: lead.mobilePerformanceScore,
            hasOnlineBooking:
              lead.signals?.hasOnlineBookingFlow?.observed ?? false,
            hasEmergencyCta:
              lead.signals?.hasEmergencyService?.observed ?? false,
            hasMissedCallTextBack:
              lead.signals?.hasMissedCallTextBack?.observed ?? false,
            hasFastResponsePromise:
              lead.signals?.hasFastResponsePromise?.observed ?? false,
            hasFinancingCta:
              lead.signals?.hasFinancingServices?.observed ?? false,
            hasAfterHoursCapture:
              lead.signals?.hasAfterHoursCapture?.observed ?? false,
            hasChatOrTextOption:
              lead.signals?.hasChatOrTextOption?.observed ?? false,
            hasStrongReviewProcess: !(
              lead.signals?.hasCommsComplaintsInReviews?.observed ?? false
            ),
            hasClearEstimateFlow:
              lead.signals?.hasClearEstimateFlow?.observed ?? false,
          },
        });

        const scoringInput: ScoringInput = {
          ...defaultScoringInput(lead),
          reviewCount:
            lead.reviewCount || lead.signals?.detectedTools
              ? lead.reviewCount || 0
              : lead.reviewCount || 0,
        };

        const score = scoreLead(scoringInput);

        const scoreRecord = await prisma.salesLeadScore.create({
          data: {
            companyId: company.id,
            icpFit: score.icpFit,
            revenuePotential: score.revenuePotential,
            painSignals: score.painSignals,
            contactability: score.contactability,
            disqualifiers: score.disqualifiers,
            totalScore: score.totalScore,
            buyingLikelihood: score.buyingLikelihood,
            dealThesis: score.dealThesis,
            thesisConfidence: score.thesisConfidence,
            explanation: score.explanation,
          },
        });

        if (score.evidence.length > 0) {
          await prisma.salesScoreEvidence.createMany({
            data: score.evidence.map((item) => ({
              scoreId: scoreRecord.id,
              code: item.code,
              label: item.label,
              points: item.points,
              detail: item.detail,
            })),
          });
        }

        await prisma.salesCompany.update({
          where: { id: company.id },
          data: {
            isQualified: score.isQualified,
            disqualifiedReason: score.isQualified
              ? null
              : "Score below threshold or failed ICP fit",
          },
        });

        summary.scored += 1;
        if (score.isQualified) {
          summary.qualified += 1;
        } else {
          summary.rejected += 1;
        }
      } catch (err) {
        summary.errors.push(
          `${lead.name}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return NextResponse.json({ ok: true, summary });
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
