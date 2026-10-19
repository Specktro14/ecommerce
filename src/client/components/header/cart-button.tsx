import { A } from "@solidjs/router";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const items = [1, 2, 3];
export const CartButton = () => {
  return (
    <>
      <Button
        variant="ghost"
        class="relative text-foreground hover:text-foreground hover:bg-transparent size-12"
      >
        <A href={"/carrito"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-shopping-cart-icon lucide-shopping-cart size-5 sm:size-7"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </A>
      </Button>
      {items.length > 0 && (
        <>
          <Badge class="absolute flex items-center justify-center bg-red-700 text-white text-center w-3.5 h-5 py-0 top-2.25 sm:top-3.5 md:top-3 right-18 md:right-8 rounded-xl transition-all ease-in-out z-10">
            {items.length}
          </Badge>
          <Badge class="absolute flex items-center justify-center bg-red-700 text-background text-center w-3.5 h-5 scale-85 py-0 top-2.25 sm:top-3.5 md:top-3 right-18 md:right-8 rounded-xl transition-all ease-in-out z-8 duration-2000 animate-ping"></Badge>
        </>
      )}
    </>
  );
};
