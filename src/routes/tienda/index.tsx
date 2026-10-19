import { useSearchParams } from "@solidjs/router";
import { createEffect } from "solid-js";
import { ProductGrid } from "~/client/components/product_grid";

export default function Tienda() {
  const [searchParams] = useSearchParams();

  createEffect(() => { });

  return (
    <ProductGrid />
  )
}
