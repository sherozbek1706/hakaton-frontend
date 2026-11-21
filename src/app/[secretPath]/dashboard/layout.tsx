"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Users,
  Trophy,
  LogOut,
  Moon,
  Sun,
  Menu,
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
  ];

  const handleLogout = () => {
    logout();
    router.replace(adminPath("login"));
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Minimal Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background/95 backdrop-blur-xs transition-transform duration-200 md:static md:translate-x-0 flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-sm font-bold">
            A
          </div>
          <span className="text-base font-semibold tracking-tight">
            Boshqaruv Paneli
          </span>
        </div>

        <div className="flex-1 space-y-1.5 p-3.5">
          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Bo&apos;limlar
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Hujjatlar
          </div>
          <a
            href="http://localhost:8000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <span>Swagger API</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="border-t p-4 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-secondary text-foreground font-semibold text-sm">
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
            <LogOut className="mr-2 h-4 w-4" />
            Chiqish
          </Button>
        </div>
      </aside>

      {/* Main Content with Subtle Grid ("Kletka") Background */}
      <div className="relative flex-1 flex flex-col min-w-0 bg-minimal-grid">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,var(--background)_100%)]" />

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              {pathname.includes("/hackathons")
                ? "Hakatonlar boshqaruvi"
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
