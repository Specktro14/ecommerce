//"use client";
//
//import InputIncDec, { InputIncDecProps } from "./InputIncDec";
//import { useState, useRef, useEffect, useCallback } from "react";
//import {
//  Popover,
//  PopoverTrigger,
//  PopoverContent,
//  PopoverAnchor,
//  PopoverClose, // <-- import añadido
//} from "./ui/popover";
//import ProductOptionCarousel from "./ProductOptionCarousel";
//import { toast } from "sonner";
//import { usePathname } from "next/navigation";
//import {
//  createUnits,
//  Product,
//  ProductOptions,
//  UnitType,
//  UnitValue,
//  useCartStore,
//} from "@/store/useCartStore";
//import { productOptions } from "../data/productsOptions.json";

/* interface ProductCardProps {
  title: string;
  price: string;
  src: string;
  alt: string;
  inputOption: InputIncDecProps;
  productId?: keyof typeof productOptions;
} */

//
// const POPUP_WIDTH = 320;
// const POPUP_GAP = 10;
// const SM = 640;
//
/* const ProductCard = ({
  title,
  price,
  src,
  alt,
  inputOption,
  productId = "jamon",
}: ProductCardProps) => {
  // Eliminado: estado controlado 'open'
  // Popover uncontrolled: Radix gestiona apertura/cierre.
  const [side, setSide] = useState<"left" | "right" | "bottom">("right");
  const sideRef = useRef<"left" | "right" | "bottom">(side);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Ref hacia un botón PopoverClose oculto para cerrar desde lógica JS
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  const [selectedUnits, setSelectedUnits] = useState<number>(
    inputOption.defaultValue
  );
  const [selectedOptions, setSelectedOptions] = useState<ProductOptions>({});
  const { addItem } = useCartStore();

  // Obtener el ancho de la ventana después del montaje
  /*useEffect(() => {
    setVw(window.innerWidth);

    const handleResize = () => {
      setVw(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);*/

// 🧠 Solo un popover abierto en toda la página
/*useEffect(() => {
    if (open) {
      window.dispatchEvent(new CustomEvent("close-all-popovers"));
    }
    const listener = () => setOpen(false);
    window.addEventListener("close-all-popovers", listener);
    return () => window.removeEventListener("close-all-popovers", listener);
  }, [open]);*/

// 📏 Calcular si debe abrirse a la derecha o izquierda
/*const handleOpenChange = useCallback((next: boolean) => {
    if (next && cardRef.current) {
      if (vw < SM) {
        setSide("bottom")
      } else {
        const rect = cardRef.current.getBoundingClientRect();
        const preferRight = rect.right + POPUP_GAP + POPUP_WIDTH <= vw;
        setSide(preferRight ? "right" : "left");
      }
    }
    setOpen(next);
  }, [vw]);*/

// Calcular side antes de que Radix abra el popover (ejecutar en el trigger)
/*
  const computeSide = useCallback(() => {
    if (!cardRef.current) return;
    const vw = window.innerWidth;
    if (vw < SM) {
      if (sideRef.current !== "bottom") {
        sideRef.current = "bottom";
        setSide("bottom");
      }
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const computedSide: "left" | "right" =
      rect.right + POPUP_GAP + POPUP_WIDTH > vw ? "left" : "right";
    if (computedSide !== sideRef.current) {
      sideRef.current = computedSide;
      setSide(computedSide);
    }
  }, []);

  /*useEffect(() => {
    if (vw < SM && height !== 250) {
      setHeight(250)
    } else if (vw >= SM && height !== 175) {
      setHeight(175)
    }
  }, [vw, height])*/

// Cerrar al cambiar de ruta: disparar click al PopoverClose oculto si existe
/*
  useEffect(() => {
    closeRef.current?.click();
  }, [pathname])

  const handleAddToCartMemo = useCallback(() => {
    const product: Product = {
      id: Math.random(),
      name: title,
      price: parseFloat(price),
      unitType:
        inputOption.unit === "gr"
          ? "weight"
          : inputOption.unit === "uds"
          ? "quantity"
          : (inputOption.unit as UnitType),
      availableOptions: {
        cut: true,
        package: true,
        preparation: false,
        empanada: false,
        readyState: false,
      },
    };

    const units: UnitValue = createUnits(product.unitType, selectedUnits);

    addItem(product, units, selectedOptions);
    toast.success("Producto añadido al carrito");
    // cerrar popover usando el botón PopoverClose oculto
    closeRef.current?.click();
  }, [title, price, inputOption, selectedUnits, selectedOptions, addItem]);

  return (
    <Popover>
      <PopoverAnchor asChild>
        <div
          ref={cardRef}
          className="bg-white flex flex-col items-center relative"
        >
          <FallbackImage
            src={src}
            alt={alt}
            height={175}
            className="rounded-none"
          />
          <div className="w-full p-4 pt-0 flex flex-col items-center">
            <h3 className="font-semibold text-xl text-center mt-2">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{price}</p>

            <div className="flex flex-row gap-4 items-end justify-center w-full">
              <InputIncDec {...inputOption} onValueChange={setSelectedUnits} />
              <PopoverTrigger asChild>
                <button
                  onPointerDown={() => computeSide()} // calcular side antes de apertura
                  className="mt-2 py-2 px-3.5 flex flex-row items-center justify-center gap-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm"
                >
                  <ShoppingCart size={16} />
                </button>
              </PopoverTrigger>
            </div>
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent
        side={side}
        align="start"
        sideOffset={8}
        className="w-[89.2dvw] sm:w-80 bg-white rounded-2xl shadow-xl p-4"
      >
        <div className="flex flex-row justify-between mb-4">
          <h2 className="text-lg font-semibold">¿Cómo lo quiere?</h2>
          {/* Botón de cierre visual: usa PopoverClose para cerrar sin estado controlado }
          <PopoverClose asChild>
            <button className="size-6 bg-gray-200 rounded-2xl hover:bg-gray-300 text-sm flex items-center justify-center">
              <X size={15} />
            </button>
          </PopoverClose>
        </div>
        <ProductOptionCarousel
          productId={productId}
          onOptionsSelected={setSelectedOptions}
          closePopup={handleAddToCartMemo}
       />
        {/* Botón close oculto para control desde JS (handleAddToCart, cambio de ruta, etc.) }
        <PopoverClose asChild>
          <button ref={closeRef} className="hidden" aria-hidden />
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
  }; */

import { createSignal, Match, Switch } from "solid-js";

import { AddProductButton } from "./add_product_button";
import { UnitSelector } from "./unit_selector";
import { WeightSelector } from "./weigth_selector";

interface Props {
  id: string;
  title: string;
  price: string;
  unit: string;
  src: string;
  alt: string;
  type: "UNIDAD_FIJA" | "UNIDAD_VARIABLE" | "PESO_VARIABLE";
  weights: string[];
  estimatedWeight?: string;
}

function ProductCard(props: Props) {
  const [quantity, setQuantity] = createSignal("");
  const [addToCart, setAddToCart] = createSignal(false);

  // useEffect(on(addToCart), (value) => {
  //
  // })

  return (
    <div class="bg-background rounded-xl p-1 m-1 grid grid-rows-2">
      <img class="rounded-lg"></img>
      <div class="gap-2 flex flex-col p-1.5">
        <div class="mb-1.5 pl-1.5">
          <p class="text-foreground text-xl font-semibold">{props.title}</p>
          <div class="flex items-baseline justify-start gap-2">
            <p class="text-foreground text-3xl font-bold">{props.price}</p>
            <p class="text-foreground text-xl">{props.unit}</p>
          </div>
        </div>
        <Switch
          fallback={
            <UnitSelector addToCart={addToCart} setQuantity={setQuantity} />
          }
        >
          <Match when={props.type == "PESO_VARIABLE"}>
            <WeightSelector weights={props.weights} setQuantity={setQuantity} />
          </Match>
        </Switch>
        <AddProductButton setAddToCart={setAddToCart} />
      </div>
    </div>
  );
}

export { ProductCard, type Props };
