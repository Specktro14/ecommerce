import { cn } from "~/lib/utils";

import { FilterCategories } from "./category-filter";
import { FilterButtons } from "./filter-buttons";
import { InBetweenLine } from "../in-between-line";
import { PriceRange } from "./price-range";

interface Props {
  filterOpen: () => boolean;
}

const OrderButtons = {
  title: "Ordenar por:",
  filterKey: "orderBy",
  options: [
    { label: "Más vendidos", value: "mas-vendidos", startActive: true },
    { label: "Precio: menor a mayor", value: "precio-asc" },
    { label: "Precio: mayor a menor", value: "precio-desc" },
  ],
};

const suitableButtons = {
  title: "Apto para:",
  filterKey: "suitableFor",
  options: [
    { label: "Celiacos", value: "celiacos" },
    { label: "Veganos", value: "veganos" },
    { label: "Vegetarianos", value: "vegetarianos" },
  ],
  multiple: true,
};

function Filters(props: Props) {
  return (
    <aside
      class={cn(
        "bg-background text-foreground relative overflow-y-scroll transition-all duration-500 ease-in-out rounded-lg drop-shadow-lg border border-border",
        props.filterOpen()
          ? "md:w-72 w-full opacity-100 md:mr-4"
          : "md:w-0 size-0 opacity-0 m-0 pointer-events-none ",
      )}
    >
      <div
        class={cn(
          "bg-background p-2 h-full transition-opacity duration-500 delay-200",

          props.filterOpen() ? "opacity-100" : "opacity-0",
        )}
      >
        <h3 class="text-2xl font-semibold mb-2 ml-1">Filtros</h3>
        <FilterCategories />
        <InBetweenLine />
        <FilterButtons {...OrderButtons} />
        <InBetweenLine />
        <FilterButtons {...suitableButtons} />
        <InBetweenLine />
        <PriceRange />
      </div>
    </aside>
  );
}

export { Filters };
