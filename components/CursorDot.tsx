"use client";

import { useEffect, useRef } from "react";

/** trailing dot that swells over anything clickable; hidden on touch */
export function CursorDot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = ref.current;
    if (!dot) return;

    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { ...target };
    let frame = 0;

    const render = () => {
      pos.x += (target.x - pos.x) * 0.22;
      pos.y += (target.y - pos.y) * 0.22;
      dot.style.left = `${pos.x}px`;
      dot.style.top = `${pos.y}px`;
      frame = requestAnimationFrame(render);
    };

    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      dot.dataset.active = "true";
      const el = e.target as Element | null;
      dot.dataset.hot = String(
        !!el?.closest?.("a, button, [role='button']"),
      );
    };

    const leave = () => {
      dot.dataset.active = "false";
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div ref={ref} className="cursor-dot" data-active="false" aria-hidden="true" />;
}
