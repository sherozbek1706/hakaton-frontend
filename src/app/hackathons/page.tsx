"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Search,
  Trophy,
  Users,
  Calendar,
  Clock,
  MapPin,
  ListChecks,
  CheckCircle2,
  Sun,
  Moon,
  LogOut,
  User,
  Sparkles,
  ArrowRight,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/use-app-store";
import { useUserAuthStore } from "@/store/use-user-auth-store";
import { translations } from "@/lib/i18n";
import {
  usePublicHackathonsQuery,
  useMyHackathonsQuery,
  useJoinHackathonMutation,
} from "@/hooks/use-public-overview";
import {
  StudentAuthFlow,
  type AuthStep,
} from "@/components/student-auth-flow";
import type { Hackathon } from "@/types/hackathon";

export default function PublicHackathonsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useAppStore();
  const { user, token, isAuthenticated, needsProfileCompletion, logoutUser } =
    useUserAuthStore();
  const t = translations[lang];
  const hp = t.hackathonsPage;
  const hs = t.hackathonsSection;

  const [tab, setTab] = React.useState<"all" | "my">("all");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const [authModalStep, setAuthModalStep] = React.useState<AuthStep | null>(
    null
  );
  const [joinTarget, setJoinTarget] = React.useState<Hackathon | null>(null);
  const [direction, setDirection] = React.useState("Frontend / Backend");
  const [teamName, setTeamName] = React.useState("");

  const hackathonsQuery = usePublicHackathonsQuery({
    search,
    status: statusFilter,
  });
  const myHackathonsQuery = useMyHackathonsQuery(
    isAuthenticated ? token : null
  );
  const joinMutation = useJoinHackathonMutation();

  const allHackathons = hackathonsQuery.data || [];
  const myHackathons = myHackathonsQuery.data || [];

  const registeredIds = React.useMemo(
    () => new Set(myHackathons.map((m) => m.id)),
    [myHackathons]
  );

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return hs.notSpecified;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return hs.notSpecified;
    return d.toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCountdownText = (
    startIso: string | null | undefined,
    endIso: string | null | undefined
  ) => {
    if (!startIso) return hs.notSpecified;
    const now = Date.now();
    const startMs = new Date(startIso).getTime();
    const endMs = endIso ? new Date(endIso).getTime() : null;

    if (Number.isNaN(startMs)) return hs.notSpecified;
    if (endMs && now > endMs) return hp.finishedAlready;
    if (now >= startMs) return hp.startedAlready;

    const diffMs = startMs - now;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (lang === "ru") {
      return `${hp.countdownPrefix} ${days} дн. ${hours} ч. ${mins} мин.`;
    }
    return `${hp.countdownPrefix} ${days} kun ${hours} soat ${mins} daqiqa`;
  };

  const handleClickJoin = (h: Hackathon) => {
    if (!isAuthenticated || !token) {
      setAuthModalStep("register");
      return;
    }
    if (needsProfileCompletion) {
      setAuthModalStep("complete-profile");
      return;
    }
    setJoinTarget(h);
  };

  const handleConfirmJoin = async () => {
    if (!joinTarget || !token) return;
    const joinedId = joinTarget.id;
    try {
      await joinMutation.mutateAsync({
        hackathonId: joinedId,
        token,
        direction,
        team_name: teamName || undefined,
      });
      toast.success(hp.joinSuccess);
      setJoinTarget(null);
      window.location.href = `/hackathons/${joinedId}`;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground bg-minimal-grid">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,transparent_35%,var(--background)_100%)]" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-sm font-bold">
                H
              </div>
              <span className="text-base font-semibold tracking-tight">
                Hakaton
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border-l pl-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {hp.backHome}
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
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

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-background"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden sm:flex items-center gap-2 rounded-lg border bg-secondary/60 px-3 py-1.5 text-sm">
                  <User className="h-4 w-4" />
                  <span className="font-medium max-w-36 truncate">
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
                  onClick={() => setAuthModalStep("login")}
                >
                  {t.nav.login}
                </Button>
                <Button
                  size="sm"
                  className="h-9 px-3.5 text-sm"
                  onClick={() => setAuthModalStep("register")}
                >
                  {t.nav.register}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 space-y-8">
        {/* Page Header Card */}
        <div className="rounded-2xl border bg-card/95 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-4">
          <div className="inline-flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 py-1 text-xs font-mono uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{hp.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            {hp.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            {hp.subtitle}
          </p>

          {/* Tabs: All Hackathons vs My Registered Hackathons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              type="button"
              variant={tab === "all" ? "default" : "outline"}
              className="h-10 px-4 text-sm"
              onClick={() => setTab("all")}
            >
              <Trophy className="mr-2 h-4 w-4" />
              {hp.tabAll} ({allHackathons.length})
            </Button>

            <Button
              type="button"
              variant={tab === "my" ? "default" : "outline"}
              className="h-10 px-4 text-sm"
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthModalStep("login");
                  return;
                }
                setTab("my");
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {hp.tabMy} ({myHackathons.length})
            </Button>
          </div>
        </div>

        {tab === "my" ? (
          /* TAB 2: MY REGISTERED HACKATHONS (With Start Time & Countdown) */
          <div className="space-y-4">
            {myHackathonsQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-60 w-full rounded-xl" />
                <Skeleton className="h-60 w-full rounded-xl" />
              </div>
            ) : myHackathons.length === 0 ? (
              <div className="rounded-2xl border bg-card/95 py-16 px-4 text-center space-y-3">
                <Trophy className="mx-auto h-9 w-9 text-muted-foreground" />
                <h3 className="text-base sm:text-lg font-semibold">
                  {hp.myEmptyTitle}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {hp.myEmptyDesc}
                </p>
                <Button
                  className="mt-2 h-10 px-5 text-sm"
                  onClick={() => setTab("all")}
                >
                  {hp.tabAll}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myHackathons.map((item) => (
                  <div
                    key={item.participant_id}
                    className="flex flex-col justify-between rounded-2xl border bg-card/95 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge variant="default" className="text-xs px-2.5 py-1">
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          {hp.myStatusApproved}
                        </Badge>
                        {item.prize_pool && (
                          <Badge
                            variant="outline"
                            className="text-xs font-mono px-2.5 py-0.5"
                          >
                            {item.prize_pool}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold tracking-tight">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Highlighted Start Date & Countdown Box */}
                      <div className="rounded-xl border-2 border-foreground/80 bg-secondary/40 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                          <Clock className="h-4 w-4 text-foreground" />
                          <span>{hs.whenStartsBoxTitle}</span>
                        </div>
                        <div className="text-lg font-bold">
                          {formatDate(item.start_at)}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                          ⏳ {getCountdownText(item.start_at, item.end_at)}
                        </div>
                        <div className="text-xs text-muted-foreground pt-1 border-t">
                          {hs.endLabel}:{" "}
                          <strong className="text-foreground">
                            {formatDate(item.end_at)}
                          </strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 rounded-xl border p-3.5 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            {hp.myDirectionLabel}
                          </span>
                          <p className="font-medium mt-0.5">
                            {item.direction || "Fullstack"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            {hp.myTeamLabel}
                          </span>
                          <p className="font-medium mt-0.5">
                            {item.team_name || "Yakka / Индивидуально"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {hs.participantsLabel}: {item.participants_count || 1}
                      </span>
                      <Link href={`/hackathons/${item.id}`}>
                        <Button size="sm" className="h-9 text-xs font-medium">
                          {lang === "ru"
                            ? "Открыть хакатон и задачи →"
                            : "Hakaton va vazifalarni ochish →"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TAB 1: ALL HACKATHONS */
          <div className="space-y-5">
            {/* Search & Status Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border bg-card/95 p-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={hp.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 text-sm bg-background"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
              >
                <option value="all">{hp.filterAll}</option>
                <option value="active">{hp.filterActive}</option>
                <option value="upcoming">{hp.filterUpcoming}</option>
                <option value="paused">{hp.filterPaused}</option>
                <option value="finished">{hp.filterFinished}</option>
              </select>
            </div>

            {hackathonsQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            ) : allHackathons.length === 0 ? (
              <div className="rounded-xl border bg-card/95 py-14 text-center">
                <p className="text-sm text-muted-foreground">{hs.empty}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {allHackathons.map((h) => {
                  const isJoined = registeredIds.has(h.id);
                  return (
                    <div
                      key={h.id}
                      className="flex flex-col justify-between rounded-2xl border bg-card/95 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-5"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
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
                              {hs.status[h.status] || h.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {h.is_registration_open
                                ? hs.regOpen
                                : hs.regClosed}
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
                          <h3 className="text-xl font-bold tracking-tight">
                            {h.title}
                          </h3>
                          {h.description && (
                            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                              {h.description}
                            </p>
                          )}
                        </div>

                        {/* Start & End Time Box */}
                        <div
                          className={`rounded-xl border p-4 space-y-2 ${
                            isJoined
                              ? "border-2 border-foreground bg-secondary/40"
                              : "bg-secondary/25"
                          }`}
                        >
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {hs.startLabel}
                              </span>
                              <p className="font-semibold">
                                {formatDate(h.start_at)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {hs.endLabel}
                              </span>
                              <p className="font-medium">
                                {formatDate(h.end_at)}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-foreground" />
                            <span>
                              {getCountdownText(h.start_at, h.end_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            {hs.participantsLabel}:{" "}
                            <strong className="text-foreground">
                              {h.participants_count || 0}
                              {h.max_participants
                                ? ` / ${h.max_participants}`
                                : ""}
                            </strong>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <ListChecks className="h-4 w-4" />
                            {hs.tasksLabel}:{" "}
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
                        {isJoined ? (
                          <Link href={`/hackathons/${h.id}`} className="block">
                            <Button
                              variant="default"
                              className="w-full h-10 text-sm font-medium"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {lang === "ru"
                                ? "Вы зарегистрированы • Открыть задачи и таймер →"
                                : "Ro'yxatdan o'tgansiz • Taymer va vazifalarni ochish →"}
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            className="w-full h-10 text-sm font-medium"
                            disabled={
                              !h.is_registration_open ||
                              h.status === "paused" ||
                              h.status === "finished"
                            }
                            onClick={() => handleClickJoin(h)}
                          >
                            {isAuthenticated
                              ? hs.joinNowBtn
                              : hs.participateBtn}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-background/85 backdrop-blur-xs">
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl px-4 sm:px-6 py-6 text-sm text-muted-foreground">
          <span>{t.footer.text}</span>
          <span>© 2026 Hakaton. {t.footer.rights}</span>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 1. JOIN HACKATHON CONFIRMATION DIALOG */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(joinTarget)}
        onOpenChange={(open) => !open && setJoinTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{hp.joinModalTitle}</DialogTitle>
            <DialogDescription className="text-sm">
              <strong>{joinTarget?.title}</strong> — {hp.joinModalDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {joinTarget && (
              <div className="rounded-xl border bg-secondary/30 p-3.5 text-sm space-y-1">
                <div className="text-xs text-muted-foreground">
                  {hs.startLabel}:
                </div>
                <div className="font-semibold">
                  {formatDate(joinTarget.start_at)}
                </div>
                <div className="text-xs text-muted-foreground">
                  ⏳ {getCountdownText(joinTarget.start_at, joinTarget.end_at)}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm">{hp.directionLabel}</Label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Fullstack Developer">Fullstack Developer</option>
                <option value="Mobile Developer">Mobile Developer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="CyberSecurity">CyberSecurity</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{hp.teamNameLabel}</Label>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={hp.teamNamePlaceholder}
                className="h-10 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setJoinTarget(null)}
            >
              {hp.cancelBtn}
            </Button>
            <Button
              type="button"
              disabled={joinMutation.isPending}
              onClick={handleConfirmJoin}
            >
              {joinMutation.isPending ? t.auth.submitting : hp.confirmJoinBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. AUTH MODAL IF NOT LOGGED IN */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(authModalStep)}
        onOpenChange={(open) => {
          if (!open) {
            if (isAuthenticated && needsProfileCompletion) return;
            setAuthModalStep(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {authModalStep === "login"
                ? t.auth.loginTitle
                : authModalStep === "complete-profile"
                ? t.auth.completeTitle
                : t.auth.registerTitle}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {authModalStep === "login"
                ? t.auth.loginDesc
                : authModalStep === "complete-profile"
                ? t.auth.completeDesc
                : t.auth.registerDesc}
            </DialogDescription>
          </DialogHeader>

          {authModalStep && (
            <StudentAuthFlow
              initialStep={authModalStep}
              onSuccess={() => setAuthModalStep(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
