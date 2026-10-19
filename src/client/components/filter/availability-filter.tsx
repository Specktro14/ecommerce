import { useNavigate, useSearchParams } from "@solidjs/router";

import { cn } from "~/lib/utils";

function AvailabilityChips() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const toggle = (key: "inStock" | "outOfStock") => {
    const params = new URLSearchParams(window.location.search);
    const active = params.get(key) === "true";

    // Invertimos y navegamos
    params.set(key, String(!active));
    navigate(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div class="mb-6">
      <h5 class="text-lg font-medium mb-2">Disponibilidad</h5>
      <div class="flex gap-2">
        {/* Botón En Stock */}
        <button
          onClick={() => toggle("inStock")}
          class={cn(
            "px-4 py-1.5 rounded-full text-sm border transition-all",
            searchParams.inStock === "true"
              ? "bg-black text-white"
              : "bg-white",
          )}
        >
          En Stock
        </button>
        {/* Botón Agotado */}
        <button
          onClick={() => toggle("outOfStock")}
          class={cn(
            "px-4 py-1.5 rounded-full text-sm border transition-all",
            searchParams.outOfStock === "true"
              ? "bg-black text-white"
              : "bg-white",
          )}
        >
          Agotado
        </button>
      </div>
    </div>
  );
}

export { AvailabilityChips };
