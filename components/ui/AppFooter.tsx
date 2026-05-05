import Link from "next/link";
import { CONTENT } from "@/config/content";

interface AppFooterProps {
  className?: string;
  /** When false, the public-links row is hidden (dashboard chrome opts in by default). */
  showLinks?: boolean;
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export function AppFooter({ className, showLinks = true }: AppFooterProps) {
  const footer = CONTENT.footer as unknown as Record<string, unknown>;
  const links = (footer.links as FooterLink[] | undefined) ?? [];
  const year = new Date().getFullYear();

  return (
    <footer className={className} aria-label="Application footer">
      <div className="text-center text-xs text-ds-text-subtle py-4 flex flex-col items-center gap-2">
        {showLinks && links.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className="text-ds-text-secondary hover:text-ds-text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p>
          © {year} {String(footer.organization ?? "")}. {String(footer.rights ?? "")}
        </p>
        <p>
          {String(footer.builtByLabel ?? "")}{" "}
          <Link
            href={String(footer.developerUrl ?? "#")}
            target="_blank"
            rel="noreferrer"
            className="text-ds-text-link hover:underline"
          >
            {String(footer.developerName ?? "")}
          </Link>
        </p>
      </div>
    </footer>
  );
}
