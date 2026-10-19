import { For, Setter } from "solid-js";

import { ToggleGroup, ToggleGroupItem } from "./ui/toggle_group";

interface Props {
  weights: string[];
  setQuantity: Setter<string>;
}

function WeightSelector(props: Props) {
  const middleIndex = props.weights.length / 2;
  const middleValue = props.weights.at(middleIndex);

  return (
    <ToggleGroup
      defaultValue={middleValue ? middleValue : ""}
      onChange={(value) => props.setQuantity(value ?? "")}
      class="transition-all ease-in-out"
    >
      <For each={props.weights}>
        {(item) => <ToggleGroupItem value={item}>{item}</ToggleGroupItem>}
      </For>
    </ToggleGroup>
  );
}

export { WeightSelector };
