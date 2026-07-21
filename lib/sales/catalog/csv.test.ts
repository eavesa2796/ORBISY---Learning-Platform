import { describe, expect, it } from "vitest";
import { CATALOG_CSV_COLUMNS, exportCatalogCsv, parseCatalogCsv } from "./csv";

describe("catalog csv utilities", () => {
  it("valid import parses rows", () => {
    const csv = [
      CATALOG_CSV_COLUMNS.join(","),
      "HEAT_PUMP,Carrier,25VNA4,4-ton,SEER2 18,6400,COST_PLUS_MARGIN,,,High-end HP,,,true",
    ].join("\n");

    const result = parseCatalogCsv(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].data.brand).toBe("Carrier");
  });

  it("invalid rows return row-level errors", () => {
    const csv = [
      CATALOG_CSV_COLUMNS.join(","),
      "INVALID_TYPE,Carrier,ABC,4-ton,SEER2 16,5000,COST_PLUS_MARGIN,,,,,,true",
      "HEAT_PUMP,Carrier,DEF,4-ton,SEER2 16,not-a-number,COST_PLUS_MARGIN,,,,,,true",
    ].join("\n");

    const result = parseCatalogCsv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].rowNumber).toBe(2);
    expect(result.errors[1].rowNumber).toBe(3);
  });

  it("export returns expected columns", () => {
    const csv = exportCatalogCsv([
      {
        equipmentType: "FURNACE",
        brand: "Trane",
        modelNumber: "XV95",
        sizeTonnage: null,
        efficiencyRating: "95 AFUE",
        cost: 3200,
        pricingMode: "FIXED_SELL_PRICE",
        sellPrice: 6100,
        marginPercent: null,
        description: "Two-stage furnace",
        imageUrl: null,
        brochureUrl: null,
        isActive: true,
      },
    ]);

    const [header] = csv.split("\n");
    expect(header).toBe(CATALOG_CSV_COLUMNS.join(","));
  });
});
