import { useLocation } from "@solidjs/router";
import { createSignal, createEffect, onCleanup, onMount } from "solid-js";

import { cn } from "~/lib/utils";

import { Navbar } from "./navbar";

export const Header = () => {
  const [opacity, setOpacity] = createSignal(0);
  const [smallDevice, setSmallDevice] = createSignal(false);
  const location = useLocation();

  onMount(() => {
    if (typeof window !== "undefined") {
      const checkDevice = () => setSmallDevice(window.innerWidth <= 768);
      checkDevice();
      window.addEventListener("resize", checkDevice);
      onCleanup(() => window.removeEventListener("resize", checkDevice));
    }
  });

  createEffect(() => {
    if (typeof window == "undefined") return;

    const isHome = location.pathname === "/";
    const isDesktop = !smallDevice();

    if (isHome && isDesktop) {
      setOpacity(0);
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight - 80;
        const newOpacity = Math.min((scrollY / windowHeight) * 1.5, 1);
        setOpacity(newOpacity);
      };

      window.addEventListener("scroll", handleScroll);
      onCleanup(() => window.removeEventListener("scroll", handleScroll));
    } else {
      setOpacity(1);
    }
  });

  return (
    <header
      class={cn(
        "max-w-screen w-full z-50 transition-all duration-300",

        location.pathname === "/"
          ? "fixed top-0 left-0"
          : "relative bg-background shadow-md",

        location.pathname === "/" && opacity() > 0.1
          ? "bg-background/90 backdrop-blur shadow-md"
          : "bg-transperent",

        smallDevice() && "bg-transparent",
      )}
      style={{ opacity: opacity() }}
    >
      <Navbar />
    </header>
  );
};
