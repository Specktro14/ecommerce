import BreadcrumbNav from "./breadcrumbs-nav";

interface SectionTopProps {
  pathname: string;
}

//! Descripciones de las categorias para la db
const titleCases = {
  tienda: "Todos los productos",
  carnes: "Nuestras mejores carnes",
  embutidos: "Embutidos de la mejor calidad",
  preparados: "Preparados listos para ti",
  otros: "Productos de primera",
} as const;

type TitleCaseKey = keyof typeof titleCases;

const SectionTop = ({ pathname }: SectionTopProps) => {
  const segments = pathname.split("/").filter(Boolean);

  const second = segments[1];
  const title =
    second &&
    (Object.keys(titleCases) as TitleCaseKey[]).includes(second as TitleCaseKey)
      ? titleCases[second as TitleCaseKey]
      : titleCases["tienda"] || "Todos los productos";
  return (
    <>
      <h1 class="text-4xl font-semibold text-foreground-light tracking-tight">
        {title}
      </h1>
      <BreadcrumbNav segments={segments} />
    </>
  );
};

export { SectionTop };
