import { A } from "@solidjs/router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

interface BreadcrumbNavProps {
  segments: string[];
}

const BreadcrumbNav = ({ segments }: BreadcrumbNavProps) => {
  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = decodeURIComponent(seg)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label, isLast: i === segments.length - 1 };
  });

  return (
    <Breadcrumb class="pl-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink>
            <A href={"/"} class="text-tx-muted">
              Inicio
            </A>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {crumbs.length > 0 && <BreadcrumbSeparator />}

        {crumbs.map((c) => (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <A href={c.href} class="text-tx-muted">
                  {c.label}
                </A>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {!c.isLast && <BreadcrumbSeparator />}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNav;
