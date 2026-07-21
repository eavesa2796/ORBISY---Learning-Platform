export const CATALOG_CSV_COLUMNS = [
  "equipmentType",
  "brand",
  "modelNumber",
  "sizeTonnage",
  "efficiencyRating",
  "cost",
  "pricingMode",
  "sellPrice",
  "marginPercent",
  "description",
  "imageUrl",
  "brochureUrl",
  "isActive",
] as const;

export type CatalogCsvColumn = (typeof CATALOG_CSV_COLUMNS)[number];

export type CatalogCsvRow = {
  equipmentType: string;
  brand: string;
  modelNumber: string;
  sizeTonnage: string | null;
  efficiencyRating: string | null;
  cost: number;
  pricingMode: "FIXED_SELL_PRICE" | "COST_PLUS_MARGIN";
  sellPrice: number | null;
  marginPercent: number | null;
  description: string | null;
  imageUrl: string | null;
  brochureUrl: string | null;
  isActive: boolean;
};

export type CatalogCsvImportError = {
  rowNumber: number;
  message: string;
};

export type ParseCatalogCsvResult = {
  rows: Array<{ rowNumber: number; data: CatalogCsvRow }>;
  errors: CatalogCsvImportError[];
};

export const VALID_EQUIPMENT_TYPES = [
  "CONDENSER",
  "AIR_HANDLER",
  "FURNACE",
  "HEAT_PUMP",
  "COIL",
  "PACKAGE_UNIT",
  "THERMOSTAT",
  "IAQ",
  "OTHER",
] as const;

const VALID_PRICING_MODES = ["FIXED_SELL_PRICE", "COST_PLUS_MARGIN"] as const;

type OptionalNumberParseResult = { value: number | null } | { error: string };
type BooleanParseResult = { value: boolean } | { error: string };

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  values.push(current.trim());
  return values;
}

function escapeCsvField(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function normalizeOptionalString(value: string | undefined) {
  const trimmed = (value || "").trim();
  return trimmed ? trimmed : null;
}

function parseOptionalNumber(value: string | undefined): OptionalNumberParseResult {
  const raw = (value || "").trim();
  if (!raw) return { value: null };
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return { error: `Invalid numeric value: ${raw}` };
  }
  return { value: parsed };
}

function parseBoolean(value: string | undefined): BooleanParseResult {
  const raw = (value || "").trim().toLowerCase();
  if (!raw) return { value: true };
  if (["true", "1", "yes", "y"].includes(raw)) return { value: true };
  if (["false", "0", "no", "n"].includes(raw)) return { value: false };
  return { error: `Invalid boolean value: ${value}` };
}

export function parseCatalogCsv(csvText: string): ParseCatalogCsvResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: [{ rowNumber: 1, message: "CSV is empty" }] };
  }

  const headers = parseCsvLine(lines[0]);
  const missing = CATALOG_CSV_COLUMNS.filter((column) => !headers.includes(column));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 1,
          message: `Missing required columns: ${missing.join(", ")}`,
        },
      ],
    };
  }

  const headerIndex: Record<string, number> = {};
  headers.forEach((header, idx) => {
    headerIndex[header] = idx;
  });

  const rows: Array<{ rowNumber: number; data: CatalogCsvRow }> = [];
  const errors: CatalogCsvImportError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    const values = parseCsvLine(lines[i]);

    if (values.length < headers.length) {
      errors.push({ rowNumber, message: "Column count mismatch" });
      continue;
    }

    const get = (column: CatalogCsvColumn) => values[headerIndex[column]] || "";

    const equipmentType = get("equipmentType").trim().toUpperCase();
    const brand = get("brand").trim();
    const modelNumber = get("modelNumber").trim();
    const pricingMode = get("pricingMode").trim().toUpperCase();

    if (!equipmentType || !brand || !modelNumber) {
      errors.push({
        rowNumber,
        message: "equipmentType, brand, and modelNumber are required",
      });
      continue;
    }

    if (!VALID_EQUIPMENT_TYPES.includes(equipmentType as (typeof VALID_EQUIPMENT_TYPES)[number])) {
      errors.push({ rowNumber, message: `Invalid equipmentType: ${equipmentType}` });
      continue;
    }

    if (!VALID_PRICING_MODES.includes(pricingMode as (typeof VALID_PRICING_MODES)[number])) {
      errors.push({ rowNumber, message: `Invalid pricingMode: ${pricingMode}` });
      continue;
    }

    const costRaw = get("cost").trim();
    const cost = Number(costRaw);
    if (!costRaw || !Number.isFinite(cost)) {
      errors.push({ rowNumber, message: `Invalid cost: ${costRaw || "(empty)"}` });
      continue;
    }

    const sellPriceParsed = parseOptionalNumber(get("sellPrice"));
    if ("error" in sellPriceParsed) {
      errors.push({ rowNumber, message: sellPriceParsed.error });
      continue;
    }

    const marginParsed = parseOptionalNumber(get("marginPercent"));
    if ("error" in marginParsed) {
      errors.push({ rowNumber, message: marginParsed.error });
      continue;
    }

    if (pricingMode === "FIXED_SELL_PRICE" && sellPriceParsed.value === null) {
      errors.push({ rowNumber, message: "sellPrice is required for FIXED_SELL_PRICE" });
      continue;
    }

    const activeParsed = parseBoolean(get("isActive"));
    if ("error" in activeParsed) {
      errors.push({ rowNumber, message: activeParsed.error });
      continue;
    }

    rows.push({
      rowNumber,
      data: {
        equipmentType,
        brand,
        modelNumber,
        sizeTonnage: normalizeOptionalString(get("sizeTonnage")),
        efficiencyRating: normalizeOptionalString(get("efficiencyRating")),
        cost,
        pricingMode: pricingMode as CatalogCsvRow["pricingMode"],
        sellPrice: sellPriceParsed.value ?? null,
        marginPercent: marginParsed.value ?? null,
        description: normalizeOptionalString(get("description")),
        imageUrl: normalizeOptionalString(get("imageUrl")),
        brochureUrl: normalizeOptionalString(get("brochureUrl")),
        isActive: activeParsed.value,
      },
    });
  }

  return { rows, errors };
}

export function exportCatalogCsv(items: CatalogCsvRow[]): string {
  const rows = [CATALOG_CSV_COLUMNS.join(",")];

  for (const item of items) {
    rows.push(
      [
        item.equipmentType,
        item.brand,
        item.modelNumber,
        item.sizeTonnage || "",
        item.efficiencyRating || "",
        String(item.cost),
        item.pricingMode,
        item.sellPrice === null ? "" : String(item.sellPrice),
        item.marginPercent === null ? "" : String(item.marginPercent),
        item.description || "",
        item.imageUrl || "",
        item.brochureUrl || "",
        item.isActive ? "true" : "false",
      ]
        .map(escapeCsvField)
        .join(","),
    );
  }

  return rows.join("\n");
}
