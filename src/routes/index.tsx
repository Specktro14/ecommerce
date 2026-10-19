import { Title } from "@solidjs/meta";
import { onMount, createSignal, onCleanup } from "solid-js";

import Counter from "~/client/components/Counter";
import { CustomCarousel } from "~/client/components/Custom-carousel";
import { ModeToggle } from "~/client/components/theme-toggle";

export default function Home() {
  const [inView, setInView] = createSignal(true);

  onMount(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight - 80;
      const newInView = scrollY < windowHeight;
      setInView(newInView);
    };
    window.addEventListener("scroll", handleScroll);
    onCleanup(() => {
      window.removeEventListener("scroll", handleScroll);
    });
  });

  return (
    <main>
      <Title>Alimentacion Guillen</Title>
      <h1>Hello world!</h1>
      <h1 class="bg-red-500 text-white font-sans">Hello world!</h1>
      <Counter />
      <p>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
      <ModeToggle />
      <CustomCarousel inView={inView()} />
    </main>
  );
}
