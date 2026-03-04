import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/config/routes";

// Settings are now consolidated into the Profile page (Appearance + Notifications tabs).
export default function Page() {
  redirect(`${APP_ROUTES.profile}?tab=appearance`);
}
