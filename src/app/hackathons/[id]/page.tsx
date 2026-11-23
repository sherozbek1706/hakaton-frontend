"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Upload,
  FileArchive,
  Image as ImageIcon,
  ExternalLink,
  Pencil,
  Lock,
  Trophy,
  ListChecks,
  Sun,
  Moon,
  User,
  LogOut,
  AlertCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { SOCKET_URL } from "@/lib/constants";
import {
  useHackathonWorkspaceQuery,
  useJoinHackathonMutation,
  useSubmitTaskMutation,
  useEditTaskSubmissionMutation,
  type HackathonSubmission,
} from "@/hooks/use-public-overview";
import {
  StudentAuthFlow,
  type AuthStep,
} from "@/components/student-auth-flow";
import type { HackathonTask } from "@/types/hackathon";
import { getHackathonRegistrationState } from "@/lib/hackathon-registration";

const TEN_HOURS_MS = 10 * 60 * 60 * 1000;

const workspaceTexts = {
  ru: {
    backToHackathons: "Ко всем хакатонам",
    timerFinishTitle: "ДО ОКОНЧАНИЯ ХАКАТОНА ОСТАЛОСЬ",
    timerStartTitle: "ДО СТАРТА ХАКАТОНА ОСТАЛОСЬ",
    timerEnded: "ХАКАТОН ЗАВЕРШЕН",
    days: "дней",
    hours: "часов",
    minutes: "минут",
    seconds: "секунд",
    tenHourWarning:
      "До окончания осталось 10 часов или меньше — редактирование отправленных задач закрыто!",
    editRuleHint:
      "Правило: каждую отправленную задачу можно отредактировать только 1 раз (и не позднее чем за 10 часов до окончания хакатона).",
    notRegisteredTitle: "Вы еще не зарегистрированы в этом хакатоне",
    notRegisteredDesc:
      "Нажмите кнопку ниже, чтобы зарегистрироваться и получить доступ к отправке задач.",
    joinBtn: "Зарегистрироваться в хакатоне",
    loginRequiredTitle: "Войдите в аккаунт, чтобы открыть страницу хакатона",
    loginBtn: "Войти / Зарегистрироваться",
    tasksHeading: "Задачи хакатона",
    tasksEmpty: "Задачи для этого хакатона скоро появятся.",
    maxScore: "баллов",
    deadlineLabel: "Дедлайн задачи:",
    submittedBadge: "Задача отправлена",
    notSubmittedBadge: "Ожидает выполнения",
    submitBtn: "Отправить решение задачи",
    editBtn: "Редактировать решение (доступно 1 раз)",
    editUsedBadge: "Редактирование использовано (1/1)",
    editLocked10hBadge: "Редактирование закрыто (< 10 часов до финиша)",
    projectNameLabel: "Название проекта (необязательно)",
    projectNamePlaceholder: "Например: AI Assistant Platform",
    projectLinkLabel: "Ссылка на проект — GitHub / Demo / Figma (необязательно)",
    projectLinkPlaceholder: "https://github.com/username/project",
    projectDescLabel: "Описание проекта (необязательно)",
    projectDescPlaceholder:
      "Опишите что было сделано, какие технологии использованы...",
    projectImageLabel: "Скриншот / Изображение проекта (необязательно)",
    projectZipLabel: "ZIP-архив проекта (необязательно)",
    allOptionalHint:
      "Все поля необязательны — заполните или прикрепите только то, что нужно для данной задачи.",
    saveSubmitBtn: "Отправить задачу",
    saveEditBtn: "Сохранить изменения (1/1)",
    cancelBtn: "Отмена",
    viewImage: "Открыть изображение",
    downloadZip: "Скачать ZIP файл",
    openLink: "Открыть ссылку проекта",
  },
  uz: {
    backToHackathons: "Barcha hakatonlarga qaytish",
    timerFinishTitle: "HAKATON TUGASHIGA QOLGAN VAQT",
    timerStartTitle: "HAKATON BOSHLANISHIGA QOLGAN VAQT",
    timerEnded: "HAKATON VAQTI TUGAGAN",
    days: "kun",
    hours: "soat",
    minutes: "daqiqa",
    seconds: "soniya",
    tenHourWarning:
      "Hakaton tugashiga 10 soat yoki undan kam vaqt qoldi — topshirilgan vazifalarni tahrirlash yopilgan!",
    editRuleHint:
      "Qoida: har bir topshirilgan vazifani faqat 1 marta tahrirlash mumkin (hakaton tugashiga 10 soat qolganda tahrirlash yopiladi).",
    notRegisteredTitle: "Siz hali ushbu hakatondan ro'yxatdan o'tmagansiz",
    notRegisteredDesc:
      "Vazifalarni bajarish va topshirish uchun quyidagi tugma orqali hakatondan ro'yxatdan o'ting.",
    joinBtn: "Hakatondan ro'yxatdan o'tish",
    loginRequiredTitle: "Hakaton sahifasini ko'rish uchun tizimga kiring",
    loginBtn: "Kirish / Ro'yxatdan o'tish",
    tasksHeading: "Hakaton vazifalari (Zadachalar)",
    tasksEmpty: "Ushbu hakaton uchun vazifalar tez orada qo'shiladi.",
    maxScore: "ball",
    deadlineLabel: "Topshirish muddati:",
    submittedBadge: "Topshirilgan",
    notSubmittedBadge: "Bajarilmagan",
    submitBtn: "Vazifani topshirish",
    editBtn: "Topshiriqni tahrirlash (1 marta imkoniyat bor)",
    editUsedBadge: "Tahrirlash ishlatilgan (1/1)",
    editLocked10hBadge: "Tahrirlash yopilgan (tugashiga < 10 soat qoldi)",
    projectNameLabel: "Loyiha nomi (ixtiyoriy)",
    projectNamePlaceholder: "Masalan: Pitsa Yetkazib Berish Platformasi",
    projectLinkLabel: "Loyiha linki — GitHub / Demo / Figma (ixtiyoriy)",
    projectLinkPlaceholder: "https://github.com/username/project",
    projectDescLabel: "Loyiha tavsifi (ixtiyoriy)",
    projectDescPlaceholder:
      "Loyiha haqida qisqacha ma'lumot, ishlatilgan texnologiyalar...",
    projectImageLabel: "Loyiha surati / rasm (ixtiyoriy)",
    projectZipLabel: "Loyiha ZIP fayli (ixtiyoriy)",
    allOptionalHint:
      "Hech bir maydon majburiy emas — ushbu vazifa uchun kerakli fayl, rasm, link yoki tavsifni yuborishingiz mumkin.",
    saveSubmitBtn: "Vazifani yuborish",
    saveEditBtn: "O'zgarishni saqlash (1/1)",
    cancelBtn: "Bekor qilish",
    viewImage: "Loyiha suratini ko'rish",
    downloadZip: "ZIP faylni yuklab olish",
    openLink: "Loyiha linkini ochish",
  },
} as const;

export default function HackathonArenaPage() {
  const params = useParams<{ id: string }>();
  const hackathonId = Number(params?.id);

  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useAppStore();
  const { user, token, isAuthenticated, logoutUser } = useUserAuthStore();
  const wt = workspaceTexts[lang];

  const [authModalStep, setAuthModalStep] = React.useState<AuthStep | null>(
    null
  );

  const workspaceQuery = useHackathonWorkspaceQuery(
    hackathonId || null,
    isAuthenticated ? token : null
  );
  const joinMutation = useJoinHackathonMutation();
  const submitMutation = useSubmitTaskMutation();
  const editMutation = useEditTaskSubmissionMutation();

  // Live 1-second ticking clock state
  const [nowMs, setNowMs] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Submission / Edit Modal State
  const [activeTask, setActiveTask] = React.useState<HackathonTask | null>(
    null
  );
  const [editingSubmission, setEditingSubmission] =
    React.useState<HackathonSubmission | null>(null);
  const [projectName, setProjectName] = React.useState("");
  const [projectLink, setProjectLink] = React.useState("");
  const [projectDesc, setProjectDesc] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [zipFile, setZipFile] = React.useState<File | null>(null);

  const openSubmitModal = (
    task: HackathonTask,
    existing?: HackathonSubmission
  ) => {
    setActiveTask(task);
    setEditingSubmission(existing || null);
    setProjectName(existing?.project_name || "");
    setProjectLink(existing?.project_link || "");
    setProjectDesc(existing?.project_description || "");
    setImageFile(null);
    setZipFile(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !token) return;

    const formData = new FormData();
    formData.append("project_name", projectName);
    formData.append("project_link", projectLink);
    formData.append("project_description", projectDesc);
    if (imageFile) {
      formData.append("project_image", imageFile);
    }
    if (zipFile) {
      formData.append("project_zip", zipFile);
    }

    try {
      if (editingSubmission) {
        const res = await editMutation.mutateAsync({
          hackathonId,
          taskId: activeTask.id,
          token,
          formData,
        });
        toast.success(res?.message || "Yangilandi!");
      } else {
        const res = await submitMutation.mutateAsync({
          hackathonId,
          taskId: activeTask.id,
          token,
          formData,
        });
        toast.success(res?.message || "Topshirildi!");
      }
      setActiveTask(null);
      setEditingSubmission(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const ws = workspaceQuery.data;
  const hackathon = ws?.hackathon;
  const tasks = ws?.tasks || [];
  const submissionsMap = React.useMemo(() => {
    const map = new Map<number, HackathonSubmission>();
    for (const sub of ws?.submissions || []) {
      map.set(sub.task_id, sub);
    }
    return map;
  }, [ws?.submissions]);

  // Compute live countdown (Days, Hours, Minutes, Seconds)
  const countdown = React.useMemo(() => {
    if (!hackathon) {
      return {
        mode: "ended" as const,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        within10Hours: false,
      };
    }

    const startMs = hackathon.start_at
      ? new Date(hackathon.start_at).getTime()
      : null;
    const endMs = hackathon.end_at
      ? new Date(hackathon.end_at).getTime()
      : null;

    let targetMs = endMs;
    let mode: "before_start" | "running" | "ended" = "running";

    if (startMs && nowMs < startMs) {
      targetMs = startMs;
      mode = "before_start";
    } else if (endMs && nowMs >= endMs) {
      mode = "ended";
    }

    const diff = targetMs ? Math.max(0, targetMs - nowMs) : 0;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const within10Hours = endMs ? endMs - nowMs <= TEN_HOURS_MS : false;

    return {
      mode,
      days,
      hours,
      minutes,
      seconds,
      within10Hours,
    };
  }, [hackathon, nowMs]);

  const pad = (n: number) => String(n).padStart(2, "0");

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
              href="/hackathons"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border-l pl-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {wt.backToHackathons}
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center rounded-lg border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setLang("ru")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  lang === "ru"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground"
                }`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => setLang("uz")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  lang === "uz"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground"
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

            {isAuthenticated && user && (
              <div className="flex items-center gap-2">
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
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 space-y-10">
        {!isAuthenticated ? (
          <div className="rounded-2xl border bg-card/95 p-12 text-center space-y-4">
            <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-bold">{wt.loginRequiredTitle}</h2>
            <Button
              className="h-10 px-6 text-sm"
              onClick={() => setAuthModalStep("login")}
            >
              {wt.loginBtn}
            </Button>
          </div>
        ) : workspaceQuery.isLoading || !hackathon ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* 1. BIG SCREEN COUNTDOWN TIMER (3 kun 5 soat 7 daqiqa 15 soniya) */}
            {/* ========================================================= */}
            <section className="rounded-2xl border-2 border-foreground bg-card/95 p-7 sm:p-10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-5">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Badge variant="default" className="text-xs px-2.5 py-0.5">
                      <Trophy className="mr-1.5 h-3.5 w-3.5" />
                      {hackathon.status.toUpperCase()}
                    </Badge>
                    {hackathon.prize_pool && (
                      <Badge
                        variant="outline"
                        className="text-xs font-mono px-2.5 py-0.5"
                      >
                        {hackathon.prize_pool}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mt-2">
                    {hackathon.title}
                  </h1>
                  {hackathon.description && (
                    <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
                      {hackathon.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Large Digital Clock Display */}
              <div className="text-center space-y-4 py-2">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-widest text-muted-foreground">
                  <Clock className="h-4 w-4 text-foreground animate-pulse" />
                  <span>
                    {countdown.mode === "before_start"
                      ? wt.timerStartTitle
                      : countdown.mode === "ended"
                      ? wt.timerEnded
                      : wt.timerFinishTitle}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 max-w-3xl mx-auto">
                  <div className="rounded-2xl border bg-secondary/40 p-5 sm:p-6 flex flex-col items-center justify-center">
                    <span className="font-mono text-4xl sm:text-6xl font-extrabold tracking-tight">
                      {pad(countdown.days)}
                    </span>
                    <span className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {wt.days}
                    </span>
                  </div>

                  <div className="rounded-2xl border bg-secondary/40 p-5 sm:p-6 flex flex-col items-center justify-center">
                    <span className="font-mono text-4xl sm:text-6xl font-extrabold tracking-tight">
                      {pad(countdown.hours)}
                    </span>
                    <span className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {wt.hours}
                    </span>
                  </div>

                  <div className="rounded-2xl border bg-secondary/40 p-5 sm:p-6 flex flex-col items-center justify-center">
                    <span className="font-mono text-4xl sm:text-6xl font-extrabold tracking-tight">
                      {pad(countdown.minutes)}
                    </span>
                    <span className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {wt.minutes}
                    </span>
                  </div>

                  <div className="rounded-2xl border-2 border-foreground bg-foreground text-background p-5 sm:p-6 flex flex-col items-center justify-center">
                    <span className="font-mono text-4xl sm:text-6xl font-extrabold tracking-tight">
                      {pad(countdown.seconds)}
                    </span>
                    <span className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider opacity-80">
                      {wt.seconds}
                    </span>
                  </div>
                </div>

                {/* Human-readable full line: e.g. "3 kun 5 soat 7 daqiqa 15 soniya" */}
                <p className="text-base sm:text-lg font-semibold pt-1">
                  {countdown.days} {wt.days} {countdown.hours} {wt.hours}{" "}
                  {countdown.minutes} {wt.minutes} {countdown.seconds}{" "}
                  {wt.seconds}
                </p>
              </div>

              {/* Rules / 10-hour lock notice */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border bg-secondary/25 p-3.5 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-foreground" />
                  <span>{wt.editRuleHint}</span>
                </div>
                {countdown.within10Hours && (
                  <Badge variant="destructive" className="text-xs shrink-0">
                    {wt.tenHourWarning}
                  </Badge>
                )}
              </div>
            </section>

            {/* If user is not registered yet, prompt them to join or show closed status */}
            {!ws?.isRegistered ? (
              (() => {
                const regState = getHackathonRegistrationState(hackathon, lang);
                if (!regState.canRegister) {
                  return (
                    <section className="rounded-2xl border border-dashed bg-card/95 p-8 text-center space-y-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary/80">
                        {regState.statusKey === "not_started" ? (
                          <Clock className="h-6 w-6 text-foreground" />
                        ) : (
                          <Lock className="h-6 w-6 text-foreground" />
                        )}
                      </div>
                      <div className="space-y-1.5 max-w-lg mx-auto">
                        <h3 className="text-xl font-bold tracking-tight">
                          {regState.statusKey === "not_started"
                            ? lang === "ru"
                              ? "Регистрация еще не открыта"
                              : "Ro'yxatdan o'tish hali ochilmagan"
                            : regState.statusKey === "closed"
                            ? lang === "ru"
                              ? "Регистрация в данный момент закрыта"
                              : "Hozircha ro'yxatdan o'tish yopiq"
                            : regState.statusKey === "paused"
                            ? lang === "ru"
                              ? "Хакатон временно приостановлен"
                              : "Hakaton vaqtincha to'xtatilgan"
                            : lang === "ru"
                            ? "Прием заявок завершен"
                            : "Qabul muddati yakunlangan"}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {regState.detailMessage}
                        </p>
                      </div>
                      <div>
                        <Button
                          disabled
                          variant="outline"
                          className="h-10 px-6 text-sm opacity-75 cursor-not-allowed"
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          {regState.buttonText}
                        </Button>
                      </div>
                    </section>
                  );
                }

                return (
                  <section className="rounded-2xl border bg-card/95 p-8 text-center space-y-3">
                    <h3 className="text-lg font-bold">{wt.notRegisteredTitle}</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {wt.notRegisteredDesc}
                    </p>
                    <Button
                      className="h-10 px-6 text-sm"
                      disabled={joinMutation.isPending}
                      onClick={async () => {
                        if (!token) return;
                        try {
                          await joinMutation.mutateAsync({
                            hackathonId,
                            token,
                          });
                          toast.success(
                            lang === "ru"
                              ? "Вы успешно зарегистрировались!"
                              : "Ro'yxatdan o'tdingiz!"
                          );
                        } catch (err: any) {
                          toast.error(err?.response?.data?.message || "Error");
                        }
                      }}
                    >
                      {wt.joinBtn}
                    </Button>
                  </section>
                );
              })()
            ) : (
              /* ========================================================= */
              /* 2. TASKS & SUBMISSIONS SECTION */
              /* ========================================================= */
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ListChecks className="h-5 w-5" />
                    <h2 className="text-2xl font-bold tracking-tight">
                      {wt.tasksHeading} ({tasks.length})
                    </h2>
                  </div>
                </div>

                {tasks.length === 0 ? (
                  <div className="rounded-2xl border bg-card/95 py-14 text-center">
                    <p className="text-sm text-muted-foreground">
                      {wt.tasksEmpty}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task, idx) => {
                      const sub = submissionsMap.get(task.id);
                      const canEdit =
                        sub && sub.edit_count < 1 && !countdown.within10Hours;

                      return (
                        <div
                          key={task.id}
                          className="rounded-2xl border bg-card/95 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border font-mono text-xs font-bold">
                                  #{idx + 1}
                                </span>
                                <h3 className="text-lg sm:text-xl font-bold">
                                  {task.title}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  {task.max_score} {wt.maxScore}
                                </Badge>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed pl-9">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            <div>
                              {sub ? (
                                <Badge
                                  variant="default"
                                  className="text-xs px-3 py-1"
                                >
                                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                  {wt.submittedBadge}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-3 py-1"
                                >
                                  {wt.notSubmittedBadge}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* If Submitted: Show Submitted Details & 1-time Edit Button */}
                          {sub ? (
                            <div className="rounded-xl border bg-secondary/30 p-4 space-y-3">
                              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                {sub.project_name && (
                                  <div>
                                    <span className="text-xs text-muted-foreground">
                                      Loyiha nomi:
                                    </span>
                                    <p className="font-semibold">
                                      {sub.project_name}
                                    </p>
                                  </div>
                                )}

                                {sub.project_link && (
                                  <div>
                                    <span className="text-xs text-muted-foreground">
                                      Loyiha linki:
                                    </span>
                                    <div>
                                      <a
                                        href={sub.project_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 font-medium underline underline-offset-4"
                                      >
                                        {sub.project_link}
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {sub.project_description && (
                                <div className="text-sm">
                                  <span className="text-xs text-muted-foreground">
                                    Tavsif:
                                  </span>
                                  <p className="mt-0.5 text-muted-foreground">
                                    {sub.project_description}
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-3 pt-1">
                                {sub.project_image && (
                                  <a
                                    href={`${SOCKET_URL}${sub.project_image}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    {wt.viewImage}
                                  </a>
                                )}

                                {sub.project_zip && (
                                  <a
                                    href={`${SOCKET_URL}${sub.project_zip}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                                  >
                                    <FileArchive className="h-3.5 w-3.5" />
                                    {wt.downloadZip}
                                  </a>
                                )}
                              </div>

                              {/* Edit Button or Locked Message */}
                              <div className="flex items-center justify-between border-t pt-3">
                                <span className="text-xs text-muted-foreground">
                                  Topshirilgan:{" "}
                                  {new Date(sub.submitted_at).toLocaleString(
                                    lang === "ru" ? "ru-RU" : "uz-UZ"
                                  )}
                                </span>

                                {canEdit ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 text-xs bg-background"
                                    onClick={() => openSubmitModal(task, sub)}
                                  >
                                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                    {wt.editBtn}
                                  </Button>
                                ) : sub.edit_count >= 1 ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Lock className="mr-1.5 h-3 w-3" />
                                    {wt.editUsedBadge}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    <Lock className="mr-1.5 h-3 w-3" />
                                    {wt.editLocked10hBadge}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 pl-9">
                              <Button
                                className="h-10 px-5 text-sm"
                                disabled={countdown.mode === "ended"}
                                onClick={() => openSubmitModal(task)}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                {wt.submitBtn}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {/* ========================================================= */}
      {/* SUBMIT / EDIT TASK SOLUTION DIALOG */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(activeTask)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveTask(null);
            setEditingSubmission(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingSubmission ? wt.editBtn : wt.submitBtn}
            </DialogTitle>
            <DialogDescription className="text-sm">
              <strong>{activeTask?.title}</strong> — {wt.allOptionalHint}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">{wt.projectNameLabel}</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={wt.projectNamePlaceholder}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{wt.projectLinkLabel}</Label>
              <Input
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                placeholder={wt.projectLinkPlaceholder}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{wt.projectDescLabel}</Label>
              <Textarea
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder={wt.projectDescPlaceholder}
                className="min-h-24 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4" />
                  {wt.projectImageLabel}
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="h-10 text-xs pt-2"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5">
                  <FileArchive className="h-4 w-4" />
                  {wt.projectZipLabel}
                </Label>
                <Input
                  type="file"
                  accept=".zip,.rar,.7z,.tar,.gz"
                  onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                  className="h-10 text-xs pt-2"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActiveTask(null);
                  setEditingSubmission(null);
                }}
              >
                {wt.cancelBtn}
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending || editMutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {editingSubmission ? wt.saveEditBtn : wt.saveSubmitBtn}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AUTH DIALOG */}
      <Dialog
        open={Boolean(authModalStep)}
        onOpenChange={(open) => !open && setAuthModalStep(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{wt.loginBtn}</DialogTitle>
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
