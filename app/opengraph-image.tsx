import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content";

/**
 * Generated rather than a static file, so it can never drift from the site's
 * own copy. Runs at build time and is cached, so there is no request cost.
 */
export const alt = "Wave, product engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { site } = await getContent();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f2ee",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="74" height="74" viewBox="0 0 100 100" fill="none">
            <g stroke="#1a1c1d" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="8" width="84" height="84" rx="25" />
              <path d="M 23 40 V 64 q 0 10.5 9 10.5 q 9 0 9 -10.5 V 36 q 0 -10.5 9 -10.5 q 9 0 9 10.5 V 64 q 0 10.5 9 10.5 q 9 0 9 -10.5 V 40" />
            </g>
          </svg>
          <div style={{ fontSize: 26, color: "#6c675c", letterSpacing: 2 }}>
            {site.handle.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1,
              letterSpacing: -3,
              color: "#16150f",
              display: "flex",
            }}
          >
            {site.title[0]}
          </div>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: "#16150f",
              display: "flex",
            }}
          >
            {site.title[1]}
          </div>
        </div>

        <div style={{ fontSize: 28, color: "#6c675c", display: "flex" }}>
          Products, contract work and open source
        </div>
      </div>
    ),
    size,
  );
}
