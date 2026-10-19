import { A } from "@solidjs/router";
import { useLocation } from "@solidjs/router";
import { createSignal, createEffect } from "solid-js";

import { cn } from "~/lib/utils";

import { Button } from "../ui/button";
import { CartButton } from "./cart-button";

interface NavbarItemProps {
  href: string;
  children: string;
  isActive?: boolean;
}

const navbarItems = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/noticias", label: "Noticias" },
  { href: "/contacto", label: "Contacto" },
];

const subcategorias = [
  { href: "/tienda/carnes", label: "Carnes" },
  { href: "/tienda/embutidos", label: "Embutidos" },
  { href: "/tienda/preparados", label: "Preparados" },
  { href: "/tienda/gourmet", label: "Gourmet" },
  { href: "/tienda/otros", label: "Otros" },
];

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  return (
    <Button
      variant="ghost"
      class={cn(
        "bg-transparent hover:bg-transparent text-foreground hover:text-foreground hover:underline hover:underline-offset-4 hover:decoration-2 hover:-translate-y-0.5 transition-all ease-in text-lg",
        isActive &&
          "bg-background text-foreground rounded-md hover:text-foreground",
      )}
    >
      <A href={href}>{children}</A>
    </Button>
  );
};

const NavbarItemMobile = ({ href, children }: NavbarItemProps) => {
  return (
    <Button
      variant="ghost"
      //TODO Comprobar colores bg y text
      class="bg-transparent hover:bg-transparent text-foreground hover:text-foreground hover:underline hover:underline-offset-4 hover:decoration-2 hover:-translate-y-0.5 transition-all ease-in text-lg"
    >
      <A href={href}>{children}</A>
    </Button>
  );
};

export const Navbar = () => {
  //TODO Repensar el navbar completo
  const pathname = useLocation();
  const [hoverProductos, setHoverProductos] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);

  // ✅ 1. Estado para controlar el montaje
  const [isMounted, setIsMounted] = createSignal(false);

  // ✅ 2. Activamos el estado una vez que el componente se monta en el cliente
  createEffect(() => {
    setIsMounted(true);
  }, []);

  createEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // ✅ 3. Si no está montado, mostramos un placeholder estático (sin lógica ni IDs complejos)
  // Esto evita el error de "Hydration Mismatch" porque el servidor y el cliente inicial coinciden.
  if (!isMounted) {
    return (
      <div class="w-full h-12 sm:h-16 bg-background border-b flex items-center pl-4">
        {/* Mostramos solo el logo estático para evitar salto visual brusco */}
        <div class="relative w-9 h-9 sm:w-12 sm:h-12 mx-2.5">
          <img
            src="/logo_HLG.webp"
            alt="Logo"
            class="object-contain"
            sizes="(min-width: 640px) 28px, 52px"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div class="hidden md:flex relative z-50">
        <nav
          //TODO Comprobar colores bg y text
          class="w-full h-16 grid grid-cols-3 pl-4 bg-background text-foreground border-b font-medium"
          onMouseLeave={() => setHoverProductos(false)}
        >
          <div class="flex items-center px-7">
            <A href={"/"}>
              <img src="/logo_HLG.webp" alt="Logo" width={52} height={52} />
            </A>
          </div>

          <div class="items-center justify-center flex">
            {navbarItems.map((item) =>
              item.href === "/tienda" ? (
                <div
                  class="relative h-10 flex items-center"
                  onMouseEnter={() => setHoverProductos(true)}
                >
                  <NavbarItem
                    href={item.href}
                    isActive={pathname.pathname.includes(item.href)}
                  >
                    {item.label}
                  </NavbarItem>
                </div>
              ) : (
                <div onMouseEnter={() => setHoverProductos(false)}>
                  <NavbarItem
                    href={item.href}
                    isActive={item.href === pathname.pathname}
                  >
                    {item.label}
                  </NavbarItem>
                </div>
              ),
            )}
          </div>
          <div class="flex flex-row justify-end items-center px-8">
            <CartButton />
          </div>
        </nav>

        {hoverProductos && (
          <div
            onMouseEnter={() => setHoverProductos(true)}
            onMouseLeave={() => setHoverProductos(false)}
            class="absolute top-16 left-0 w-full z-40"
          >
            <div
              class={cn(
                "bg-background/70 text-foreground shadow-md border-b transform transition-all duration-300 ease-in-out",
                hoverProductos()
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-4 pointer-events-none",
              )}
            >
              <div class="py-3 px-8 flex gap-12 justify-center">
                {subcategorias.map((sub) => (
                  <A href={sub.href} class="hover:text-orange-600 transition">
                    {sub.label}
                  </A>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div class="md:hidden flex overflow-hidden">
        <nav class="w-full h-12 sm:h-16 grid grid-cols-2 bg-background text-foreground border-b font-medium">
          <div class="flex items-center mx-2.5 my-1.5 relative w-9 h-9 sm:w-12 sm:h-12">
            <A href={"/"}>
              <img
                src="/logo_HLG.webp"
                alt="Logo"
                class="object-contain"
                sizes="(min-width: 640px) 28px, 52px"
              />
            </A>
          </div>
          <div class="flex items-center justify-end pr-4 gap-1">
            <CartButton />
            <Button
              variant="ghost"
              class="bg-transparent hover:bg-transparent text-foreground hover:text-foreground hover:underline hover:underline-offset-4 hover:decoration-2 hover:-translate-y-0.5 transition-all ease-in text-lg"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-menu-icon lucide-menu text-foreground hover:text-foreground size-6"
              >
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
            </Button>
          </div>
        </nav>

        {isOpen() && (
          <div class="fixed top-12 sm:top-20 inset-x-0 z-40 bg-background/40 text-foreground shadow-md border-b backdrop-blur-sm">
            <div class="py-3 px-8 flex flex-col gap-4">
              {navbarItems.map((item) => (
                <NavbarItemMobile
                  href={item.href}
                  isActive={item.href === pathname.pathname}
                >
                  {item.label}
                </NavbarItemMobile>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/*"use client";

import A from "next/A";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createEffect, createSignal } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import CartButton from "./CartButton"

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const navbarItems = [
  { href: "/", children: "Inicio" },
  { href: "/tienda", children: "Tienda" },
  { href: "/noticias", children: "Noticias" },
  { href: "/contacto", children: "Contacto" },
];

const subcategorias = [
  { href: "/tienda/carnes", children: "Carnes" },
  { href: "/tienda/embutidos", children: "Embutidos" },
  { href: "/tienda/preparados", children: "Preparados" },
  { href: "/tienda/gourmet", children: "Gourmet" },
  { href: "/tienda/otros", children: "Otros" }
];

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  return (
    <Button
      asChild
      variant="ghost"
      class={cn(
        "bg-transparent hover:bg-transparent text-white hover:text-white hover:underline hover:underline-offset-4 hover:decoration-2 hover:-translate-y-0.5 transition-all ease-in text-lg",
        isActive &&
          "bg-white text-black rounded-md hover:bg-white hover:text-black hover:no-underline"
      )}
    >
      <A href={href}>{children}</A>
    </Button>
  );
};

const NavbarItemMobile = ({ href, children }: NavbarItemProps) => {
  return (
    <Button
      asChild
      variant="ghost"
      class="bg-transparent hover:bg-transparent text-black hover:text-black hover:underline hover:underline-offset-4 hover:decoration-2 hover:-translate-y-0.5 transition-all ease-in text-lg"
    >
      <A href={href}>{children}</A>
    </Button>
  );
};

export const Navbar = () => {
  const pathname = usePathname();
  const [hoverProductos, setHoverProductos] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);
  
  createEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      <div class="hidden md:flex relative z-50">
        <nav
          class="w-full h-16 grid grid-cols-3 pl-4 bg-zinc-800 text-white border-b font-medium"
          onMouseLeave={() => setHoverProductos(false)}
        >
          <div class="flex items-center px-7">
            <A href={"/"}>
              <Image src="/logo_HLG.webp" alt="Logo" width={52} height={52} />
            </A>
          </div>

          <div class="items-center justify-center flex">
            {navbarItems.map((item) =>
              item.href === "/tienda" ? (
                <div
                  key={item.href}
                  class="relative h-10 flex items-center"
                  onMouseEnter={() => setHoverProductos(true)}
                >
                  <NavbarItem
                    href={item.href}
                    isActive={pathname.includes(item.href)}
                  >
                    {item.children}
                  </NavbarItem>
                </div>
              ) : (
                <div
                  key={item.href}
                  onMouseEnter={() => setHoverProductos(false)}
                >
                  <NavbarItem
                    href={item.href}
                    isActive={item.href === pathname}
                  >
                    {item.children}
                  </NavbarItem>
                </div>
              )
            )}
          </div>
          <div class="flex flex-row justify-end items-center px-8">
            <CartButton/>
          </div>
        </nav>

        {hoverProductos && (
          <div
            onMouseEnter={() => setHoverProductos(true)}
            onMouseLeave={() => setHoverProductos(false)}
            class="absolute top-16 left-0 w-full z-40"
          >
            <div
              class={cn(
                "bg-black/70 text-white shadow-md border-b transform transition-all duration-300 ease-in-out",
                hoverProductos
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-4 pointer-events-none"
              )}
            >
              <div class="py-3 px-8 flex gap-12 justify-center">
                {subcategorias.map((sub) => (
                  <A
                    key={sub.href}
                    href={sub.href}
                    class="hover:text-orange-600 transition"
                  >
                    {sub.children}
                  </A>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div class="md:hidden flex overflow-hidden">
        <nav class="w-full h-12 sm:h-16 grid grid-cols-2 bg-zinc-800 text-white border-b font-medium">
          <div class="flex items-center mx-2.5 my-1.5 relative w-9 h-9 sm:w-12 sm:h-12">
            <A href={"/"}>
              <Image
                src="/logo_HLG.webp"
                alt="Logo"
                fill
                class="object-contain"
                sizes="(min-width: 640px) 28px, 52px"
              />
            </A>
          </div>
          <div class="flex items-center justify-end pr-4 gap-1">
            <CartButton/>
            <Button
              variant="ghost"
              class="bg-transparent hover:bg-transparent text-white hover:text-white hover:underline hover:underline-offset-4 hover:decoration-2 hover:-translate-y-0.5 transition-all ease-in text-lg"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu class="text-white size-6" />
            </Button>
          </div>
        </nav>

        {isOpen && (
          <div class="fixed top-12 sm:top-20 inset-x-0 z-40 bg-white/40 text-black shadow-md border-b backdrop-blur-sm">
            <div class="py-3 px-8 flex flex-col gap-4">
              {navbarItems.map((item) => (
                <NavbarItemMobile
                  key={item.href}
                  href={item.href}
                  isActive={item.href === pathname}
                >
                  {item.children}
                </NavbarItemMobile>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
*/
