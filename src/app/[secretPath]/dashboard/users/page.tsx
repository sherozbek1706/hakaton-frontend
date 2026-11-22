"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  Users,
  KeyRound,
  Phone,
  Mail,
  Calendar,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface AdminViewUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  pin_code: string | null;
  email: string | null;
  google_id: string | null;
  auth_provider: "local" | "google";
  is_profile_completed: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");

  // Default holatda barcha parollar (PIN) yashirin bo'ladi!
  // Faqat xohlagan foydalanuvchi qatoridagi ko'zchani bosganda o'sha foydalanuvchiniki ko'rinadi
  const [visiblePinIds, setVisiblePinIds] = React.useState<
    Record<number, boolean>
  >({});

  // Batafsil ko'rish oynasi (Sheet) va uning ichidagi PIN ko'rinishi
  const [viewUser, setViewUser] = React.useState<AdminViewUser | null>(null);
  const [viewSheetPinVisible, setViewSheetPinVisible] = React.useState(false);

  // Tahrirlash oynasi (Dialog)
  const [editUser, setEditUser] = React.useState<AdminViewUser | null>(null);
  const [editFirstName, setEditFirstName] = React.useState("");
  const [editLastName, setEditLastName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editPin, setEditPin] = React.useState("");
  const [showEditPin, setShowEditPin] = React.useState(false);

  const toggleRowPin = (userId: number) => {
    setVisiblePinIds((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const usersQuery = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: AdminViewUser[];
      }>("/users", {
        params: search.trim() ? { search: search.trim() } : {},
      });
      return data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        first_name: string;
        last_name: string;
        phone: string;
        pin?: string;
      };
    }) => {
      const { data } = await api.patch(`/users/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Foydalanuvchi ma'lumotlari yangilandi");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditUser(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      toast.success("Foydalanuvchi o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      if (viewUser) setViewUser(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "O'chirishda xatolik");
    },
  });

  const users = usersQuery.data || [];

  const openEdit = (u: AdminViewUser) => {
    setEditUser(u);
    setEditFirstName(u.first_name);
    setEditLastName(u.last_name);
    setEditPhone(u.phone || "+998");
    setEditPin(u.pin_code || "");
    setShowEditPin(false);
  };

  const openViewSheet = (u: AdminViewUser) => {
    setViewUser(u);
    setViewSheetPinVisible(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Foydalanuvchilar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Saytdan ro&apos;yxatdan o&apos;tgan barcha talaba va o&apos;quvchilar
            ro&apos;yxati
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => usersQuery.refetch()}
            disabled={usersQuery.isFetching}
            className="h-9 text-sm bg-background"
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${
                usersQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Jami foydalanuvchilar
            </p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {users.length}
          </p>
        </div>

        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Google orqali ulanganlar
            </p>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {users.filter((u) => u.auth_provider === "google").length}
          </p>
        </div>

        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Telefon & PIN tasdiqlangan
            </p>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {users.filter((u) => u.is_profile_completed && u.phone).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card/95 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ism, familiya, telefon yoki email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-background"
            />
          </div>
        </div>

        {usersQuery.isLoading ? (
          <div className="p-4 space-y-2.5">
            {[1, 2].map((n) => (
              <Skeleton key={n} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-medium">
              Hozircha ro&apos;yxatdan o&apos;tgan foydalanuvchilar yo&apos;q
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Yangi foydalanuvchilar ro&apos;yxatdan o&apos;tganda shu yerda
              ko&apos;rinadi.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4 text-sm">ID</TableHead>
                <TableHead className="text-sm">Ism va Familiya</TableHead>
                <TableHead className="text-sm">Telefon raqam</TableHead>
                <TableHead className="text-sm">
                  6 xonali PIN (Parol)
                </TableHead>
                <TableHead className="text-sm">Kirish turi / Google</TableHead>
                <TableHead className="text-sm">Sana</TableHead>
                <TableHead className="text-right pr-4 text-sm">
                  Amallar
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isPinShown = Boolean(visiblePinIds[u.id]);
                return (
                  <TableRow key={u.id}>
                    <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                      #{u.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-secondary text-xs font-semibold">
                          {u.first_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="font-medium text-sm">
                          {u.first_name} {u.last_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {u.phone || (
                        <Badge variant="destructive" className="text-xs">
                          Kiritilmagan
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.pin_code ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1">
                          <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono text-sm tracking-widest min-w-[54px]">
                            {isPinShown ? u.pin_code : "••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRowPin(u.id)}
                            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                            title={
                              isPinShown
                                ? "Parolni yashirish"
                                : "Parolni ko'rish"
                            }
                          >
                            {isPinShown ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Kiritilmagan
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.auth_provider === "google" ? (
                        <div className="space-y-0.5">
                          <Badge variant="default" className="text-xs">
                            Google ulandi
                          </Badge>
                          {u.email && (
                            <div className="text-xs text-muted-foreground">
                              {u.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Telefon + PIN
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("uz-UZ")}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openViewSheet(u)}
                          title="Umumiy ma'lumotni ko'rish"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(u)}
                          title="Tahrirlash"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteMutation.mutate(u.id)}
                          title="O'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. USER FULL DETAILS DRAWER (Ko'zcha bosilganda umumiy ma'lumot) */}
      {/* ========================================================= */}
      <Sheet
        open={Boolean(viewUser)}
        onOpenChange={(open) => !open && setViewUser(null)}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Foydalanuvchi ma&apos;lumotlari</SheetTitle>
            <SheetDescription>
              ID #{viewUser?.id} — To&apos;liq profil tafsilotlari
            </SheetDescription>
          </SheetHeader>

          {viewUser && (
            <div className="p-4 space-y-5">
              <div className="flex items-center gap-3.5 rounded-xl border bg-secondary/30 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-foreground text-background font-bold text-base">
                  {viewUser.first_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-base font-semibold">
                    {viewUser.first_name} {viewUser.last_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {viewUser.auth_provider === "google"
                      ? `Google Auth (${viewUser.email || ""})`
                      : "Standart ro'yxatdan o'tgan"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <span className="text-muted-foreground">Ism</span>
                  <span className="font-medium">{viewUser.first_name}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2.5">
                  <span className="text-muted-foreground">Familiya</span>
                  <span className="font-medium">{viewUser.last_name}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Telefon raqam
                  </span>
                  <span className="font-mono font-medium">
                    {viewUser.phone || "Kiritilmagan"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" /> 6 xonali PIN (Parol)
                  </span>
                  {viewUser.pin_code ? (
                    <div className="inline-flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1">
                      <span className="font-mono text-sm tracking-widest">
                        {viewSheetPinVisible ? viewUser.pin_code : "••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewSheetPinVisible((p) => !p)}
                        className="text-muted-foreground hover:text-foreground"
                        title={
                          viewSheetPinVisible
                            ? "Parolni yashirish"
                            : "Parolni ko'rish"
                        }
                      >
                        {viewSheetPinVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Kiritilmagan
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-b pb-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Google Email
                  </span>
                  <span className="text-xs">
                    {viewUser.email || "Ulanmagan"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" /> Profil holati
                  </span>
                  <Badge
                    variant={
                      viewUser.is_profile_completed ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {viewUser.is_profile_completed
                      ? "To'liq tasdiqlangan"
                      : "Telefon/PIN kutilmoqda"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-b pb-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Ro&apos;yxatdan o&apos;tgan
                  </span>
                  <span className="text-xs">
                    {new Date(viewUser.created_at).toLocaleString("uz-UZ")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-sm"
                  onClick={() => {
                    const target = viewUser;
                    setViewUser(null);
                    openEdit(target);
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Tahrirlash
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 h-9 text-sm"
                  onClick={() => deleteMutation.mutate(viewUser.id)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  O&apos;chirish
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ========================================================= */}
      {/* 2. EDIT USER DIALOG */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(editUser)}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Foydalanuvchini tahrirlash</DialogTitle>
            <DialogDescription>
              #{editUser?.id} — {editUser?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Ism</Label>
                <Input
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Familiya</Label>
                <Input
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Telefon raqam</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">6 xonali PIN-kod (Parol)</Label>
              <div className="relative">
                <Input
                  type={showEditPin ? "text" : "password"}
                  value={editPin}
                  maxLength={6}
                  onChange={(e) =>
                    setEditPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  className="h-9 pr-10 text-sm font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPin((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showEditPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditUser(null)}
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={updateMutation.isPending}
              onClick={() => {
                if (!editUser) return;
                updateMutation.mutate({
                  id: editUser.id,
                  payload: {
                    first_name: editFirstName,
                    last_name: editLastName,
                    phone: editPhone,
                    ...(editPin.length === 6 ? { pin: editPin } : {}),
                  },
                });
              }}
            >
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
