import { Temporal } from "@js-temporal/polyfill";

type skuReference = {
  name: string;
  weight: string;
  unit: string;
};

type referenceType = "FACTURA" | "ORDEN" | "ENVIO" | "CHECKOUT";

export function generateKey(reference: string): string {
  return reference.trim().toLowerCase().replace(" ", "-");
}

export function generateSlug(reference: string): string {
  return reference
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateSku(references: skuReference): string {
  return (
    references.name.toUpperCase().slice(0, 2) +
    "-" +
    references.weight +
    references.unit.toUpperCase()
  );
}

function generateId(length: number): string {
  const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[randomBytes[i] % ALPHABET.length];
  }

  return result;
}

export function generateReference(type: referenceType, length: number = 4): string {
  const timestamp = Temporal.Now.plainDateISO.toString().replace(/-/g, "");
  const random = generateId(length);

  return `${type}-${timestamp}-${random}`
}

export function generateOrderCode(length: number = 6): string {
  const random = generateId(length);

  return `PED-${random}`;
}
