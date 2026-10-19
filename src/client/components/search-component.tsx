import { useNavigate, useSearchParams } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import { createDebounce } from "~/lib/signals";

function SearchComponent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = createSignal(searchParams.q || "");
  const debouncedSearch = createDebounce(searchValue, 1000);

  createEffect(() => {
    const query = debouncedSearch();
    console.log("1. Query creada", query);
    const params = new URLSearchParams(window.location.search);

    if (query) {
      params.set("q", query.toString());
    } else {
      params.delete("q");
    }

    navigate(`?${params.toString()}`, { scroll: false, replace: true });
    console.log("Navigate...");
  });

  return (
    <div
      class="flex items-center bg-background rounded-4xl shadow p-3 h-10
        transition-all duration-500 ease-in-out overflow-hidden w-full"
    >
      <div class="text-tx opacity-70 transition-transform duration-500">
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
          class="lucide lucide-search-icon lucide-search"
        >
          <path d="m21 21-4.34-4.34" />
          <circle cx="11" cy="11" r="8" />
        </svg>
      </div>
      <input
        type="text"
        value={searchValue()}
        onInput={(e) => setSearchValue(e.currentTarget.value)}
        placeholder="Buscar productos..."
        class="ml-2 w-full bg-transparent outline-none text-tx transition-opacity duration-500"
      />
    </div>
  );
}

export { SearchComponent };
