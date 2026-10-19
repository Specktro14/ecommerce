import { asc, desc, eq, sql, SQL } from "drizzle-orm";

import { SortOptions } from "~/store/filters.types";

import { productos, variantesProductos } from "../db/schema";
import { requestStore } from "./context-store";

export function applySQLVisibilityFilter(tabla: {
  isActive: any;
}): SQL | undefined {
  const store = requestStore.getStore();
  const isAdmin = store?.isAdmin ?? false;

  if (isAdmin) {
    return undefined;
  }

  return eq(tabla.isActive, true);
}

export function productsSortLogic(sortBy: SortOptions) {
  const precioReal = sql`COALESCE(${variantesProductos.pricePerUnit}, ${variantesProductos.pricePerKG})`;

  const precioMinimoVariantes = sql`(
    SELECT min(${precioReal})
    FROM ${variantesProductos}
    WHERE ${variantesProductos.productoID} = ${productos.id}
    AND ${variantesProductos.isActive} = true
  )`;

  switch (sortBy) {
    case "price_asc":
      return asc(precioMinimoVariantes);
    case "price_desc":
      return desc(precioMinimoVariantes);
    case "relevance":
      return sql`${productos.isFeatured} DESC NULLS LAST, ${productos.createdAt} DESC`;
    case "newest":
    default:
      return desc(productos.createdAt);
  }
}
