import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: { projectId: "k8n4gdum", dataset: "production" },
  /**
   * The Studio shares a root with a Next.js app, so Vite picks up the app's
   * postcss.config.mjs and fails on Tailwind v4's plugin, which it can't load.
   * The Studio needs no PostCSS at all, so clear it.
   */
  vite: (config) => ({
    ...config,
    css: { ...config.css, postcss: {} },
  }),
})
