import { ContentProvider } from "@/lib/content-context";
import { getContent } from "@/lib/content";
import { Shell } from "@/components/Shell";

/**
 * The one server boundary. Content is fetched here and handed to the client
 * tree, so nothing below has to know whether it came from Sanity or the
 * bundled fallback.
 */
export default async function Page() {
  const content = await getContent();
  return (
    <ContentProvider value={content}>
      <Shell />
    </ContentProvider>
  );
}
