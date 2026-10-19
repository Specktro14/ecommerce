import { createSignal } from "solid-js";

import {
  Slider,
  SliderFill,
  SliderThumb,
  SliderTrack,
  SliderLabel,
  SliderValueLabel,
} from "../ui/slider";

function PriceRange() {
  const [minValue, setMinValue] = createSignal(0);
  //TODO: Conseguir que el maxValue se ajuste al precios maximo del producto en cada momento
  const [maxValue, setMaxValue] = createSignal(200);

  return (
    <div class="pb-2 pt-1 mb-2">
      <h5 class="text-lg font-medium pl-1.5 mb-2">Precios</h5>
      <div>
        <Slider
          minValue={0}
          maxValue={200}
          defaultValue={[minValue(), maxValue()]}
          onChange={(val) => {
            setMinValue(val[0]);
            setMaxValue(val[1]);
          }}
          getValueLabel={(params) =>
            `${params.values[0]}€ - ${params.values[1]}€`
          }
          class="w-auto space-y-3"
        >
          <SliderTrack class="scale-90">
            <SliderFill />
            <SliderThumb class="scale-85" />
            <SliderThumb class="scale-85" />
          </SliderTrack>
          <div class="flex w-full justify-between px-1.5">
            <input
              type="number"
              min={0}
              max={200}
              value={minValue()}
              onInput={(e) => {
                const rawValue = e.currentTarget.value;
                console.log("Input escribiendo:", rawValue); // ¿Esto aparece?

                // Convertir seguro
                const val = rawValue === "" ? 0 : parseInt(rawValue, 10);

                if (!isNaN(val)) {
                  setMinValue(val);
                  console.log("Nueva señal minValue:", val);
                }
              }}
              placeholder="Min"
              class="focus:outline-none border-b  invalid:text-red-600 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <input
              type="number"
              min={0}
              max={200}
              value={maxValue()}
              onInput={(e) => {
                const val = Number(e.currentTarget.value);
                setMaxValue(val);
              }}
              placeholder="Max"
              class="focus:outline-none border-b invalid:text-red-600 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </Slider>
      </div>
    </div>
  );
}

export { PriceRange };
