import { createRetryStrategy } from "better-auth/solid";
import { Json } from "drizzle-zod";

const DECIMALS = 2;
const BASE = 10 ** DECIMALS;
const DEFAULT_LOCALE: string = "es-ES";
const DEFAULT_CURRENCY: string = "EUR";

export type ItemTotalInput = {
  salesTypes: "UNIDAD_FIJA" | "UNIDAD_VARIABLE" | "PESO_VARIABLE"
  quantity: number,
  pricePerUnit: number | null,
  pricePerKg: number | null,
  estimatedUnitWeight: number | null
  options: Json
}

function parseNumber(raw: string): number {
  if (!raw || typeof raw !== "string") throw new Error("Precio invalido");

  const normalized = raw.trim().replace(/\./g, "").replace(",", ".");

  const value = Number(normalized);
  if (Number.isNaN(value))
    throw new Error(`No se puede parsear el precio: "${raw}"`);

  return Math.round(value * BASE);
}

export function parsePrice(raw: string): number {
  return parseNumber(raw);
}

export function parsePercent(raw: string): number {
  return parseNumber(raw);
}

export function formatPrice(cents: number): string {
  if (!Number.isInteger(cents))
    throw new Error("Los centimos deben ser un entero");
  return (cents / BASE).toFixed(DECIMALS);
}

export function formatCurrency(
  cents: number,
  options: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
) {
  if (!Number.isInteger(cents))
    throw new Error("Los centimos deben ser un entero");

  return Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    style: "currency",
    currency: options.currency ?? DEFAULT_CURRENCY,
    minimumFractionDigits: options.minimumFractionDigits ?? DECIMALS,
    maximumFractionDigits: options.maximumFractionDigits ?? DECIMALS,
  });
}

export function addPrices(...prices: number[]): number {
  return prices.reduce((acc, p) => acc + p, 0);
}

export function substractPrices(base: number, ...prices: number[]): number {
  return prices.reduce((acc, p) => acc - p, base);
}

export function multiplyPrice(cents: number, factor: number): number {
  return Math.round(cents * factor);
}

export function dividePrice(cents: number, divisor: number): number {
  if (divisor === 0) throw new Error("Divisor no puede ser 0");
  return cents / divisor
}

export function calculateDiscount(price: number, percent: number): number {
  if (percent < 0 || percent > 100) throw new Error("Porcentaje de descuento invalido");

  return multiplyPrice(price, percent / 100);
}

export function applyDiscount(price: number, percent: number): number {
  return substractPrices(price, calculateDiscount(price, percent));
}

export function calculateTax(price: number, percent: number): number {
  if (percent < 0) throw new Error("Porcentaje de impuestos no puede ser negativo");

  return multiplyPrice(price, percent / 100);
}

export function applyTax(price: number, percent: number): number {
  return addPrices(price, calculateTax(price, percent));
}

export function calculateOptionsTotal(options: Json): number { }

export function calculateItemTotal(input: ItemTotalInput): number {
  const optionsPrice: number = calculateOptionsTotal(input.options);
  switch (input.salesTypes) {
    case "UNIDAD_FIJA": {
      if (input.pricePerUnit === null) {
        throw new Error("Precio de unidad no encontrado");
      }

      return addPrices(
        multiplyPrice(input.pricePerUnit, input.quantity),
        optionsPrice
      )
    }
    case "UNIDAD_VARIABLE": {
      if (input.pricePerKg === null || input.estimatedUnitWeight === null) {
        throw new Error("Precio o peso estimado no encontrado")
      }

      return addPrices(
        multiplyPrice(
          input.pricePerKg,
          multiplyPrice(
            input.estimatedUnitWeight / 1000,
            input.quantity)
        ),
        optionsPrice
      )
    }
    case "PESO_VARIABLE": {
      if (input.pricePerKg === null) {
        throw new Error("Precio no encontrado");
      }

      return addPrices(
        multiplyPrice(input.pricePerKg, input.quantity),
        optionsPrice
      )
    }
  }
}

export function calculateCartTotal(): number { }
