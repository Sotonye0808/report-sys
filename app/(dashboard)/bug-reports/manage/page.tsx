import { redirect, permanentRedirect } from "next/navigation";

/**
 * Deprecated route. Bug-report management now lives as a tab inside `/bug-reports`.
 * Permanent redirect preserves bookmarks while collapsing nav surface area.
 */
export default function Page() {
    permanentRedirect("/bug-reports?tab=manage");
    redirect("/bug-reports?tab=manage");
}
