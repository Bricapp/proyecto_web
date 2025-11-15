const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
});

export function formatCLP(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }
  return clpFormatter.format(value);
}

export function parseCLP(value: string | number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const digits = value.replace(/[^0-9]/g, "");
    if (digits.length === 0) {
      return 0;
    }
    return Number.parseInt(digits, 10);
  }
  return 0;
}
