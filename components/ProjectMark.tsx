import type { View } from "@/data/site";
import { dockIcons } from "./icons";

/**
 * A project's face, in one place.
 *
 * Three sources, in order: its own square app icon, a glyph-only logo sitting on
 * the brand tile, or a designed glyph from the icon set. Nothing is generated —
 * a project without a mark renders nothing rather than an invented one.
 */
export function ProjectMark({
  view,
  className = "",
}: {
  view: View;
  className?: string;
}) {
  const Icon = dockIcons[view.id];
  if (!view.appIcon && !view.markSrc && !Icon) return null;

  return (
    <span
      className={`pmark ${className}`.trim()}
      data-icon={view.id}
      style={
        {
          backgroundColor: view.appIcon ? undefined : view.tile,
          "--tile-bg": view.tile,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {view.appIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={view.appIcon} alt="" />
      ) : view.markSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="pmark__glyph" src={view.markSrc} alt="" />
      ) : (
        Icon && <Icon />
      )}
    </span>
  );
}
