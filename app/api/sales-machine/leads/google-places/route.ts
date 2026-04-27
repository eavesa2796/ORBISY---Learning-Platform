import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreLead, type ScoringInput } from "@/lib/sales/scoring";

export const runtime = "nodejs";

const PLACES_API_BASE = "https://maps.googleapis.com/maps/api/place";

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

type PlaceResult = {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  geometry?: { location: { lat: number; lng: number } };
  vicinity?: string;
};

type TextSearchResult = {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  geometry?: { location: { lat: number; lng: number } };
  vicinity?: string;
};

function parseCity(address?: string): string | undefined {
  if (!address) return undefined;
  const parts = address.split(",").map((p) => p.trim());
  return parts.length >= 2 ? parts[parts.length - 3] || parts[0] : parts[0];
}

function parseState(address?: string): string | undefined {
  if (!address) return undefined;
  const parts = address.split(",").map((p) => p.trim());
  const stateZip = parts[parts.length - 2];
  if (!stateZip) return undefined;
  return stateZip.split(" ")[0];
}

function isHvacCategory(types?: string[]): boolean {
  if (!types) return false;
  const hvacTypes = ["plumber", "electrician", "general_contractor", "roofing"];
  const hvacKeywords = ["hvac", "air", "heat", "cool", "refriger"];
  return types.some(
    (t) =>
      hvacTypes.includes(t) ||
      hvacKeywords.some((kw) => t.toLowerCase().includes(kw)),
  );
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY is not configured" },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      query: string;
      maxResults?: number;
      fetchDetails?: boolean;
    };

    if (!body.query?.trim()) {
      return NextResponse.json(
        { error: "query is required (e.g. 'HVAC contractor in Dallas TX')" },
        { status: 400 },
      );
    }

    const maxResults = Math.min(body.maxResults ?? 20, 60);
    const fetchDetails = body.fetchDetails !== false;

    // Text Search to get a list of places
    const searchUrl = new URL(`${PLACES_API_BASE}/textsearch/json`);
    searchUrl.searchParams.set("query", body.query);
    searchUrl.searchParams.set("key", apiKey);

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) {
      return NextResponse.json(
        { error: "Google Places text search failed", status: searchRes.status },
        { status: 502 },
      );
    }

    const searchData = (await searchRes.json()) as {
      status: string;
      results: TextSearchResult[];
      error_message?: string;
    };

    if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
      return NextResponse.json(
        {
          error: `Google Places API error: ${searchData.status}`,
          detail: searchData.error_message,
        },
        { status: 502 },
      );
    }

    const candidates = (searchData.results || []).slice(0, maxResults);
    const imported: Array<{
      companyId: string;
      slug: string;
      name: string;
      score: number;
      qualified: boolean;
    }> = [];
    const skipped: string[] = [];

    for (const candidate of candidates) {
      try {
        // Optionally fetch Place Details for phone + website
        let detail: PlaceResult | null = null;
        if (fetchDetails) {
          const detailUrl = new URL(`${PLACES_API_BASE}/details/json`);
          detailUrl.searchParams.set("place_id", candidate.place_id);
          detailUrl.searchParams.set(
            "fields",
            "place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types,geometry,vicinity",
          );
          detailUrl.searchParams.set("key", apiKey);

          const detailRes = await fetch(detailUrl.toString());
          if (detailRes.ok) {
            const detailData = (await detailRes.json()) as {
              status: string;
              result?: PlaceResult;
            };
            if (detailData.status === "OK" && detailData.result) {
              detail = detailData.result;
            }
          }
        }

        const address =
          detail?.formatted_address || candidate.formatted_address;
        const city = parseCity(address);
        const state = parseState(address);
        const types = detail?.types || candidate.types;
        const category = types?.[0] ?? "hvac_contractor";

        // Deduplicate by placeId first, then name+city
        const existing = await prisma.salesCompany.findFirst({
          where: {
            OR: [
              { placeId: candidate.place_id },
              {
                name: candidate.name,
                city: city ?? null,
                state: state ?? null,
              },
            ],
          },
        });

        const companyData = {
          name: candidate.name,
          website: detail?.website,
          phone:
            detail?.formatted_phone_number ||
            detail?.international_phone_number,
          city,
          state,
          placeId: candidate.place_id,
          category,
          rating: candidate.rating,
          reviewCount: candidate.user_ratings_total,
          sourceType: "GOOGLE_PLACES" as const,
          sourceRef: body.query,
        };

        const company = existing
          ? await prisma.salesCompany.update({
              where: { id: existing.id },
              data: companyData,
            })
          : await prisma.salesCompany.create({
              data: {
                slug: await uniqueSlug(toSlug(candidate.name, city)),
                ...companyData,
              },
            });

        // Score the lead
        const scoringInput: ScoringInput = {
          isHvacOnly: isHvacCategory(types),
          isResidentialService: true,
          isLocalRegional: true,
          isHugeFranchise: false,
          reviewCount: candidate.user_ratings_total ?? 0,
          hasEmergencyService: false,
          hasFinancingServices: false,
          hasMultipleServiceAreas: false,
          hasAdsOrStrongSeo: false,
          hasMissedCallTextBack: false,
          hasInstantBookingOrQuote: false,
          hasPoorMobileUx: !detail?.website,
          hasWeakEstimateFollowUpSignals: true,
          hasCommsComplaintsInReviews: false,
          hasSlowOrConfusingForms: !detail?.website,
          hasPublicEmailOrForm: !!detail?.website,
          hasOwnerOrManagerContact: false,
          hasPhoneNumber: !!(
            detail?.formatted_phone_number || detail?.international_phone_number
          ),
          hasActiveBusinessProfile: true,
          usesAdvancedAutomationAlready: false,
        };

        const score = scoreLead(scoringInput);

        await prisma.salesLeadScore.create({
          data: {
            companyId: company.id,
            icpFit: score.icpFit,
            revenuePotential: score.revenuePotential,
            painSignals: score.painSignals,
            contactability: score.contactability,
            disqualifiers: score.disqualifiers,
            totalScore: score.totalScore,
            explanation: score.explanation,
            evidence: {
              create: score.evidence.map((ev) => ({
                code: ev.code,
                label: ev.label,
                points: ev.points,
                detail: ev.detail,
              })),
            },
          },
        });

        await prisma.salesCompany.update({
          where: { id: company.id },
          data: { isQualified: score.isQualified },
        });

        imported.push({
          companyId: company.id,
          slug: company.slug,
          name: company.name,
          score: score.totalScore,
          qualified: score.isQualified,
        });
      } catch (err) {
        skipped.push(
          `${candidate.name}: ${err instanceof Error ? err.message : "unknown error"}`,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      query: body.query,
      found: candidates.length,
      imported: imported.length,
      skipped: skipped.length,
      results: imported,
      errors: skipped,
    });
  } catch (err) {
    console.error("[google-places] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
