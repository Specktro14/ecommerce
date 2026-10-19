import { A } from "@solidjs/router";
import Autoplay from "embla-carousel-autoplay";
import { createEffect, createSignal, For } from "solid-js";

import { Button } from "./ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "./ui/carousel";

interface CarouselProps {
  inView: boolean;
}

const Images = [
  {
    src: "/exterior_tienda.webp",
    alt: "Exterior de la tienda",
    href: "/",
    class: "bg-amber-500",
  },
  {
    src: "/interior_tienda1.jpg",
    alt: "Interior de la tienda 1",
    href: "/tienda",
    class: "bg-emerald-500",
  },
  {
    src: "/interior_tienda2.jpg",
    alt: "Interior de la tienda 2",
    href: "/tienda",
    class: "bg-cyan-500",
  },
  {
    src: "/cocina.jpg",
    alt: "Cocina",
    href: "/productos/preparados",
    class: "bg-purple-500",
  },
];

export const CustomCarousel = ({ inView }: CarouselProps) => {
  const autoplay = Autoplay({
    delay: 3000,
    stopOnInteraction: false,
  });

  const [api, setApi] = createSignal<ReturnType<CarouselApi>>(undefined);
  const [isPlaying, setIsPlaying] = createSignal<boolean>(true);

  function previousButton() {
    if (api()) {
      api()?.scrollPrev();
      autoplay.reset();
    }
  }

  function nextButton() {
    if (api()) {
      api()?.scrollNext();
      autoplay.reset();
    }
  }

  function toggleAutoplay() {
    if (autoplay.isPlaying()) {
      autoplay.stop();
      setIsPlaying(false);
    } else {
      autoplay.play();
      setIsPlaying(true);
    }
  }

  createEffect(() => {
    if (!autoplay || !api()) return;
    try {
      if (inView) toggleAutoplay();
    } catch (e) {
      console.error("Error al controlar autoplay", e);
    }
  });

  return (
    <Carousel
      class="w-full h-screen relative"
      setApi={setApi}
      plugins={[autoplay]}
      opts={{ loop: true }}
    >
      <CarouselContent class="h-full ml-0">
        <For each={Images} fallback={<div>No hay imagenes disponibles</div>}>
          {(img) => (
            <CarouselItem class="w-full h-full relative pl-0">
              <div class={img.class}>{img.alt}</div>
              {/*<A href={img.href} class="w-full h-full block relative z-20">
                <img src={img.src} alt={img.alt} class="object-cover size-full"/>
              </A>*/}
            </CarouselItem>
          )}
        </For>
      </CarouselContent>
      <div class="absolute bottom-4 left-1/2 md:bottom-10 md:left-9/10 transform -translate-x-1/2 flex justify-center z-10">
        <CarouselPrevious onClick={previousButton} class="w-8 h-7 scale-125" />
        <Button
          class="w-12 h-10 bg-white/80 hover:bg-black/5 text-foreground rounded-full flex border border-zinc-300/50 items-center justify-center shadow-md"
          onClick={toggleAutoplay}
        >
          {!isPlaying() ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="black"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 40px; height: 40px;"
              class="lucide lucide-play-icon lucide-play"
            >
              <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="black"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 40px; height: 40px;"
              class="lucide lucide-pause-icon lucide-pause"
            >
              <rect x="14" y="3" width="5" height="18" rx="1" />
              <rect x="5" y="3" width="5" height="18" rx="1" />
            </svg>
          )}
        </Button>
        <CarouselNext onClick={nextButton} class="w-8 h-7 scale-125" />
      </div>
    </Carousel>
  );
};
