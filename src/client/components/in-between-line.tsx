import { cn } from "~/lib/utils";

interface Props {
  class?: string;
}

function InBetweenLine(props: Props) {
  return <hr class={cn("bg-black/50 my-0.5", props.class)} />;
}

export { InBetweenLine };
