export interface SVGNode {
  [key: string]: SVGValue;
}

export type SVGPrimitive = string;

export type SVGValue = SVGPrimitive | SVGNode | SVGNode[];
