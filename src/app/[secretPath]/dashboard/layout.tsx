"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Users,
  Trophy,
  GraduationCap,
  FileCheck2,
  LogOut,
  Moon,
  Sun,
  PanelLeft,
  PanelLeftClose,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/store/use-admin-auth-store";
import { useAdminSocket } from "@/hooks/use-admins";
import { adminPath } from "@/lib/constants";

export default function SecretDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { admin, token, isAuthenticated, hasHydrated, logout } =
    useAdminAuthStore();
  const { connected, lastEvent } = useAdminSocket(token);

  // Talab bo'yicha sidebar default holatda ixcham (faqat iconlar / w-16) turadi,
  // tugma bosilganda kengayadi (yozuvlari bilan / w-64)
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace(adminPath("login"));
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground bg-minimal-grid">
        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  const navItems = [
    {
      label: "Adminlar",
      href: adminPath("dashboard"),
      icon: Users,
    },
    {
      label: "Hakatonlar",
      href: adminPath("dashboard/hackathons"),
      icon: Trophy,
    },
    {
      label: "Topshirilgan vazifalar",
      href: adminPath("dashboard/submissions"),
      icon: FileCheck2,
    },
    {
      label: "Foydalanuvchilar",
      href: adminPath("dashboard/users"),
      icon: GraduationCap,
    },
  ];

  const handleLogout = () => {
    logout();
    router.replace(adminPath("login"));
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Backdrop overlay on mobile when sidebar is expanded */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] md:hidden"
        />
      )}

      {/* Collapsible Minimal Sidebar:
          - Collapsed (default): w-16 on desktop (icons only)
          - Expanded: w-64 (icons + text labels)
      */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background/95 backdrop-blur-md transition-all duration-200 ease-in-out ${
          sidebarOpen
            ? "w-64 translate-x-0"
            : "-translate-x-full md:translate-x-0 md:w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center border-b px-3">
          {sidebarOpen ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold shadow-sm">
                  A
                </div>
                <span className="truncate text-sm font-semibold tracking-tight">
                  Boshqaruv Paneli
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(false)}
                title="Kichraytirish"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Menyuni kengaytirish"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold shadow-sm hover:opacity-85 transition-opacity cursor-pointer"
              >
                A
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          {sidebarOpen ? (
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Bo&apos;limlar
            </div>
          ) : (
            <div className="my-1 border-t border-border/40" />
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!sidebarOpen ? item.label : undefined}
                className={`flex items-center rounded-lg transition-colors ${
                  sidebarOpen
                    ? "gap-3 px-3 py-2.5 text-sm font-medium"
                    : "h-10 w-10 mx-auto justify-center"
                } ${
                  active
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && (
                  <span className="truncate text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}

          {sidebarOpen ? (
            <div className="pt-4 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Hujjatlar
            </div>
          ) : (
            <div className="my-2 border-t border-border/40" />
          )}

          <a
            href="http://localhost:8000/api-docs"
            target="_blank"
            rel="noreferrer"
            title={!sidebarOpen ? "Swagger API" : undefined}
            className={`flex items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors ${
              sidebarOpen
                ? "justify-between px-3 py-2.5 text-sm"
                : "h-10 w-10 mx-auto justify-center"
            }`}
          >
            {sidebarOpen ? (
              <>
                <span>Swagger API</span>
                <ExternalLink className="h-4 w-4 shrink-0" />
              </>
            ) : (
              <ExternalLink className="h-4 w-4 shrink-0" />
            )}
          </a>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="border-t p-2">
          {sidebarOpen ? (
            <div className="p-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-secondary text-foreground font-semibold text-xs">
                  {admin?.full_name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{admin?.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{admin?.username}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start h-9 text-sm"
              >
                <LogOut className="mr-2 h-4 w-4 shrink-0" />
                Chiqish
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <div
                title={`${admin?.full_name || "Admin"} (@${admin?.username || ""})`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-secondary text-foreground font-semibold text-xs cursor-default"
              >
                {admin?.full_name?.charAt(0).toUpperCase() || "A"}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Tizimdan chiqish"
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 shrink-0" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content with Subtle Grid ("Kletka") Background */}
      <div
        className={`relative flex-1 flex flex-col min-w-0 bg-minimal-grid transition-all duration-200 ${
          sidebarOpen ? "md:pl-64" : "md:pl-16 pl-0"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,var(--background)_100%)]" />

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-sm bg-background"
              onClick={() => setSidebarOpen((prev) => !prev)}
              title={sidebarOpen ? "Sidebarni kichraytirish" : "Sidebarni kengaytirish"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="mr-2 h-4 w-4" />
              ) : (
                <PanelLeft className="mr-2 h-4 w-4" />
              )}
              <span>Menyu</span>
            </Button>

            <span className="text-sm font-medium text-muted-foreground">
              {pathname.includes("/hackathons")
                ? "Hakatonlar boshqaruvi"
                : pathname.includes("/submissions")
                ? "Topshirilgan vazifalar kuzatuvi"
                : pathname.includes("/users")
                ? "Foydalanuvchilar boshqaruvi"
                : "Adminlar boshqaruvi"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {lastEvent && (
              <span className="hidden lg:inline-block text-xs text-muted-foreground border bg-background px-3 py-1 rounded-md">
                {lastEvent}
              </span>
            )}

            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-foreground" : "bg-muted-foreground/40"
                }`}
              />
              {connected ? "Online" : "Offline"}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-background"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Mavzuni o'zgartirish"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </header>

        <main className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
