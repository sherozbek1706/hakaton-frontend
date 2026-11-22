"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Search,
  RefreshCw,
  FileCheck2,
  Users,
  Image as ImageIcon,
  FileArchive,
  ExternalLink,
  Play,
  CheckCircle2,
  XCircle,
  Eye,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { SOCKET_URL } from "@/lib/constants";
import { useHackathonsQuery } from "@/hooks/use-hackathons";

interface SubmissionRecord {
  id: number;
  hackathon_id: number;
  task_id: number;
  user_id: number;
  project_name: string | null;
  project_description: string | null;
  project_link: string | null;
  project_image: string | null;
  project_zip: string | null;
  edit_count: number;
  max_edits: number;
  remaining_edits: number;
  submitted_at: string;
  updated_at: string;
  user_first_name: string;
  user_last_name: string;
  user_full_name: string;
  user_phone: string | null;
  user_email: string | null;
  hackathon_title: string;
  task_title: string;
  task_max_score: number;
}

interface ParticipantRow {
  participant_id: number;
  hackathon_id: number;
  user_id: number | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  team_name: string | null;
  direction: string | null;
  participant_status: string;
  registered_at: string;
  hackathon_title: string;
}

interface TaskRow {
  id: number;
  hackathon_id: number;
  title: string;
  max_score: number;
  order_index: number;
}

interface ZipPreviewResult {
  found: boolean;
  submissionId: number;
  indexPath?: string;
  previewUrl: string | null;
  message?: string;
  files: string[];
}

export default function AdminSubmissionsMonitoringPage() {
  const [selectedHackathonId, setSelectedHackathonId] =
    React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"submissions" | "matrix">(
    "submissions"
  );

  // Live Preview Modal state for index.html inside ZIP
  const [previewData, setPreviewData] = React.useState<ZipPreviewResult | null>(
    null
  );
  // Image Preview Modal
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(
    null
  );

  const hackathonsQuery = useHackathonsQuery({});
  const hackathons = hackathonsQuery.data?.data || [];

  const overviewQuery = useQuery({
    queryKey: ["admin-submissions-overview", selectedHackathonId],
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: {
          submissions: SubmissionRecord[];
          participants: ParticipantRow[];
          tasks: TaskRow[];
        };
      }>("/hackathons/submissions/overview", {
        params: { hackathon_id: selectedHackathonId },
      });
      return data.data;
    },
  });

  const previewZipMutation = useMutation({
    mutationFn: async (submissionId: number) => {
      const { data } = await api.post<{
        success: boolean;
        data: ZipPreviewResult;
      }>(`/hackathons/submissions/${submissionId}/preview-zip`);
      return data.data;
    },
    onSuccess: (res) => {
      setPreviewData(res);
      if (!res.found) {
        toast.warning(res.message || "ZIP ichidan index.html topilmadi");
      } else {
        toast.success(`index.html topildi va ochildi: ${res.indexPath}`);
      }
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "ZIP faylni ochishda xatolik"
      );
    },
  });

  const submissions = overviewQuery.data?.submissions || [];
  const participants = overviewQuery.data?.participants || [];
  const tasks = overviewQuery.data?.tasks || [];

  const filteredSubmissions = React.useMemo(() => {
    if (!search.trim()) return submissions;
    const q = search.toLowerCase();
    return submissions.filter(
      (s) =>
        (s.user_full_name && s.user_full_name.toLowerCase().includes(q)) ||
        (s.user_phone && s.user_phone.toLowerCase().includes(q)) ||
        (s.project_name && s.project_name.toLowerCase().includes(q)) ||
        (s.task_title && s.task_title.toLowerCase().includes(q)) ||
        (s.hackathon_title && s.hackathon_title.toLowerCase().includes(q))
    );
  }, [submissions, search]);

  const filteredParticipants = React.useMemo(() => {
    if (!search.trim()) return participants;
    const q = search.toLowerCase();
    return participants.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.team_name && p.team_name.toLowerCase().includes(q)) ||
        (p.hackathon_title && p.hackathon_title.toLowerCase().includes(q))
    );
  }, [participants, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Topshirilgan vazifalar kuzatuvi
            </h1>
            <Badge variant="outline" className="text-xs">
              Faqat kuzatish (Read-Only)
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kim vazifani bajardi yoki bajarmadi, nechta tahrirlash imkoniyati
            qoldi, yuklangan rasm, link va ZIP ichidan{" "}
            <code className="font-mono text-foreground">index.html</code> ni
            ochib ko&apos;rish
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => overviewQuery.refetch()}
          disabled={overviewQuery.isFetching}
          className="h-9 text-sm bg-background"
        >
          <RefreshCw
            className={`mr-1.5 h-4 w-4 ${
              overviewQuery.isFetching ? "animate-spin" : ""
            }`}
          />
          Yangilash
        </Button>
      </div>

      {/* Filters & View Mode Switcher */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card/95 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={viewMode === "submissions" ? "default" : "outline"}
            size="sm"
            className="h-9 text-sm"
            onClick={() => setViewMode("submissions")}
          >
            <FileCheck2 className="mr-1.5 h-4 w-4" />
            Yuklangan vazifalar ({submissions.length})
          </Button>

          <Button
            type="button"
            variant={viewMode === "matrix" ? "default" : "outline"}
            size="sm"
            className="h-9 text-sm"
            onClick={() => setViewMode("matrix")}
          >
            <Users className="mr-1.5 h-4 w-4" />
            Kim bajardi / Kim bajarmadi ({participants.length} ishtirokchi)
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ishtirokchi, loyiha, vazifa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-background"
            />
          </div>

          <select
            value={selectedHackathonId}
            onChange={(e) => setSelectedHackathonId(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none"
          >
            <option value="all">Barcha hakatonlar</option>
            {hackathons.map((h) => (
              <option key={h.id} value={String(h.id)}>
                {h.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {overviewQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : viewMode === "submissions" ? (
        /* ========================================================= */
        /* VIEW 1: ALL UPLOADED SUBMISSIONS */
        /* ========================================================= */
        filteredSubmissions.length === 0 ? (
          <div className="rounded-xl border bg-card/95 py-16 text-center space-y-2">
            <FileCheck2 className="mx-auto h-9 w-9 text-muted-foreground" />
            <p className="text-sm font-medium">
              Hozircha topshirilgan vazifalar yo&apos;q
            </p>
            <p className="text-xs text-muted-foreground">
              Ishtirokchilar vazifa yuklaganda shu yerda barcha fayllari bilan
              ko&apos;rinadi
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl border bg-card/95 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold">
                        {sub.user_full_name || "Ishtirokchi"}
                      </span>
                      {sub.user_phone && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {sub.user_phone}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {sub.hackathon_title}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Vazifa:{" "}
                      <span className="text-foreground">{sub.task_title}</span>
                    </p>
                  </div>

                  {/* Edit Chances Status */}
                  <div className="flex flex-col sm:items-end gap-1">
                    <Badge
                      variant={
                        sub.remaining_edits > 0 ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      Tahrirlash imkoniyati: {sub.max_edits} tadan{" "}
                      {sub.remaining_edits} tasi qoldi ({sub.edit_count}/
                      {sub.max_edits} ishlatilgan)
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Topshirildi:{" "}
                      {new Date(sub.submitted_at).toLocaleString("uz-UZ")}
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="rounded-lg border bg-secondary/20 p-3 space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Loyiha nomi:
                    </span>
                    <p className="font-semibold">
                      {sub.project_name || "Kiritilmagan"}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-secondary/20 p-3 space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Loyiha linki:
                    </span>
                    <div>
                      {sub.project_link ? (
                        <a
                          href={sub.project_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 break-all"
                        >
                          {sub.project_link}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">
                          Kiritilmagan
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {sub.project_description && (
                  <div className="rounded-lg border bg-secondary/20 p-3 text-sm space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Loyiha tavsifi:
                    </span>
                    <p className="text-foreground whitespace-pre-wrap">
                      {sub.project_description}
                    </p>
                  </div>
                )}

                {/* Uploaded Files: Image & ZIP + Open index.html */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {sub.project_image ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs bg-background"
                      onClick={() =>
                        setPreviewImageUrl(`${SOCKET_URL}${sub.project_image}`)
                      }
                    >
                      <ImageIcon className="mr-1.5 h-4 w-4" />
                      Yuklangan rasmni ko&apos;rish
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs opacity-60">
                      Rasm yuklanmagan
                    </Badge>
                  )}

                  {sub.project_zip ? (
                    <>
                      <a
                        href={`${SOCKET_URL}${sub.project_zip}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 text-xs bg-background"
                        >
                          <FileArchive className="mr-1.5 h-4 w-4" />
                          ZIP faylni yuklab olish
                        </Button>
                      </a>

                      <Button
                        type="button"
                        size="sm"
                        className="h-9 text-xs"
                        disabled={previewZipMutation.isPending}
                        onClick={() => previewZipMutation.mutate(sub.id)}
                      >
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        ZIP ichidan index.html ni ochish
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline" className="text-xs opacity-60">
                      ZIP fayl yuklanmagan
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ========================================================= */
        /* VIEW 2: PARTICIPANT TASK COMPLETION MATRIX (KIM BAJARDI / BAJARMADI) */
        /* ========================================================= */
        <div className="rounded-xl border bg-card/95 overflow-hidden">
          {filteredParticipants.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-muted-foreground">
                Ro&apos;yxatdan o&apos;tgan ishtirokchilar topilmadi
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 text-sm">Ishtirokchi</TableHead>
                  <TableHead className="text-sm">Hakaton</TableHead>
                  <TableHead className="text-sm">
                    Vazifalar holati (Bajardi / Bajarmadi)
                  </TableHead>
                  <TableHead className="text-sm">
                    Qolgan tahrirlash imkoniyati
                  </TableHead>
                  <TableHead className="text-right pr-4 text-sm">
                    Yuklangan fayllar & index.html
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((p) => {
                  const hackathonTasks = tasks.filter(
                    (t) => t.hackathon_id === p.hackathon_id
                  );
                  const userSubs = submissions.filter(
                    (s) =>
                      s.hackathon_id === p.hackathon_id &&
                      ((p.user_id && s.user_id === p.user_id) ||
                        (p.phone && s.user_phone === p.phone))
                  );

                  return (
                    <TableRow key={p.participant_id}>
                      <TableCell className="pl-4">
                        <div className="font-medium text-sm">{p.full_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {p.phone || p.email || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.hackathon_title}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="text-xs font-medium">
                            {userSubs.length} / {hackathonTasks.length} ta
                            vazifa topshirilgan
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {hackathonTasks.map((t, i) => {
                              const foundSub = userSubs.find(
                                (s) => s.task_id === t.id
                              );
                              return (
                                <Badge
                                  key={t.id}
                                  variant={foundSub ? "default" : "outline"}
                                  className="text-xs font-normal"
                                >
                                  {foundSub ? (
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                  ) : (
                                    <XCircle className="mr-1 h-3 w-3 text-muted-foreground" />
                                  )}
                                  #{i + 1}:{" "}
                                  {foundSub ? "Bajardi" : "Bajarmagan"}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {userSubs.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            Hali topshirmagan (1/1 qolgan)
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {userSubs.map((s) => (
                              <div key={s.id} className="text-xs">
                                <span className="font-medium">
                                  {s.remaining_edits}/{s.max_edits} qoldi
                                </span>{" "}
                                <span className="text-muted-foreground">
                                  ({s.edit_count} marta tahrirlangan)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {userSubs.map((s) => (
                            <React.Fragment key={s.id}>
                              {s.project_image && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() =>
                                    setPreviewImageUrl(
                                      `${SOCKET_URL}${s.project_image}`
                                    )
                                  }
                                >
                                  <ImageIcon className="mr-1 h-3.5 w-3.5" />
                                  Rasm
                                </Button>
                              )}
                              {s.project_zip && (
                                <Button
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() =>
                                    previewZipMutation.mutate(s.id)
                                  }
                                >
                                  <Play className="mr-1 h-3.5 w-3.5" />
                                  index.html
                                </Button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LIVE PREVIEW MODAL FOR index.html EXTRACTED FROM ZIP */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(previewData)}
        onOpenChange={(open) => !open && setPreviewData(null)}
      >
        <DialogContent className="sm:max-w-5xl max-h-[92vh] flex flex-col">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pr-8">
              <div>
                <DialogTitle className="text-lg">
                  ZIP loyiha ichidagi index.html ko&apos;rinishi
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {previewData?.found
                    ? `Topilgan fayl: ${previewData.indexPath} (Jami ${previewData.files.length} ta fayl)`
                    : previewData?.message}
                </DialogDescription>
              </div>

              {previewData?.found && previewData.previewUrl && (
                <a
                  href={`${SOCKET_URL}${previewData.previewUrl}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" className="h-8 text-xs">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Yangi oynada to&apos;liq ochish
                  </Button>
                </a>
              )}
            </div>
          </DialogHeader>

          {previewData?.found && previewData.previewUrl ? (
            <div className="space-y-3 flex-1">
              <div className="w-full h-[65vh] rounded-xl border overflow-hidden bg-white">
                <iframe
                  src={`${SOCKET_URL}${previewData.previewUrl}`}
                  title="ZIP index.html Live Preview"
                  className="w-full h-full border-0"
                />
              </div>

              <details className="rounded-lg border p-2.5 text-xs">
                <summary className="cursor-pointer font-medium flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5" />
                  ZIP ichidagi barcha fayllar ro&apos;yxati (
                  {previewData.files.length} ta)
                </summary>
                <div className="mt-2 max-h-28 overflow-y-auto font-mono text-muted-foreground space-y-0.5 pl-4">
                  {previewData.files.map((f, i) => (
                    <div key={i}>{f}</div>
                  ))}
                </div>
              </details>
            </div>
          ) : (
            <div className="py-8 space-y-3">
              <p className="text-sm text-destructive font-medium">
                Ushbu ZIP fayl ichidan index.html topilmadi.
              </p>
              {previewData?.files && previewData.files.length > 0 && (
                <div className="rounded-lg border p-3 text-xs space-y-1">
                  <p className="font-semibold">ZIP ichidagi mavjud fayllar:</p>
                  <div className="max-h-40 overflow-y-auto font-mono text-muted-foreground">
                    {previewData.files.map((f, i) => (
                      <div key={i}>{f}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. IMAGE PREVIEW MODAL */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(previewImageUrl)}
        onOpenChange={(open) => !open && setPreviewImageUrl(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Yuklangan loyiha surati</DialogTitle>
          </DialogHeader>
          {previewImageUrl && (
            <div className="space-y-3">
              <div className="rounded-xl border overflow-hidden bg-secondary/20 flex items-center justify-center max-h-[70vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImageUrl}
                  alt="Project submission"
                  className="max-h-[68vh] w-auto object-contain"
                />
              </div>
              <div className="flex justify-end">
                <a href={previewImageUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Asl o&apos;lchamda ochish
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
