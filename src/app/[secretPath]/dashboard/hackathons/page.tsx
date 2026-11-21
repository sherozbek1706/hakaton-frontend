"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Trophy,
  Users,
  ListChecks,
  PauseCircle,
  PlayCircle,
  Pencil,
  Trash2,
  RefreshCw,
  Calendar,
  MapPin,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHackathonsQuery,
  useHackathonDetailQuery,
  useCreateHackathonMutation,
  useUpdateHackathonMutation,
  useUpdateHackathonStatusMutation,
  useDeleteHackathonMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useClearAllTasksMutation,
  useUpdateParticipantStatusMutation,
  useRemoveParticipantMutation,
} from "@/hooks/use-hackathons";
import type {
  Hackathon,
  HackathonStatus,
  ParticipantStatus,
} from "@/types/hackathon";

const STATUS_LABELS: Record<HackathonStatus, string> = {
  draft: "Qoralama",
  upcoming: "Kutilmoqda",
  active: "Faol",
  paused: "Vaqtincha to'xtatilgan",
  finished: "Yakunlangan",
  cancelled: "Bekor qilingan",
};

const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
  approved: "Tasdiqlangan",
  pending: "Kutilmoqda",
  disqualified: "Chetlatilgan",
  rejected: "Rad etilgan",
};

function toDateTimeLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "Belgilanmagan";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Belgilanmagan";
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const hackathonFormSchema = z.object({
  title: z.string().min(3, "Hakaton nomi kamida 3 ta belgidan iborat bo'lsin"),
  description: z.string().optional(),
  status: z.enum([
    "draft",
    "upcoming",
    "active",
    "paused",
    "finished",
    "cancelled",
  ]),
  registration_start_at: z.string().optional(),
  registration_end_at: z.string().optional(),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  max_participants: z.string().optional(),
  team_size_min: z.string().optional(),
  team_size_max: z.string().optional(),
  prize_pool: z.string().optional(),
  location: z.string().optional(),
  rules: z.string().optional(),
  is_registration_open: z.boolean(),
});

type HackathonFormValues = z.infer<typeof hackathonFormSchema>;

const taskFormSchema = z.object({
  title: z.string().min(2, "Vazifa nomini kiriting"),
  description: z.string().optional(),
  max_score: z.string().optional(),
  deadline_at: z.string().optional(),
  order_index: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function HackathonsManagementPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Modals state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editHackathon, setEditHackathon] = React.useState<Hackathon | null>(
    null
  );
  const [manageHackathonId, setManageHackathonId] = React.useState<
    number | null
  >(null);
  const [activeTab, setActiveTab] = React.useState<
    "participants" | "tasks" | "settings"
  >("participants");
  const [participantSearch, setParticipantSearch] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<Hackathon | null>(
    null
  );
  const [confirmClearTasksOpen, setConfirmClearTasksOpen] =
    React.useState(false);

  // Queries & Mutations
  const hackathonsQuery = useHackathonsQuery({
    search,
    status: statusFilter,
  });
  const detailQuery = useHackathonDetailQuery(manageHackathonId);

  const createMutation = useCreateHackathonMutation();
  const updateMutation = useUpdateHackathonMutation();
  const statusMutation = useUpdateHackathonStatusMutation();
  const deleteMutation = useDeleteHackathonMutation();

  const createTaskMutation = useCreateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const clearAllTasksMutation = useClearAllTasksMutation();

  const updateParticipantStatusMutation = useUpdateParticipantStatusMutation();
  const removeParticipantMutation = useRemoveParticipantMutation();

  const hackathons = hackathonsQuery.data?.data || [];

  // KPI stats
  const totalHackathons = hackathons.length;
  const activeCount = hackathons.filter((h) => h.status === "active").length;
  const pausedCount = hackathons.filter((h) => h.status === "paused").length;
  const totalParticipants = hackathons.reduce(
    (sum, h) => sum + Number(h.participants_count || 0),
    0
  );

  // Create Form
  const createForm = useForm<HackathonFormValues>({
    resolver: zodResolver(hackathonFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "upcoming",
      registration_start_at: "",
      registration_end_at: "",
      start_at: "",
      end_at: "",
      max_participants: "100",
      team_size_min: "1",
      team_size_max: "4",
      prize_pool: "",
      location: "",
      rules: "",
      is_registration_open: true,
    },
  });

  // Edit Form
  const editForm = useForm<HackathonFormValues>({
    resolver: zodResolver(hackathonFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "upcoming",
      registration_start_at: "",
      registration_end_at: "",
      start_at: "",
      end_at: "",
      max_participants: "",
      team_size_min: "1",
      team_size_max: "4",
      prize_pool: "",
      location: "",
      rules: "",
      is_registration_open: true,
    },
  });

  // Task Form
  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      max_score: "100",
      deadline_at: "",
      order_index: "1",
    },
  });

  React.useEffect(() => {
    if (editHackathon) {
      editForm.reset({
        title: editHackathon.title,
        description: editHackathon.description || "",
        status: editHackathon.status,
        registration_start_at: toDateTimeLocal(
          editHackathon.registration_start_at
        ),
        registration_end_at: toDateTimeLocal(editHackathon.registration_end_at),
        start_at: toDateTimeLocal(editHackathon.start_at),
        end_at: toDateTimeLocal(editHackathon.end_at),
        max_participants: editHackathon.max_participants
          ? String(editHackathon.max_participants)
          : "",
        team_size_min: String(editHackathon.team_size_min || 1),
        team_size_max: String(editHackathon.team_size_max || 5),
        prize_pool: editHackathon.prize_pool || "",
        location: editHackathon.location || "",
        rules: editHackathon.rules || "",
        is_registration_open: editHackathon.is_registration_open,
      });
    }
  }, [editHackathon, editForm]);

  const normalizePayload = (values: HackathonFormValues) => ({
    title: values.title,
    description: values.description || undefined,
    status: values.status,
    registration_start_at: values.registration_start_at
      ? new Date(values.registration_start_at).toISOString()
      : null,
    registration_end_at: values.registration_end_at
      ? new Date(values.registration_end_at).toISOString()
      : null,
    start_at: values.start_at ? new Date(values.start_at).toISOString() : null,
    end_at: values.end_at ? new Date(values.end_at).toISOString() : null,
    max_participants: values.max_participants
      ? Number(values.max_participants)
      : null,
    team_size_min: values.team_size_min ? Number(values.team_size_min) : 1,
    team_size_max: values.team_size_max ? Number(values.team_size_max) : 5,
    prize_pool: values.prize_pool || undefined,
    location: values.location || undefined,
    rules: values.rules || undefined,
    is_registration_open: values.is_registration_open,
  });

  const handleCreateSubmit = async (values: HackathonFormValues) => {
    await createMutation.mutateAsync(normalizePayload(values));
    createForm.reset();
    setCreateOpen(false);
  };

  const handleEditSubmit = async (values: HackathonFormValues) => {
    if (!editHackathon) return;
    await updateMutation.mutateAsync({
      id: editHackathon.id,
      payload: normalizePayload(values),
    });
    setEditHackathon(null);
  };

  const handleTogglePause = (h: Hackathon) => {
    const nextStatus: HackathonStatus =
      h.status === "paused" ? "active" : "paused";
    statusMutation.mutate({
      id: h.id,
      status: nextStatus,
    });
  };

  const handleAddTask = async (values: TaskFormValues) => {
    if (!manageHackathonId) return;
    await createTaskMutation.mutateAsync({
      hackathonId: manageHackathonId,
      payload: {
        title: values.title,
        description: values.description || undefined,
        max_score: values.max_score ? Number(values.max_score) : 100,
        deadline_at: values.deadline_at
          ? new Date(values.deadline_at).toISOString()
          : null,
        order_index: values.order_index ? Number(values.order_index) : 1,
      },
    });
    taskForm.reset({
      title: "",
      description: "",
      max_score: "100",
      deadline_at: "",
      order_index: String((detailQuery.data?.tasks?.length || 0) + 2),
    });
  };

  const handleClearAllTasks = async () => {
    if (!manageHackathonId) return;
    await clearAllTasksMutation.mutateAsync(manageHackathonId);
    setConfirmClearTasksOpen(false);
  };

  const managed = detailQuery.data;
  const filteredParticipants = React.useMemo(() => {
    const list = managed?.participants || [];
    if (!participantSearch.trim()) return list;
    const q = participantSearch.toLowerCase();
    return list.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.team_name && p.team_name.toLowerCase().includes(q)) ||
        (p.direction && p.direction.toLowerCase().includes(q))
    );
  }, [managed?.participants, participantSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Hakatonlar</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hakaton yaratish, boshlanish vaqtlarini belgilash, vaqtincha
            to&apos;xtatish, vazifalar va ro&apos;yxatdan o&apos;tganlarni
            boshqarish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => hackathonsQuery.refetch()}
            disabled={hackathonsQuery.isFetching}
            className="h-8 text-xs bg-background"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${
                hackathonsQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Yangilash
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-8 text-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Yangi hakaton yaratish
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3.5 sm:grid-cols-4">
        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Jami hakatonlar</p>
            <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {totalHackathons}
          </p>
        </div>

        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Faol hakatonlar</p>
            <PlayCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Vaqtincha to&apos;xtatilgan
            </p>
            <PauseCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {pausedCount}
          </p>
        </div>

        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Ro&apos;yxatdan o&apos;tganlar
            </p>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {totalParticipants}
          </p>
        </div>
      </div>

      {/* Filters & Hackathons Table */}
      <div className="rounded-xl border bg-card/95 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Hakaton nomi yoki manzil bo'yicha qidiruv..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs outline-none"
            >
              <option value="all">Barcha holatlar</option>
              <option value="active">Faol</option>
              <option value="upcoming">Kutilmoqda</option>
              <option value="paused">Vaqtincha to&apos;xtatilgan</option>
              <option value="draft">Qoralama</option>
              <option value="finished">Yakunlangan</option>
              <option value="cancelled">Bekor qilingan</option>
            </select>
          </div>
        </div>

        <div className="p-0">
          {hackathonsQuery.isLoading ? (
            <div className="p-4 space-y-2.5">
              {[1, 2].map((n) => (
                <Skeleton key={n} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : hackathons.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs font-medium">Hakatonlar topilmadi</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Yangi hakaton yaratish tugmasini bosing
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4 text-xs">Hakaton nomi</TableHead>
                  <TableHead className="text-xs">Holati</TableHead>
                  <TableHead className="text-xs">
                    Boshlanish & Tugash vaqti
                  </TableHead>
                  <TableHead className="text-xs">
                    Ishtirokchilar
                  </TableHead>
                  <TableHead className="text-xs">Vazifalar</TableHead>
                  <TableHead className="text-right pr-4 text-xs">
                    Boshqaruv amallari
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hackathons.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="pl-4">
                      <div>
                        <div className="font-medium text-xs">{h.title}</div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          {h.prize_pool && <span>{h.prize_pool}</span>}
                          {h.location && (
                            <span className="flex items-center gap-0.5">
                              • <MapPin className="h-3 w-3" /> {h.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={
                            h.status === "active"
                              ? "default"
                              : h.status === "paused"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[11px] font-normal"
                        >
                          {STATUS_LABELS[h.status] || h.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {h.is_registration_open
                            ? "Qabul ochiq"
                            : "Qabul yopiq"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDateTime(h.start_at)}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground pl-4">
                          Tugash: {formatDateTime(h.end_at)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setManageHackathonId(h.id);
                          setActiveTab("participants");
                        }}
                      >
                        <Users className="mr-1.5 h-3.5 w-3.5" />
                        {h.participants_count || 0}
                        {h.max_participants ? ` / ${h.max_participants}` : ""}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setManageHackathonId(h.id);
                          setActiveTab("tasks");
                        }}
                      >
                        <ListChecks className="mr-1.5 h-3.5 w-3.5" />
                        {h.tasks_count || 0} ta vazifa
                      </Button>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleTogglePause(h)}
                          title={
                            h.status === "paused"
                              ? "Hakatonni davom ettirish (Faollashtirish)"
                              : "Hakatonni vaqtinchalik to'xtatish"
                          }
                        >
                          {h.status === "paused" ? (
                            <>
                              <PlayCircle className="mr-1 h-3.5 w-3.5" />
                              Faollashtirish
                            </>
                          ) : (
                            <>
                              <PauseCircle className="mr-1 h-3.5 w-3.5" />
                              To&apos;xtatish
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setManageHackathonId(h.id);
                            setActiveTab("participants");
                          }}
                          title="Ishtirokchilar, Vazifalar va Sozlamalar"
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditHackathon(h)}
                          title="Tahrirlash"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(h)}
                          title="O'chirish"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. CREATE HACKATHON DIALOG */}
      {/* ========================================================= */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yangi hakaton yaratish</DialogTitle>
            <DialogDescription>
              Hakaton nomi, boshlanish/tugash vaqtlari va barcha qoidalarini
              belgilang
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={createForm.handleSubmit(handleCreateSubmit)}
            className="space-y-3.5 py-1"
          >
            <div className="space-y-1.5">
              <Label className="text-xs">Hakaton nomi *</Label>
              <Input
                placeholder="Masalan: AI & Web Innovation Hackathon 2026"
                className="h-8 text-xs"
                {...createForm.register("title")}
              />
              {createForm.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tavsif</Label>
              <Textarea
                placeholder="Hakaton maqsadi va qisqacha ma'lumot..."
                className="text-xs min-h-16"
                {...createForm.register("description")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Qachon boshlanadi (Start)</Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  {...createForm.register("start_at")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Qachon tugaydi (End)</Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  {...createForm.register("end_at")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Ro&apos;yxatdan o&apos;tish boshlanishi
                </Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  {...createForm.register("registration_start_at")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Ro&apos;yxatdan o&apos;tish tugashi
                </Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  {...createForm.register("registration_end_at")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Holati</Label>
                <select
                  value={createForm.watch("status")}
                  onChange={(e) =>
                    createForm.setValue(
                      "status",
                      e.target.value as HackathonStatus
                    )
                  }
                  className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none"
                >
                  <option value="upcoming">Kutilmoqda</option>
                  <option value="active">Faol</option>
                  <option value="paused">Vaqtincha to&apos;xtatilgan</option>
                  <option value="draft">Qoralama</option>
                  <option value="finished">Yakunlangan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Mukofot jamg&apos;armasi</Label>
                <Input
                  placeholder="50,000,000 UZS"
                  className="h-8 text-xs"
                  {...createForm.register("prize_pool")}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Maks. ishtirokchilar</Label>
                <Input
                  type="number"
                  placeholder="150"
                  className="h-8 text-xs"
                  {...createForm.register("max_participants")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Manzil / Format</Label>
                <Input
                  placeholder="Toshkent, IT Park / Online"
                  className="h-8 text-xs"
                  {...createForm.register("location")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Min. jamoa a&apos;zosi</Label>
                <Input
                  type="number"
                  className="h-8 text-xs"
                  {...createForm.register("team_size_min")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Maks. jamoa a&apos;zosi</Label>
                <Input
                  type="number"
                  className="h-8 text-xs"
                  {...createForm.register("team_size_max")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Qoidalar va talablar</Label>
              <Textarea
                placeholder="Hakaton qoidalari..."
                className="text-xs min-h-16"
                {...createForm.register("rules")}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-xs font-medium">
                  Ro&apos;yxatdan o&apos;tish ochiq
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Ishtirokchilar ro&apos;yxatdan o&apos;ta olishi
                </p>
              </div>
              <Switch
                size="sm"
                checked={createForm.watch("is_registration_open")}
                onCheckedChange={(checked) =>
                  createForm.setValue("is_registration_open", Boolean(checked))
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Yaratilmoqda..." : "Yaratish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. EDIT HACKATHON DIALOG */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(editHackathon)}
        onOpenChange={(open) => !open && setEditHackathon(null)}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hakatonni tahrirlash</DialogTitle>
            <DialogDescription>
              #{editHackathon?.id} — {editHackathon?.title}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={editForm.handleSubmit(handleEditSubmit)}
            className="space-y-3.5 py-1"
          >
            <div className="space-y-1.5">
              <Label className="text-xs">Hakaton nomi *</Label>
              <Input
                className="h-8 text-xs"
                {...editForm.register("title")}
              />
              {editForm.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tavsif</Label>
              <Textarea
                className="text-xs min-h-16"
                {...editForm.register("description")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Qachon boshlanadi (Start)</Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  {...editForm.register("start_at")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Qachon tugaydi (End)</Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  {...editForm.register("end_at")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Ro&apos;yxatdan o&apos;tish boshlanishi
                </Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  {...editForm.register("registration_start_at")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Ro&apos;yxatdan o&apos;tish tugashi
                </Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  {...editForm.register("registration_end_at")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Holati</Label>
                <select
                  value={editForm.watch("status")}
                  onChange={(e) =>
                    editForm.setValue(
                      "status",
                      e.target.value as HackathonStatus
                    )
                  }
                  className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none"
                >
                  <option value="upcoming">Kutilmoqda</option>
                  <option value="active">Faol</option>
                  <option value="paused">Vaqtincha to&apos;xtatilgan</option>
                  <option value="draft">Qoralama</option>
                  <option value="finished">Yakunlangan</option>
                  <option value="cancelled">Bekor qilingan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Mukofot jamg&apos;armasi</Label>
                <Input
                  className="h-8 text-xs"
                  {...editForm.register("prize_pool")}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Maks. ishtirokchilar</Label>
                <Input
                  type="number"
                  className="h-8 text-xs"
                  {...editForm.register("max_participants")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Manzil / Format</Label>
                <Input
                  className="h-8 text-xs"
                  {...editForm.register("location")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Min. jamoa a&apos;zosi</Label>
                <Input
                  type="number"
                  className="h-8 text-xs"
                  {...editForm.register("team_size_min")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Maks. jamoa a&apos;zosi</Label>
                <Input
                  type="number"
                  className="h-8 text-xs"
                  {...editForm.register("team_size_max")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Qoidalar va talablar</Label>
              <Textarea
                className="text-xs min-h-16"
                {...editForm.register("rules")}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-xs font-medium">
                  Ro&apos;yxatdan o&apos;tish ochiq
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Qabulni vaqtinchalik yopish yoki ochish
                </p>
              </div>
              <Switch
                size="sm"
                checked={editForm.watch("is_registration_open")}
                onCheckedChange={(checked) =>
                  editForm.setValue("is_registration_open", Boolean(checked))
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditHackathon(null)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 3. MANAGE HACKATHON DIALOG (PARTICIPANTS, TASKS, STATUS) */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(manageHackathonId)}
        onOpenChange={(open) => !open && setManageHackathonId(null)}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pr-6">
              <div>
                <DialogTitle className="text-base">
                  {managed?.title || "Hakaton boshqaruvi"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Ro&apos;yxatdan o&apos;tgan ishtirokchilar, umumiy vazifalar va
                  hakaton holatini boshqarish
                </DialogDescription>
              </div>
              {managed && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      managed.status === "active"
                        ? "default"
                        : managed.status === "paused"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs font-normal"
                  >
                    {STATUS_LABELS[managed.status]}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleTogglePause(managed)}
                  >
                    {managed.status === "paused" ? (
                      <>
                        <PlayCircle className="mr-1 h-3.5 w-3.5" />
                        Davom ettirish
                      </>
                    ) : (
                      <>
                        <PauseCircle className="mr-1 h-3.5 w-3.5" />
                        Vaqtincha to&apos;xtatish
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Custom Minimal Tab Switcher */}
          <div className="flex items-center gap-1 border-b pb-2">
            <Button
              type="button"
              variant={activeTab === "participants" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveTab("participants")}
            >
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Ro&apos;yxatdan o&apos;tgan odamlar (
              {managed?.participants?.length || 0})
            </Button>

            <Button
              type="button"
              variant={activeTab === "tasks" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveTab("tasks")}
            >
              <ListChecks className="mr-1.5 h-3.5 w-3.5" />
              Vazifalar ({managed?.tasks?.length || 0})
            </Button>

            <Button
              type="button"
              variant={activeTab === "settings" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveTab("settings")}
            >
              <Settings2 className="mr-1.5 h-3.5 w-3.5" />
              Vaqt va Holat Boshqaruvi
            </Button>
          </div>

          {detailQuery.isLoading || !managed ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : activeTab === "participants" ? (
            /* TAB 1: REGISTERED PARTICIPANTS */
            <div className="space-y-4 py-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Ishtirokchi, jamoa, tel bo'yicha qidirish..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Jami: {filteredParticipants.length} nafar ishtirokchi
                </p>
              </div>

              {filteredParticipants.length === 0 ? (
                <div className="rounded-xl border py-10 text-center">
                  <p className="text-xs font-medium">
                    Ro&apos;yxatdan o&apos;tgan ishtirokchilar topilmadi
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs pl-3">F.I.Sh</TableHead>
                        <TableHead className="text-xs">Aloqa</TableHead>
                        <TableHead className="text-xs">
                          Jamoa & Yo&apos;nalish
                        </TableHead>
                        <TableHead className="text-xs">Holati</TableHead>
                        <TableHead className="text-xs text-right pr-3">
                          Amal
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="pl-3">
                            <div className="font-medium text-xs">
                              {p.full_name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {p.username ? `@${p.username}` : "—"}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <div>{p.phone || "—"}</div>
                            <div className="text-[11px]">{p.email || ""}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-medium">
                              {p.team_name || "Yakka"}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {p.direction || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <select
                              value={p.status}
                              onChange={(e) =>
                                updateParticipantStatusMutation.mutate({
                                  hackathonId: managed.id,
                                  participantId: p.id,
                                  status: e.target.value as ParticipantStatus,
                                })
                              }
                              className="h-7 rounded-md border border-input bg-background px-2 text-xs outline-none"
                            >
                              {Object.entries(PARTICIPANT_STATUS_LABELS).map(
                                ([val, label]) => (
                                  <option key={val} value={val}>
                                    {label}
                                  </option>
                                )
                              )}
                            </select>
                          </TableCell>
                          <TableCell className="text-right pr-3">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                removeParticipantMutation.mutate({
                                  hackathonId: managed.id,
                                  participantId: p.id,
                                })
                              }
                              title="Ishtirokchini hakatondan o'chirish"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : activeTab === "tasks" ? (
            /* TAB 2: HACKATHON TASKS & CLEAR ALL TASKS */
            <div className="space-y-4 py-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border bg-secondary/40 p-3">
                <div>
                  <p className="text-xs font-medium">
                    Hakatondagi barcha vazifalar ({managed.tasks?.length || 0}{" "}
                    ta)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Yangi vazifa qo&apos;shishingiz yoki umumiy barcha
                    vazifalarni birdaniga o&apos;chirishingiz mumkin
                  </p>
                </div>

                {(managed.tasks?.length || 0) > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setConfirmClearTasksOpen(true)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Barcha vazifalarni o&apos;chirish
                  </Button>
                )}
              </div>

              {/* Add new task form */}
              <form
                onSubmit={taskForm.handleSubmit(handleAddTask)}
                className="rounded-xl border p-3.5 space-y-3"
              >
                <p className="text-xs font-semibold">
                  Yangi vazifa qo&apos;shish
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Vazifa sarlavhasi *"
                      className="h-8 text-xs"
                      {...taskForm.register("title")}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Maks. ball (100)"
                      className="h-8 text-xs"
                      {...taskForm.register("max_score")}
                    />
                  </div>
                  <div>
                    <Input
                      type="datetime-local"
                      className="h-8 text-xs"
                      {...taskForm.register("deadline_at")}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Vazifa tavsifi va shartlari (ixtiyoriy)..."
                    className="h-8 text-xs flex-1"
                    {...taskForm.register("description")}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={createTaskMutation.isPending}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Qo&apos;shish
                  </Button>
                </div>
              </form>

              {/* Tasks List */}
              {(managed.tasks?.length || 0) === 0 ? (
                <div className="rounded-xl border py-10 text-center">
                  <p className="text-xs font-medium">
                    Ushbu hakatonda hozircha vazifalar yo&apos;q
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {managed.tasks?.map((task, idx) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between gap-3 rounded-xl border p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-semibold">
                            {task.title}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {task.max_score} ball
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        {task.deadline_at && (
                          <p className="text-[11px] text-muted-foreground">
                            Muddat: {formatDateTime(task.deadline_at)}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          deleteTaskMutation.mutate({
                            hackathonId: managed.id,
                            taskId: task.id,
                          })
                        }
                        title="Vazifani o'chirish"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: QUICK TIME & STATUS SETTINGS */
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border p-3.5 space-y-2">
                  <p className="text-xs font-semibold">Hakaton holati</p>
                  <p className="text-[11px] text-muted-foreground">
                    Hakatonni istalgan vaqtda vaqtincha to&apos;xtatish,
                    faollashtirish yoki yakunlash
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(
                      [
                        "upcoming",
                        "active",
                        "paused",
                        "finished",
                        "cancelled",
                      ] as HackathonStatus[]
                    ).map((st) => (
                      <Button
                        key={st}
                        type="button"
                        size="sm"
                        variant={managed.status === st ? "default" : "outline"}
                        className="h-7 text-xs"
                        onClick={() =>
                          statusMutation.mutate({
                            id: managed.id,
                            status: st,
                          })
                        }
                      >
                        {STATUS_LABELS[st]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">
                        Ro&apos;yxatdan o&apos;tish holati
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Yangi ishtirokchilar qabulini boshqarish
                      </p>
                    </div>
                    <Switch
                      checked={managed.is_registration_open}
                      onCheckedChange={(checked) =>
                        statusMutation.mutate({
                          id: managed.id,
                          is_registration_open: Boolean(checked),
                        })
                      }
                    />
                  </div>
                  <div className="pt-2 text-xs text-muted-foreground space-y-1">
                    <div>
                      Boshlanish vaqti:{" "}
                      <span className="text-foreground font-medium">
                        {formatDateTime(managed.start_at)}
                      </span>
                    </div>
                    <div>
                      Tugash vaqti:{" "}
                      <span className="text-foreground font-medium">
                        {formatDateTime(managed.end_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    const target = managed;
                    setManageHackathonId(null);
                    setEditHackathon(target);
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Barcha vaqt va qoidalarni tahrirlash
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 4. CONFIRM CLEAR ALL TASKS DIALOG */}
      {/* ========================================================= */}
      <Dialog
        open={confirmClearTasksOpen}
        onOpenChange={setConfirmClearTasksOpen}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Barcha vazifalarni o&apos;chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham{" "}
              <span className="font-medium text-foreground">
                {managed?.title}
              </span>{" "}
              hakatonidagi barcha ({managed?.tasks?.length || 0} ta) vazifalarni
              butunlay o&apos;chirib tashlamoqchimisiz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmClearTasksOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={clearAllTasksMutation.isPending}
              onClick={handleClearAllTasks}
            >
              {clearAllTasksMutation.isPending
                ? "O'chirilmoqda..."
                : "Ha, barchasini o'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 5. DELETE HACKATHON DIALOG */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hakatonni o&apos;chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>{" "}
              hakatonini barcha vazifalari va ro&apos;yxatlari bilan birga
              o&apos;chirmoqchimisiz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteMutation.mutateAsync(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
