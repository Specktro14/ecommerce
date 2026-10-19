import { useNavigate, useSearchParams } from "@solidjs/router";
import { For } from "solid-js";

import { cn } from "~/lib/utils";

interface Props {
  title: string;
  filterKey: string;
  options: {
    label: string;
    value: string;
  }[];
  multiple?: boolean;
  class?: string;
}

function FilterButtons(props: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isSelected = (val: string): boolean => {
    const current = String(searchParams[props.filterKey] || "");
    if (props.multiple) {
      return current?.split(",").includes(val) ?? false;
    }
    return current === val;
  };

  function handleClick(val: string) {
    const params = new URLSearchParams(window.location.search);

    if (props.multiple) {
      const current = params.get(props.filterKey)?.split(",") || [];
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];

      if (next.length > 0) params.set(props.filterKey, next.join(","));
      else params.delete(props.filterKey);
    } else {
      if (params.get(props.filterKey) === val) params.delete(props.filterKey);
      else params.set(props.filterKey, val);
    }

    navigate(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div class="pb-2 pt-1 mb-2">
      <h5 class="text-lg font-medium pl-1.5 mb-2">{props.title}</h5>
      <div class={`flex flex-wrap gap-1.5 grow-0 shrink-0 basis-auto`}>
        <For each={props.options}>
          {(option) => (
            <button
              onClick={() => handleClick(option.value)}
              class={cn(
                "px-3 py-1 rounded-full text-sm border transition-colors",
                isSelected(option.value)
                  ? "bg-foreground text-background border-accent"
                  : "bg-background text-foreground border-accent-foreground hover:border-ring",
              )}
            >
              {option.label}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}

export { FilterButtons };
