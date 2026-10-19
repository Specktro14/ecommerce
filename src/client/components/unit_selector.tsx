import { Accessor, createEffect, createSignal, Setter, on } from "solid-js";

import { Button } from "./ui/button";

interface Props {
  addToCart: Accessor<boolean>
  setQuantity: Setter<string>;
}

function UnitSelector(props: Props) {
  const [n, setN] = createSignal(1);

  createEffect(on(props.addToCart, (value) => {
    if (value) {
      props.setQuantity(n().toString());
    }
  }))

  return (
    <div class="p-0 grid grid-cols-4 gap-0 border-none">
      <Button onClick={() => setN(n() - 1)}> - </Button>
      <span class="col-span-2">{n()}</span>
      <Button onClick={() => setN(n() + 1)}> + </Button>
    </div>
  );
}

export { UnitSelector };
