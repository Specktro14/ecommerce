import { Setter } from "solid-js";

import { CartIcon } from "./icons";
import { Button } from "./ui/button";

interface Props {
  setAddToCart: Setter<boolean>;
}

function AddProductButton(props: Props) {
  return (
    <Button
      onClick={() => props.setAddToCart(true)}
      class="flex justify-center items-center gap-2"
    >
      <p>Añadir producto</p>
      {/* Posiblemente desaparezca */}
      <CartIcon height={20} width={20}/>
    </Button>
  );
}

export { AddProductButton };
