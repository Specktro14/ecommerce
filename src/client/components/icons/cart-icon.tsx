import { IconProps } from "./types";
import { cn } from "~/lib/utils";

function CartIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? "24"}
      height={props.height ?? "24"}
      viewBox={props.viewBox ?? "0 0 24 24"}
      fill={props.color ?? "none"}
      stroke="currentColor"
      stroke-width={props.strokeWidth ?? "2.5"}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cn(
        "lucide lucide-shopping-cart-icon lucide-shopping-cart",
        props.class,
      )}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

export { CartIcon };
