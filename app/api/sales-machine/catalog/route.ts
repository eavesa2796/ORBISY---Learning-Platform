import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
    }
  }

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const limit = Math.min(parseInt(searchParams.get("limit") || "200", 10), 500);

    const items = await prisma.salesHvacCatalogItem.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ updatedAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      count: items.length,
      items: items.map((item) => ({
        id: item.id,
        equipmentType: item.equipmentType,
        brand: item.brand,
        modelNumber: item.modelNumber,
        sizeTonnage: item.sizeTonnage,
        efficiencyRating: item.efficiencyRating,
        cost: Number(item.cost),
        pricingMode: item.pricingMode,
        sellPrice: item.sellPrice ? Number(item.sellPrice) : null,
        marginPercent: item.marginPercent,
        description: item.description,
        imageUrl: item.imageUrl,
        brochureUrl: item.brochureUrl,
        isActive: item.isActive,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

type CreateCatalogPayload = {
  equipmentType:
    | "CONDENSER"
    | "AIR_HANDLER"
    | "FURNACE"
    | "HEAT_PUMP"
    | "COIL"
    | "PACKAGE_UNIT"
    | "THERMOSTAT"
    | "IAQ"
    | "OTHER";
  brand: string;
  modelNumber: string;
  sizeTonnage?: string;
  efficiencyRating?: string;
  cost: number;
  pricingMode?: "FIXED_SELL_PRICE" | "COST_PLUS_MARGIN";
  sellPrice?: number;
  marginPercent?: number;
  description?: string;
  imageUrl?: string;
  brochureUrl?: string;
  isActive?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
    }
  }

  try {
    const body = (await request.json()) as CreateCatalogPayload;

    if (!body.equipmentType || !body.brand?.trim() || !body.modelNumber?.trim()) {
      return NextResponse.json(
        { ok: false, error: "equipmentType, brand, and modelNumber are required" },
        { status: 400 },
      );
    }
    if (typeof body.cost !== "number" || !Number.isFinite(body.cost) || body.cost < 0) {
      return NextResponse.json({ ok: false, error: "cost must be a valid non-negative number" }, { status: 400 });
    }

    const pricingMode = body.pricingMode || "COST_PLUS_MARGIN";

    if (pricingMode === "FIXED_SELL_PRICE" && (body.sellPrice === undefined || body.sellPrice < 0)) {
      return NextResponse.json(
        { ok: false, error: "sellPrice is required for FIXED_SELL_PRICE mode" },
        { status: 400 },
      );
    }

    const created = await prisma.salesHvacCatalogItem.create({
      data: {
        equipmentType: body.equipmentType,
        brand: body.brand.trim(),
        modelNumber: body.modelNumber.trim(),
        sizeTonnage: body.sizeTonnage?.trim() || undefined,
        efficiencyRating: body.efficiencyRating?.trim() || undefined,
        cost: body.cost,
        pricingMode,
        sellPrice: body.sellPrice,
        marginPercent: body.marginPercent,
        description: body.description?.trim() || undefined,
        imageUrl: body.imageUrl?.trim() || undefined,
        brochureUrl: body.brochureUrl?.trim() || undefined,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({
      ok: true,
      item: {
        id: created.id,
        equipmentType: created.equipmentType,
        brand: created.brand,
        modelNumber: created.modelNumber,
        sizeTonnage: created.sizeTonnage,
        efficiencyRating: created.efficiencyRating,
        cost: Number(created.cost),
        pricingMode: created.pricingMode,
        sellPrice: created.sellPrice ? Number(created.sellPrice) : null,
        marginPercent: created.marginPercent,
        description: created.description,
        imageUrl: created.imageUrl,
        brochureUrl: created.brochureUrl,
        isActive: created.isActive,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
