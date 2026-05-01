import type { CatalogCsvImportError, CatalogCsvRow } from "./csv";

export type CatalogItemSnapshot = CatalogCsvRow & { id: string };

export type CatalogImportSummary = {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  rowErrors: CatalogCsvImportError[];
};

export async function importCatalogRows(
  rows: Array<{ rowNumber: number; data: CatalogCsvRow }>,
  handlers: {
    findExisting: (key: {
      equipmentType: string;
      brand: string;
      modelNumber: string;
    }) => Promise<CatalogItemSnapshot | null>;
    createItem: (row: CatalogCsvRow) => Promise<void>;
    updateItem: (id: string, row: CatalogCsvRow) => Promise<void>;
  },
  initialErrors: CatalogCsvImportError[] = [],
): Promise<CatalogImportSummary> {
  const summary: CatalogImportSummary = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: initialErrors.length,
    rowErrors: [...initialErrors],
  };

  for (const row of rows) {
    try {
      const existing = await handlers.findExisting({
        equipmentType: row.data.equipmentType,
        brand: row.data.brand,
        modelNumber: row.data.modelNumber,
      });

      if (!existing) {
        await handlers.createItem(row.data);
        summary.created += 1;
        continue;
      }

      const unchanged =
        existing.sizeTonnage === row.data.sizeTonnage &&
        existing.efficiencyRating === row.data.efficiencyRating &&
        existing.cost === row.data.cost &&
        existing.pricingMode === row.data.pricingMode &&
        existing.sellPrice === row.data.sellPrice &&
        existing.marginPercent === row.data.marginPercent &&
        existing.description === row.data.description &&
        existing.imageUrl === row.data.imageUrl &&
        existing.brochureUrl === row.data.brochureUrl &&
        existing.isActive === row.data.isActive;

      if (unchanged) {
        summary.skipped += 1;
        continue;
      }

      await handlers.updateItem(existing.id, row.data);
      summary.updated += 1;
    } catch (error) {
      summary.errors += 1;
      summary.rowErrors.push({
        rowNumber: row.rowNumber,
        message: error instanceof Error ? error.message : "Unexpected import error",
      });
    }
  }

  return summary;
}
