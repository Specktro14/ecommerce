import { For } from "solid-js";

import { ProductCard, Props as Product} from "./product_card";

interface Props {}

const testProduct: Product = {
  id: "jamon",
  title: "Jamon ibérico",
  price: "59.99",
  unit: "€/kg",
  src: "",
  alt: "",
  type: "PESO_VARIABLE",
  weights: ["250", "500", "750"],
};

function ProductGrid() {
  const products = Array.from({ length: 6 }, () => ({ ...testProduct }));
  return (
    <div class="grid grid-cols-3 gap-3 lg:grid-cols-4">
      <For each={products}>{(item) => <ProductCard {...item} />}</For>
    </div>
  )
}

export { ProductGrid }