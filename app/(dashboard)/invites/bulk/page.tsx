import { redirect, permanentRedirect } from "next/navigation";

/**
 * Deprecated route. Bulk invites now live as a tab inside `/invites`.
 * Permanent redirect preserves bookmarks while collapsing nav surface area.
 */
export default function Page() {
    // Use 308 (permanentRedirect) so cached deep links update on subsequent navigations.
    permanentRedirect("/invites?tab=bulk");
    // Unreachable — keeps the type checker satisfied.
    redirect("/invites?tab=bulk");
}
