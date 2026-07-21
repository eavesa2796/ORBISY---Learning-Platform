import { describe, expect, it } from "vitest";
import { importCatalogRows } from "./import";

describe("catalog import behavior", () => {
  it("valid import creates items", async () => {
    const rows = [
      {
        rowNumber: 2,
        data: {
          equipmentType: "HEAT_PUMP",
          brand: "Carrier",
          modelNumber: "25VNA4",
          sizeTonnage: "4-ton",
          efficiencyRating: "SEER2 18",
          cost: 6400,
          pricingMode: "COST_PLUS_MARGIN" as const,
          sellPrice: null,
          marginPercent: 35,
          description: null,
          imageUrl: null,
          brochureUrl: null,
          isActive: true,
        },
      },
    ];

    const created: string[] = [];
    const summary = await importCatalogRows(rows, {
      findExisting: async () => null,
      createItem: async (row) => {
        created.push(`${row.equipmentType}:${row.brand}:${row.modelNumber}`);
      },
      updateItem: async () => {
        throw new Error("should not update");
      },
    });

    expect(summary.created).toBe(1);
    expect(summary.updated).toBe(0);
    expect(summary.errors).toBe(0);
    expect(created).toHaveLength(1);
  });

  it("matching row updates existing item", async () => {
    const rows = [
      {
        rowNumber: 2,
        data: {
          equipmentType: "FURNACE",
          brand: "Trane",
          modelNumber: "XV95",
          sizeTonnage: null,
          efficiencyRating: "95 AFUE",
          cost: 3900,
          pricingMode: "FIXED_SELL_PRICE" as const,
          sellPrice: 6900,
          marginPercent: null,
          description: "Updated desc",
          imageUrl: null,
          brochureUrl: null,
          isActive: true,
        },
      },
    ];

    const updates: string[] = [];
    const summary = await importCatalogRows(rows, {
      findExisting: async () => ({
        id: "cat_1",
        equipmentType: "FURNACE",
        brand: "Trane",
        modelNumber: "XV95",
        sizeTonnage: null,
        efficiencyRating: "95 AFUE",
        cost: 3200,
        pricingMode: "FIXED_SELL_PRICE",
        sellPrice: 6100,
        marginPercent: null,
        description: "Old desc",
        imageUrl: null,
        brochureUrl: null,
        isActive: true,
      }),
      createItem: async () => {
        throw new Error("should not create");
      },
      updateItem: async (id) => {
        updates.push(id);
      },
    });

    expect(summary.created).toBe(0);
    expect(summary.updated).toBe(1);
    expect(summary.skipped).toBe(0);
    expect(updates).toEqual(["cat_1"]);
  });

  it("invalid rows return row-level errors", async () => {
    const rows = [
      {
        rowNumber: 4,
        data: {
          equipmentType: "COIL",
          brand: "Brand",
          modelNumber: "M1",
          sizeTonnage: null,
          efficiencyRating: null,
          cost: 100,
          pricingMode: "COST_PLUS_MARGIN" as const,
          sellPrice: null,
          marginPercent: null,
          description: null,
          imageUrl: null,
          brochureUrl: null,
          isActive: true,
        },
      },
    ];

    const summary = await importCatalogRows(
      rows,
      {
        findExisting: async () => {
          throw new Error("database timeout");
        },
        createItem: async () => undefined,
        updateItem: async () => undefined,
      },
      [{ rowNumber: 2, message: "Invalid cost" }],
    );

    expect(summary.errors).toBe(2);
    expect(summary.rowErrors).toHaveLength(2);
    expect(summary.rowErrors[0].rowNumber).toBe(2);
    expect(summary.rowErrors[1].rowNumber).toBe(4);
  });
});
