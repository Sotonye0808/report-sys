import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/utils/auth";
import { ROLE_DASHBOARD_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

/**
 * Root page — server component.
 * Reads the auth cookie and redirects to the appropriate dashboard.
 * Unauthenticated users are sent to /login.
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME ?? "hrs_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    redirect("/login");
  }

  const role = payload.role as UserRole;
  const dashboardRoute = ROLE_DASHBOARD_ROUTES[role] ?? "/login";
  redirect(dashboardRoute);
}
