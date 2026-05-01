import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreLead, type ScoringInput } from "@/lib/sales/scoring";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";

export const runtime = "nodejs";

const PLACES_NEW_BASE = "https://places.googleapis.com/v1";
const DEFAULT_SEARCH_FIELD_MASK =
  "places.id,places.name,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount";
const DEFAULT_DETAILS_FIELD_MASK =
  "id,name,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,types,rating,userRatingCount";

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

type PlacesApiV1Place = {
  id?: string;
  name?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
};

type SearchTextResponse = {
  places?: PlacesApiV1Place[];
  error?: { message?: string };
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

function placeName(place: PlacesApiV1Place): string {
  return place.displayName?.text?.trim() || place.name || "Unknown Company";
}

async function searchPlacesText(
  apiKey: string,
  query: string,
  maxResults: number,
  searchFieldMask: string,
): Promise<PlacesApiV1Place[]> {
  const res = await fetch(`${PLACES_NEW_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": searchFieldMask,
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: maxResults,
      languageCode: "en",
      regionCode: "US",
    }),
  });

  if (!res.ok) {
    throw new Error(`Places searchText failed (${res.status})`);
  }

  const data = (await res.json()) as SearchTextResponse;
  if (data.error?.message) {
    throw new Error(`Places searchText error: ${data.error.message}`);
  }

  return data.places ?? [];
}

async function fetchPlaceDetails(
  apiKey: string,
  placeId: string,
  detailsFieldMask: string,
): Promise<PlacesApiV1Place | null> {
  const detailRes = await fetch(`${PLACES_NEW_BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": detailsFieldMask,
    },
  });

  if (!detailRes.ok) return null;
  return (await detailRes.json()) as PlacesApiV1Place;
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
    const searchFieldMask =
      process.env.GOOGLE_PLACES_SEARCH_FIELD_MASK || DEFAULT_SEARCH_FIELD_MASK;
    const detailsFieldMask =
      process.env.GOOGLE_PLACES_DETAILS_FIELD_MASK ||
      DEFAULT_DETAILS_FIELD_MASK;

    const candidates = await searchPlacesText(
      apiKey,
      body.query,
      maxResults,
      searchFieldMask,
    );

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
        const placeId = candidate.id;
        if (!placeId) {
          skipped.push(`${placeName(candidate)}: missing place id`);
          continue;
        }

        // Use lightweight search payload first; optionally enrich with details.
        const detail = fetchDetails
          ? await fetchPlaceDetails(apiKey, placeId, detailsFieldMask)
          : null;

        const effective = detail ?? candidate;
        const companyName = placeName(effective);
        const address = effective.formattedAddress;
        const city = parseCity(address);
        const state = parseState(address);
        const types = effective.types;
        const category = types?.[0] ?? "hvac_contractor";

        // Deduplicate by durable external key first, then name+location fallback.
        const existing = await prisma.salesCompany.findFirst({
          where: {
            OR: [
              { placeId },
              {
                name: companyName,
                city: city ?? null,
                state: state ?? null,
              },
            ],
          },
        });

        // Persist only first-party normalized fields, not raw third-party payloads.
        const companyData = {
          name: companyName,
          website: effective.websiteUri,
          phone:
            effective.nationalPhoneNumber || effective.internationalPhoneNumber,
          city,
          state,
          placeId,
          category,
          rating: effective.rating,
          reviewCount: effective.userRatingCount,
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
                slug: await uniqueSlug(toSlug(companyName, city)),
                ...companyData,
              },
            });

        // Behavioral signals require website audit evidence.
        const scoringInput: ScoringInput = {
          isHvacOnly: isHvacCategory(types),
          isResidentialService: true,
          isLocalRegional: true,
          isHugeFranchise: false,
          reviewCount: effective.userRatingCount ?? 0,
          hasPhoneNumber: !!(
            effective.nationalPhoneNumber || effective.internationalPhoneNumber
          ),
          hasWebsite: !!effective.websiteUri,
          hasActiveBusinessProfile: true,
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
            buyingLikelihood: score.buyingLikelihood,
            dealThesis: score.dealThesis,
            thesisConfidence: score.thesisConfidence,
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
          `${placeName(candidate)}: ${err instanceof Error ? err.message : "unknown error"}`,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      query: body.query,
      found: candidates.length,
      imported: imported.length,
      skipped: skipped.length,
      resultCountRequested: maxResults,
      fetchDetails,
      searchFieldMask,
      detailsFieldMask,
      results: imported,
      errors: skipped,
    });
  } catch (err) {
    console.error("[google-places] error", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
