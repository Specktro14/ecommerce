import { createStore } from "solid-js/store";

export type OrderBy =
  | "precio-asc"
  | "precio-desc"
  | "nombre-asc"
  | "nombre-desc"
  | "mas-vendidos";

interface Availability {
  inStock: boolean;
  outOfStock: boolean;
}

export interface FilterState {
  orderBy: OrderBy;
  suitableFor: string[];
  availability: Availability;
  priceRange: [number, number];
  search: string;
}

const initialState: FilterState = {
  orderBy: "mas-vendidos",
  suitableFor: [],
  availability: {
    inStock: true,
    outOfStock: false,
  },
  priceRange: [0, 200],
  search: "",
};

const [state, setState] = createStore<FilterState>({ ...initialState });

const updateFilters = <K extends keyof FilterState>(
  key: K,
  value: FilterState[K],
) => {
  if (key === "availability") {
    setState("availability", (prev) => ({
      ...prev,
      ...(value as Availability),
    }));
  } else {
    setState(key, value as any);
  }
};

const resetFilters = () => {
  setState(initialState);
};

export { state, updateFilters, resetFilters };
