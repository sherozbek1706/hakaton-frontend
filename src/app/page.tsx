"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users,
  Trophy,
  GraduationCap,
  UserCheck,
  Calendar,
  MapPin,
  ListChecks,
  ArrowRight,
  Sun,
  Moon,
  LogOut,
  CheckCircle2,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/use-app-store";
import { useUserAuthStore } from "@/store/use-user-auth-store";
import { translations } from "@/lib/i18n";
import {
  usePublicOverviewQuery,
  useUserLoginMutation,
  useUserRegisterMutation,
} from "@/hooks/use-public-overview";

const loginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(4),
});

const registerSchema = z.object({
  full_name: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6),
});

export default function PublicLandingPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useAppStore();
  const { user, isAuthenticated, setUserAuth, logoutUser } = useUserAuthStore();
  const t = translations[lang];

  const overviewQuery = usePublicOverviewQuery();
  const loginMutation = useUserLoginMutation();
  const registerMutation = useUserRegisterMutation();

  const [authModalMode, setAuthModalMode] = React.useState<
    "login" | "register" | null
  >(null);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", username: "", password: "" },
  });

  const handleLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const res = await loginMutation.mutateAsync(values);
      setUserAuth(res.user, res.token);
      toast.success(t.auth.loginSuccess);
      loginForm.reset();
      setAuthModalMode(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    }
  };

  const handleRegisterSubmit = async (
    values: z.infer<typeof registerSchema>
  ) => {
    try {
      const res = await registerMutation.mutateAsync(values);
      setUserAuth(res.user, res.token);
      toast.success(t.auth.registerSuccess);
      registerForm.reset();
      setAuthModalMode(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    }
  };

  const overview = overviewQuery.data;
  const hackathons = overview?.hackathons || [];

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return t.hackathonsSection.notSpecified;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return t.hackathonsSection.notSpecified;
    return d.toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground bg-minimal-grid">
      {/* Soft radial fade matching dashboard */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,transparent_35%,var(--background)_100%)]" />

      {/* Sticky Dashboard-style Minimal Header */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-sm font-bold">
                H
              </div>
              <span className="text-base font-semibold tracking-tight">
                Hakaton
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground border-l pl-3">
                {t.brandSub}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a
                href="#about"
                className="hover:text-foreground transition-colors"
              >
                {t.nav.about}
              </a>
              <a
                href="#hackathons"
                className="hover:text-foreground transition-colors"
              >
                {t.nav.hackathons}
              </a>
              <a
                href="#steps"
                className="hover:text-foreground transition-colors"
              >
                {t.nav.eligibility}
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live People Pill in Header */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
              <span>
                {t.stats.totalPeopleTitle}:{" "}
                <strong className="text-foreground font-semibold">
                  {overview?.totalPeople ?? 0}
                </strong>
              </span>
            </div>

            {/* Language Switcher: RU (default) / UZ */}
            <div className="flex items-center rounded-lg border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setLang("ru")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === "ru"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => setLang("uz")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === "uz"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                UZ
              </button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-background"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden sm:flex items-center gap-2 rounded-lg border bg-secondary/60 px-3 py-1.5 text-sm">
                  <User className="h-4 w-4" />
                  <span className="font-medium max-w-32 truncate">
                    {user.full_name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logoutUser}
                  className="h-9 px-3 text-sm bg-background"
                >
                  <LogOut className="mr-1.5 h-4 w-4" />
                  {t.nav.logout}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3.5 text-sm bg-background"
                  onClick={() => setAuthModalMode("login")}
                >
                  {t.nav.login}
                </Button>
                <Button
                  size="sm"
                  className="h-9 px-3.5 text-sm"
                  onClick={() => setAuthModalMode("register")}
                >
                  {t.nav.register}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container matching Dashboard layout */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-14">
        {/* 1. HERO PROMO CARD */}
        <section className="rounded-2xl border bg-card/95 p-7 sm:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 py-1.5 text-xs sm:text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
              {t.hero.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated && user ? (
                <div className="inline-flex items-center gap-2.5 rounded-xl border bg-secondary/60 px-4 py-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {t.hero.loggedWelcome}{" "}
                    <strong>{user.full_name}</strong> (@{user.username})
                  </span>
                </div>
              ) : (
                <>
                  <Button
                    className="h-10 px-5 text-sm font-medium"
                    onClick={() => setAuthModalMode("register")}
                  >
                    {t.hero.ctaRegister}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 px-5 text-sm font-medium bg-background"
                    onClick={() => setAuthModalMode("login")}
                  >
                    {t.hero.ctaLogin}
                  </Button>
                </>
              )}
              <a
                href="#hackathons"
                className="inline-flex items-center h-10 px-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.hero.ctaExplore} →
              </a>
            </div>
          </div>
        </section>

        {/* 2. LIVE KPI STATS CARDS (Exact Dashboard Style) */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card/95 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {t.stats.totalPeopleTitle}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                {t.stats.liveLabel}
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">
              {overviewQuery.isLoading ? "—" : overview?.totalPeople ?? 0}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              {t.stats.totalPeopleDesc}
            </p>
          </div>

          <div className="rounded-xl border bg-card/95 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {t.stats.participantsTitle}
              </p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">
              {overviewQuery.isLoading ? "—" : overview?.participantsCount ?? 0}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              {t.stats.participantsDesc}
            </p>
          </div>

          <div className="rounded-xl border bg-card/95 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {t.stats.hackathonsTitle}
              </p>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">
              {overviewQuery.isLoading
                ? "—"
                : overview?.totalHackathonsCount ?? 0}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              {t.stats.hackathonsDesc}
            </p>
          </div>

          <div className="rounded-xl border bg-card/95 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {t.stats.audienceTitle}
              </p>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-lg sm:text-xl font-bold tracking-tight">
              {t.stats.audienceValue}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              {t.stats.audienceDesc}
            </p>
          </div>
        </section>

        {/* 3. ABOUT THE HACKATHON (1 Founder + All Students/Pupils) */}
        <section id="about" className="space-y-5">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {t.aboutSection.tag}
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
              {t.aboutSection.title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {t.aboutSection.subtitle}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {t.aboutSection.cards.map((card, idx) => (
              <div
                key={idx}
                className="rounded-xl border bg-card/95 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">
                    0{idx + 1}
                  </span>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. ACTIVE & UPCOMING HACKATHONS */}
        <section id="hackathons" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t.hackathonsSection.tag}
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
                {t.hackathonsSection.title}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {t.hackathonsSection.subtitle}
              </p>
            </div>
          </div>

          {overviewQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </div>
          ) : hackathons.length === 0 ? (
            <div className="rounded-xl border bg-card/95 py-14 text-center">
              <p className="text-sm text-muted-foreground">
                {t.hackathonsSection.empty}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hackathons.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-col justify-between rounded-xl border bg-card/95 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-5"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Badge
                          variant={
                            h.status === "active"
                              ? "default"
                              : h.status === "paused"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs font-normal px-2.5 py-0.5"
                        >
                          {t.hackathonsSection.status[h.status] || h.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {h.is_registration_open
                            ? t.hackathonsSection.regOpen
                            : t.hackathonsSection.regClosed}
                        </span>
                      </div>
                      {h.prize_pool && (
                        <Badge
                          variant="outline"
                          className="text-xs font-mono px-2.5 py-0.5"
                        >
                          {h.prize_pool}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
                        {h.title}
                      </h3>
                      {h.description && (
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                          {h.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg border bg-secondary/30 p-3.5 text-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {t.hackathonsSection.startLabel}
                        </span>
                        <p className="font-medium">{formatDate(h.start_at)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {t.hackathonsSection.endLabel}
                        </span>
                        <p className="font-medium">{formatDate(h.end_at)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {t.hackathonsSection.participantsLabel}:{" "}
                        <strong className="text-foreground">
                          {h.participants_count || 0}
                          {h.max_participants ? ` / ${h.max_participants}` : ""}
                        </strong>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <ListChecks className="h-4 w-4" />
                        {t.hackathonsSection.tasksLabel}:{" "}
                        <strong className="text-foreground">
                          {h.tasks_count || 0}
                        </strong>
                      </span>

                      {h.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {h.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full h-10 text-sm"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t.hackathonsSection.readyToJoinBtn}
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-10 text-sm"
                        onClick={() => setAuthModalMode("register")}
                      >
                        {t.hackathonsSection.participateBtn}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. HOW TO PARTICIPATE STEPS */}
        <section id="steps" className="space-y-5">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {t.stepsSection.tag}
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
              {t.stepsSection.title}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {t.stepsSection.steps.map((step) => (
              <div
                key={step.num}
                className="rounded-xl border bg-card/95 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-2.5"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border font-mono text-xs font-semibold">
                  {step.num}
                </span>
                <h3 className="text-base sm:text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-background/85 backdrop-blur-xs">
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl px-4 sm:px-6 py-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background text-xs font-bold">
              H
            </span>
            <span>{t.footer.text}</span>
          </div>
          <span>© 2026 Hakaton. {t.footer.rights}</span>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* STUDENT LOGIN / REGISTER MODAL */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(authModalMode)}
        onOpenChange={(open) => !open && setAuthModalMode(null)}
      >
        <DialogContent className="sm:max-w-md">
          {authModalMode === "login" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {t.auth.loginTitle}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {t.auth.loginDesc}
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                className="space-y-4 py-2"
              >
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.auth.usernameLabel}</Label>
                  <Input
                    placeholder={t.auth.usernamePlaceholder}
                    className="h-10 text-sm"
                    {...loginForm.register("username")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">{t.auth.passwordLabel}</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-10 text-sm"
                    {...loginForm.register("password")}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-sm"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending
                    ? t.auth.submitting
                    : t.auth.loginBtn}
                </Button>

                <div className="text-center text-sm text-muted-foreground pt-3 border-t">
                  {t.auth.noAccount}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthModalMode("register")}
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    {t.auth.switchToRegister}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {t.auth.registerTitle}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {t.auth.registerDesc}
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                className="space-y-4 py-2"
              >
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.auth.fullNameLabel}</Label>
                  <Input
                    placeholder={t.auth.fullNamePlaceholder}
                    className="h-10 text-sm"
                    {...registerForm.register("full_name")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">{t.auth.usernameLabel}</Label>
                  <Input
                    placeholder={t.auth.usernamePlaceholder}
                    className="h-10 text-sm"
                    {...registerForm.register("username")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">{t.auth.passwordLabel}</Label>
                  <Input
                    type="password"
                    placeholder={t.auth.passwordPlaceholder}
                    className="h-10 text-sm"
                    {...registerForm.register("password")}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-sm"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending
                    ? t.auth.submitting
                    : t.auth.registerBtn}
                </Button>

                <div className="text-center text-sm text-muted-foreground pt-3 border-t">
                  {t.auth.hasAccount}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthModalMode("login")}
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    {t.auth.switchToLogin}
                  </button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
