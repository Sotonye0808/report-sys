import Link from "next/link";
import { CONTENT } from "@/config/content";

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className }: AppFooterProps) {
  const footer = CONTENT.footer as Record<string, string>;
  const year = new Date().getFullYear();

  return (
    <footer className={className} aria-label="Application footer">
      <div className="text-center text-xs text-ds-text-subtle py-4">
        <p>
          © {year} {footer.organization}. {footer.rights}
        </p>
        <p className="mt-1">
          {footer.builtByLabel}{" "}
          <Link
            href={footer.developerUrl}
            target="_blank"
            rel="noreferrer"
            className="text-ds-text-link hover:underline"
          >
            {footer.developerName}
          </Link>
        </p>
      </div>
    </footer>
  );
}
