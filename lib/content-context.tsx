"use client";

import { createContext, useContext, useMemo } from "react";
import type { View } from "@/data/site";
import { skills, socials } from "@/data/site";
import type { Content } from "./content";

/**
 * The content, handed from the server page to the client tree.
 *
 * The alternative was prop-drilling `views` through Shell into Dock, IndexList,
 * ProjectShowcase and the rest. A context keeps the component signatures they
 * already have, which was the whole point of shaping the GROQ to match.
 *
 * `skills` and `socials` stay in code: they are chrome, not content. Nobody is
 * going to open a CMS to reorder the dock's social links.
 */
const ContentCtx = createContext<Content | null>(null);

export function ContentProvider({
  value,
  children,
}: {
  value: Content;
  children: React.ReactNode;
}) {
  return <ContentCtx.Provider value={value}>{children}</ContentCtx.Provider>;
}

export function useContent() {
  const c = useContext(ContentCtx);
  if (!c) throw new Error("useContent must be used inside <ContentProvider>");

  return useMemo(() => {
    const byId = new Map(c.views.map((v) => [v.id, v]));
    return {
      views: c.views,
      site: c.site,
      skills,
      socials,
      dockViews: c.views.filter((v) => v.dock),
      getView: (id: string): View | undefined => byId.get(id),
    };
  }, [c]);
}
