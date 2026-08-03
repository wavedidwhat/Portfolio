import { ImageResponse } from "next/og";

/**
 * Apple touch icons are composited onto the home screen with no transparency
 * handling, so this one is drawn on an opaque plate rather than left clear.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f2ee",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 100 100" fill="none">
          <g
            stroke="#1a1c1d"
            strokeWidth="8.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="8" y="8" width="84" height="84" rx="25" />
            <path d="M 23 40 V 64 q 0 10.5 9 10.5 q 9 0 9 -10.5 V 36 q 0 -10.5 9 -10.5 q 9 0 9 10.5 V 64 q 0 10.5 9 10.5 q 9 0 9 -10.5 V 40" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
