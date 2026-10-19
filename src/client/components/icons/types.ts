import { JSX } from "solid-js/jsx-runtime";

type SVGAttributes = Partial<JSX.SvgSVGAttributes<SVGSVGElement>>;

export interface IconProps extends SVGAttributes {
  class?: string;
  width?: string | number;
  height?: string | number;
  color?: string;
  strokeWidth?: string | number;
}

