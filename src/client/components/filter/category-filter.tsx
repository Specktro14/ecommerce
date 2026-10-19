import { A } from "@solidjs/router";
import { For } from "solid-js";

import { categoryGroups as groups } from "~/data/groups.json";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";

function FilterCategories() {
  return (
    <div class="pb-1">
      <h5 class="text-lg text-foreground font-medium pl-1.5 mb-2">
        Categorías
      </h5>
      <Accordion
        class="text-foreground flex flex-col gap-0 px-3"
        collapsible={true}
      >
        <For each={groups}>
          {(group) => (
            <AccordionItem
              value={group.id}
              class="border-b-transparent transition-colors duration-200 data-expanded:border-b-black mb-1.5"
            >
              <AccordionTrigger class="py-0.5">
                <A href={group.groupLink}>{group.groupName}</A>
              </AccordionTrigger>
              <AccordionContent contentClass="flex flex-col pb-1">
                <For each={group.items}>
                  {(item) => (
                    <A
                      href={item.link}
                      class="px-2 py-1 text-sm hover:underline"
                    >
                      {item.name}
                    </A>
                  )}
                </For>
              </AccordionContent>
            </AccordionItem>
          )}
        </For>
      </Accordion>
    </div>
  );
}

export { FilterCategories };
