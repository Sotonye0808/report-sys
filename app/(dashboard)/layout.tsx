"use client";

/**
 * app/(dashboard)/layout.tsx
 * Unified shell for ALL authenticated roles.
 *
 * Desktop: collapsible sidebar (240px expanded / 64px icon-only collapsed).
 *          Collapse toggle lives in the header — no hamburger on desktop.
 * Mobile:  drawer-based sidebar, toggled by a hamburger shown only on mobile.
 * Inbox bell: always visible for all roles.
 */

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Drawer, Dropdown, Avatar, Badge, Tooltip } from "antd";
import {
  MenuOutlined,
  LogoutOutlined,
  ProfileOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import type { MenuProps } from "antd";
import { useAuth } from "@/providers/AuthProvider";
import { useMockDbSubscription } from "@/lib/hooks/useMockDbSubscription";
import { mockDb } from "@/lib/data/mockDb";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";
import { getNavItems } from "@/config/nav";
import Button from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserRole } from "@/types/global";

const SIDEBAR_FULL_WIDTH = 240;
const SIDEBAR_ICON_WIDTH = 64;
const MOBILE_DRAWER_WIDTH = 240;

/* ── Sidebar ──────────────────────────────────────────────────────────────── */

interface SidebarProps {
  navItems: NavItem[];
  currentPath: string;
  collapsed: boolean;
  onClose?: () => void;
}

function Sidebar({ navItems, currentPath, collapsed, onClose }: SidebarProps) {
  return (
    <nav
      className="flex flex-col h-full bg-ds-surface-elevated border-r border-ds-border-base transition-all duration-200"
      style={{ width: collapsed ? SIDEBAR_ICON_WIDTH : SIDEBAR_FULL_WIDTH }}
    >
      {/* Brand mark */}
      <div
        className={[
          "flex items-center border-b border-ds-border-base flex-shrink-0 overflow-hidden",
          collapsed ? "justify-center px-0 py-5 h-16" : "gap-3 px-5 py-5",
        ].join(" ")}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-ds-lg bg-ds-brand-accent flex-shrink-0">
          <span className="text-white font-bold text-base leading-none">H</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-ds-text-primary text-sm leading-tight whitespace-nowrap">
            Harvesters
            <br />
            <span className="text-ds-text-secondary font-normal">Reporting</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <ul className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon as React.ComponentType<{ className?: string }>;
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");

          const linkContent = (
            <Link
              href={item.href}
              onClick={onClose}
              className={[
                "flex items-center rounded-ds-lg text-sm font-medium transition-colors no-underline",
                collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-ds-brand-accent/10 text-ds-brand-accent"
                  : "text-ds-text-secondary hover:bg-ds-surface-sunken hover:text-ds-text-primary",
              ].join(" ")}
            >
              <Icon
                className={[
                  "flex-shrink-0 text-base",
                  isActive ? "text-ds-brand-accent" : "text-ds-text-subtle",
                ].join(" ")}
              />
              {!collapsed && item.label}
            </Link>
          );

          return (
            <li key={item.key}>
              {collapsed ? (
                <Tooltip title={item.label} placement="right">
                  {linkContent}
                </Tooltip>
              ) : (
                linkContent
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── User menu ────────────────────────────────────────────────────────────── */

interface UserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

function UserMenu({ user, onLogout }: UserMenuProps) {
  const router = useRouter();

  const items: MenuProps["items"] = [
    {
      key: "name",
      label: (
        <div className="py-0.5">
          <p className="text-sm font-semibold text-ds-text-primary">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-ds-text-secondary">{user.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: CONTENT.nav.profile,
      onClick: () => router.push(APP_ROUTES.profile),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: CONTENT.nav.logout,
      danger: true,
      onClick: onLogout,
    },
  ];

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <button className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 outline-none focus:outline-1 focus:outline-ds-brand-accent rounded-ds-lg">
        <Avatar
          size={36}
          className="bg-ds-brand-accent text-white font-semibold text-sm flex-shrink-0"
        >
          {initials}
        </Avatar>
        <span className="hidden md:block text-sm font-medium text-ds-text-primary max-w-[120px] truncate">
          {user.firstName}
        </span>
      </button>
    </Dropdown>
  );
}

/* ── Header ───────────────────────────────────────────────────────────────── */

interface HeaderProps {
  user: AuthUser;
  onMobileMenuOpen: () => void;
  onDesktopCollapseToggle: () => void;
  sidebarCollapsed: boolean;
  onLogout: () => void;
  unreadCount?: number;
}

function Header({
  user,
  onMobileMenuOpen,
  onDesktopCollapseToggle,
  sidebarCollapsed,
  onLogout,
  unreadCount = 0,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="h-16 bg-ds-surface-elevated border-b border-ds-border-base flex items-center justify-between px-4 md:px-4 gap-4 flex-shrink-0">
      {/* Mobile-only hamburger */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={onMobileMenuOpen}
        className="md:hidden"
        aria-label="Open menu"
      />

      {/* Desktop-only collapse toggle */}
      <Button
        type="text"
        icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onDesktopCollapseToggle}
        className="hidden md:flex"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications bell — always visible for all roles */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-ds-lg hover:bg-ds-surface-sunken transition-colors text-ds-text-secondary hover:text-ds-text-primary bg-transparent border-none cursor-pointer"
          onClick={() => router.push(APP_ROUTES.inbox)}
          aria-label={CONTENT.nav.inbox as string}
        >
          <Badge count={unreadCount} size="small" offset={[2, -2]}>
            <BellOutlined className="text-base" />
          </Badge>
        </button>

        <UserMenu user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}

/* ── Layout ───────────────────────────────────────────────────────────────── */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const role = user?.role as UserRole | undefined;

  // Unread notifications for all authenticated users
  const notifications = useMockDbSubscription<AppNotification[]>("notifications", async () => {
    if (!user) return [];
    return mockDb.notifications.findMany({
      where: (n: AppNotification) => n.userId === user.id && !n.read,
    });
  });

  const unreadCount = notifications?.length ?? 0;

  if (!user) return null; // AuthProvider handles redirect to /login

  const navItems = getNavItems(role as UserRole);

  return (
    <div className="flex h-screen overflow-hidden bg-ds-surface-base">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 overflow-hidden transition-all duration-200"
        style={{ width: sidebarCollapsed ? SIDEBAR_ICON_WIDTH : SIDEBAR_FULL_WIDTH }}
      >
        <Sidebar navItems={navItems} currentPath={pathname} collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={MOBILE_DRAWER_WIDTH}
        styles={{ body: { padding: 0 }, header: { display: "none" } }}
        className="md:hidden"
      >
        <Sidebar
          navItems={navItems}
          currentPath={pathname}
          collapsed={false}
          onClose={() => setDrawerOpen(false)}
        />
      </Drawer>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          user={user}
          onMobileMenuOpen={() => setDrawerOpen(true)}
          onDesktopCollapseToggle={() => setSidebarCollapsed((v) => !v)}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={logout}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
