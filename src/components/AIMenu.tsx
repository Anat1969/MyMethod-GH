import { useEffect, useRef } from "react";
import type { DetailedHTMLProps, HTMLAttributes } from "react";
export type MenuItem = {
  label: string;
  hint?: string;
  pressed?: boolean;
  onSelect: () => unknown;
};
interface MenuElement extends HTMLElement {
  items: MenuItem[];
  status: string;
}
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ai-menu": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
export function AIMenu({
  items,
  status,
}: {
  items: MenuItem[];
  status: string;
}) {
  const ref = useRef<MenuElement>(null);
  useEffect(() => {
    let alive = true;
    customElements.whenDefined("ai-menu").then(() => {
      if (alive && ref.current) {
        ref.current.items = items;
        ref.current.status = status;
      }
    });
    return () => {
      alive = false;
    };
  }, [items, status]);
  return <ai-menu ref={ref} />;
}
