"use client";

import { useEffect, useState } from "react";
import { haptic, isMuted, playTone, setMuted } from "@/lib/feedback";

type Theme = "light" | "dark";

export function Header({
  view,
  onAbout,
  onFlipTheme,
}: {
  view: string;
  onAbout: () => void;
  /** Shell owns this: the flip happens under the curtain, mid-sweep */
  onFlipTheme: () => void;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [sound, setSound] = useState(false);

  // pick up whatever the no-flash script already resolved
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
    setSound(!isMuted());
  }, []);

  const toggleTheme = () => {
    // keep the icon in sync locally; Shell does the actual DOM/storage write
    // at the peak of the curtain so the repaint is hidden
    setTheme(theme === "dark" ? "light" : "dark");
    onFlipTheme();
    haptic();
    playTone("chip");
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setMuted(!next);
    haptic();
    if (next) playTone("chip");
  };

  return (
    <header className="header">
      <button
        type="button"
        className="chip chip--icon"
        onClick={toggleSound}
        onMouseEnter={() => playTone("chip")}
        aria-pressed={sound}
        aria-label={sound ? "Mute interface sounds" : "Enable interface sounds"}
      >
        {sound ? (
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4 8v4h3l4 3V5L7 8H4Z"
              fill="currentColor"
            />
            <path
              d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5.5a6 6 0 0 1 0 9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 8v4h3l4 3V5L7 8H4Z" fill="currentColor" />
            <path
              d="M14 8l4 4M18 8l-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      <button
        type="button"
        className="chip chip--icon"
        onClick={toggleTheme}
        onMouseEnter={() => playTone("chip")}
        aria-label="Toggle light and dark theme"
        aria-pressed={theme === "dark"}
      >
        <svg className="icon-sun" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M18 12a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
            clipRule="evenodd"
          />
          <path
            fill="currentColor"
            d="M17 6a1 1 0 1 1 2 0v3a1 1 0 0 1-2 0V6ZM29.1 13.4a1 1 0 0 1 .6 1.9l-2.8.9a1 1 0 1 1-.6-1.9l2.8-.9ZM29.7 20.8a1 1 0 0 1-.6 1.9l-2.9-.9a1 1 0 1 1 .6-1.9l2.9.9ZM19 30a1 1 0 0 1-2 0v-3a1 1 0 1 1 2 0v3ZM6.9 22.7a1 1 0 1 1-.6-1.9l2.8-.9a1 1 0 1 1 .6 1.9l-2.8.9ZM6.3 15.3a1 1 0 1 1 .6-1.9l2.9.9a1 1 0 1 1-.6 1.9l-2.9-.9Z"
          />
        </svg>
        <svg className="icon-moon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12.5 8.5a11 11 0 0 1 8.8-1 7.4 7.4 0 0 0-3.7 4.7l-.1.4A7.5 7.5 0 0 0 28.7 20.4a11 11 0 0 1-5.2 7.1l-.5.3c-5 2.6-11.2.9-14.2-3.8l-.3-.5c-2.9-5.1-1.3-11.6 3.5-14.8l.5-.2Z"
          />
        </svg>
      </button>

      {view !== "about" && (
        <button
          type="button"
          className="chip"
          onClick={() => {
            haptic();
            onAbout();
          }}
          onMouseEnter={() => playTone("chip")}
        >
          about
        </button>
      )}
    </header>
  );
}
