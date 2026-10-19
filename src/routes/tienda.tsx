import {
  RouteSectionProps,
  useLocation,
  useSearchParams,
} from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import { Filters } from "~/client/components/filter/filters";
import { SearchComponent } from "~/client/components/search-component";
import { SectionTop } from "~/client/components/store-top-section";
import { Button } from "~/client/components/ui/button";
import { ensureString } from "~/lib/utils";
import { OrderBy, updateFilters } from "~/store/filterStore";

export default function TiendaLayout(props: RouteSectionProps) {
  const [filterOpen, setFilterOpen] = createSignal(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  createEffect(() => {
    updateFilters("search", ensureString(searchParams.q));
    updateFilters(
      "orderBy",
      (ensureString(searchParams.sort) as OrderBy) || "mas-vendidos",
    );
    updateFilters("availability", {
      inStock: searchParams.inStock === "true",
      outOfStock: searchParams.outOfStock === "true",
    });
    const allergens = searchParams.allergens;
    const allergensArray = Array.isArray(allergens)
      ? allergens
      : allergens
        ? allergens.split(",")
        : [];
    updateFilters("suitableFor", allergensArray);

    const min = parseInt(ensureString(searchParams.min) || "0");
    const max = parseInt(ensureString(searchParams.max) || "200");
    updateFilters("priceRange", [min, max]);
  });

  return (
    <div class="px-6 py-6">
      <div class="flex flex-col gap-4">
        <SectionTop pathname={location.pathname} />
      </div>
      <div class="flex flex-row justify-end mt-4 gap-3">
        <Button
          class="flex items-center justify-center p-4 h-10 gap-2 transition-all duration-300 ease-in-out cursor-pointer"
          onClick={() => setFilterOpen((v) => !v)}
          aria-expanded={filterOpen()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-funnel-icon lucide-funnel"
          >
            <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
          </svg>
          <span class="text-sm border-b transition-opacity duration-300">
            Filtrar
          </span>
        </Button>

        <SearchComponent />
      </div>
      <div>
        <div class="mt-4 flex flex-col md:flex-row gap-4">
          <Filters filterOpen={filterOpen} />
          <main class={`w-full transition-all ease-in-out duration-300`}>
            {props.children}
          </main>
        </div>
      </div>
    </div>
  );
}
