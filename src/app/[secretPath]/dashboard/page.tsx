"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Users,
  Shield,
  UserCheck,
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminsQuery,
  useAdminDetailQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} from "@/hooks/use-admins";
import { useAdminAuthStore } from "@/store/use-admin-auth-store";
import type { Admin, AdminRole } from "@/types/admin";

const createAdminFormSchema = z.object({
  full_name: z.string().min(2, "F.I.Sh kamida 2 ta harfdan iborat bo'lsin"),
  username: z.string().min(3, "Username kamida 3 ta belgidan iborat bo'lsin"),
  phone: z.string().optional(),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lsin"),
  role: z.enum(["super_admin", "admin"]),
  is_active: z.boolean(),
});

type CreateAdminFormValues = z.infer<typeof createAdminFormSchema>;

const editAdminFormSchema = z.object({
  full_name: z.string().min(2, "F.I.Sh kamida 2 ta harfdan iborat bo'lsin"),
  username: z.string().min(3, "Username kamida 3 ta belgidan iborat bo'lsin"),
  phone: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(["super_admin", "admin"]),
  is_active: z.boolean(),
});

type EditAdminFormValues = z.infer<typeof editAdminFormSchema>;

export default function AdminsDashboardPage() {
  const { admin: currentAdmin, updateCurrentAdmin } = useAdminAuthStore();

  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editAdmin, setEditAdmin] = React.useState<Admin | null>(null);
  const [viewAdminId, setViewAdminId] = React.useState<number | null>(null);
  const [deleteAdmin, setDeleteAdmin] = React.useState<Admin | null>(null);

  const adminsQuery = useAdminsQuery({
    search,
    role: roleFilter,
    is_active: statusFilter,
  });
  const detailQuery = useAdminDetailQuery(viewAdminId);
  const createMutation = useCreateAdminMutation();
  const updateMutation = useUpdateAdminMutation();
  const deleteMutation = useDeleteAdminMutation();

  const admins = adminsQuery.data?.data || [];

  const totalAdmins = admins.length;
  const superAdminsCount = admins.filter((a) => a.role === "super_admin").length;
  const activeAdminsCount = admins.filter((a) => a.is_active).length;

  const isEditingSelf = Boolean(
    editAdmin && currentAdmin && editAdmin.id === currentAdmin.id
  );

  const createForm = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminFormSchema),
    defaultValues: {
      full_name: "",
      username: "",
      phone: "",
      password: "",
      role: "admin",
      is_active: true,
    },
  });

  const editForm = useForm<EditAdminFormValues>({
    resolver: zodResolver(editAdminFormSchema),
    defaultValues: {
      full_name: "",
      username: "",
      phone: "",
      password: "",
      role: "admin",
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (editAdmin) {
      editForm.reset({
        full_name: editAdmin.full_name,
        username: editAdmin.username,
        phone: editAdmin.phone || "",
        password: "",
        role: editAdmin.role,
        is_active: editAdmin.is_active,
      });
    }
  }, [editAdmin, editForm]);

  const handleCreateSubmit = async (values: CreateAdminFormValues) => {
    await createMutation.mutateAsync({
      full_name: values.full_name,
      username: values.username,
      phone: values.phone || undefined,
      password: values.password,
      role: values.role,
      is_active: values.is_active,
    });
    createForm.reset();
    setCreateOpen(false);
  };

  const handleEditSubmit = async (values: EditAdminFormValues) => {
    if (!editAdmin) return;

    if (isEditingSelf && !values.is_active) {
      toast.error("Siz o'zingizning hisobingizni nofaol qila olmaysiz");
      return;
    }

    const res = await updateMutation.mutateAsync({
      id: editAdmin.id,
      payload: {
        full_name: values.full_name,
        username: values.username,
        phone: values.phone || undefined,
        ...(values.password && values.password.trim().length >= 6
          ? { password: values.password.trim() }
          : {}),
        role: values.role,
        is_active: isEditingSelf ? true : values.is_active,
      },
    });

    if (isEditingSelf && res?.data) {
      updateCurrentAdmin(res.data);
    }

    setEditAdmin(null);
  };

  const handleQuickToggleStatus = (targetAdmin: Admin) => {
    if (currentAdmin && targetAdmin.id === currentAdmin.id) {
      toast.error("Siz o'zingizning hisobingizni nofaol qila olmaysiz");
      return;
    }

    updateMutation.mutate({
      id: targetAdmin.id,
      payload: { is_active: !targetAdmin.is_active },
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteAdmin) return;
    if (currentAdmin && deleteAdmin.id === currentAdmin.id) {
      toast.error("Siz o'zingizning hisobingizni o'chira olmaysiz");
      setDeleteAdmin(null);
      return;
    }
    await deleteMutation.mutateAsync(deleteAdmin.id);
    setDeleteAdmin(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Adminlar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tizim administratorlarini qo&apos;shish, tahrirlash va nazorat qilish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adminsQuery.refetch()}
            disabled={adminsQuery.isFetching}
            className="h-9 text-sm bg-background"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${
                adminsQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Yangilash
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-9 text-sm"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Admin qo&apos;shish
          </Button>
        </div>
      </div>

      {/* Minimal Stats Cards */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Jami adminlar</p>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {totalAdmins}
          </p>
        </div>

        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Super adminlar</p>
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {superAdminsCount}
          </p>
        </div>

        <div className="rounded-xl border bg-card/95 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Faol hisoblar</p>
            <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {activeAdminsCount}
          </p>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="rounded-xl border bg-card/95 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Qidiruv (ism, username, tel)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs outline-none"
            >
              <option value="all">Barcha rollar</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs outline-none"
            >
              <option value="all">Barcha holatlar</option>
              <option value="true">Faol</option>
              <option value="false">Nofaol</option>
            </select>
          </div>
        </div>

        <div className="p-0">
          {adminsQuery.isLoading ? (
            <div className="p-4 space-y-2.5">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs font-medium">Adminlar topilmadi</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Qidiruv so&apos;rovini o&apos;zgartiring yoki yangi admin qo&apos;shing
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-14 pl-4 text-sm">ID</TableHead>
                  <TableHead className="text-sm">F.I.Sh & Username</TableHead>
                  <TableHead className="text-sm">Telefon</TableHead>
                  <TableHead className="text-sm">Rol</TableHead>
                  <TableHead className="text-sm">Holati</TableHead>
                  <TableHead className="text-sm">Sana</TableHead>
                  <TableHead className="text-right pr-4 text-sm">
                    Amallar
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((item) => {
                  const isSelf = currentAdmin?.id === item.id;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 font-mono text-sm text-muted-foreground">
                        #{item.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-secondary text-xs font-medium">
                            {item.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-sm">
                              <span>{item.full_name}</span>
                              {isSelf && (
                                <Badge
                                  variant="outline"
                                  className="h-4 px-1.5 text-xs font-normal"
                                >
                                  Siz
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{item.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.role === "super_admin" ? "default" : "secondary"
                          }
                          className="text-xs font-normal"
                        >
                          {item.role === "super_admin" ? "Super Admin" : "Admin"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-2"
                          title={
                            isSelf
                              ? "O'zingizning hisobingizni nofaol qila olmaysiz"
                              : undefined
                          }
                        >
                          <Switch
                            size="sm"
                            checked={item.is_active}
                            disabled={isSelf}
                            onCheckedChange={() => handleQuickToggleStatus(item)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {item.is_active ? "Faol" : "Nofaol"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("uz-UZ")}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setViewAdminId(item.id)}
                            title="Ko'rish"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditAdmin(item)}
                            title="Tahrirlash"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={isSelf}
                            onClick={() => !isSelf && setDeleteAdmin(item)}
                            title={
                              isSelf
                                ? "O'zingizni o'chira olmaysiz"
                                : "O'chirish"
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi admin qo&apos;shish</DialogTitle>
            <DialogDescription>
              Yangi administrator ma&apos;lumotlarini to&apos;ldiring
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={createForm.handleSubmit(handleCreateSubmit)}
            className="space-y-3.5 py-1"
          >
            <div className="space-y-1.5">
              <Label htmlFor="create-full_name" className="text-xs">
                To&apos;liq ism (F.I.Sh)
              </Label>
              <Input
                id="create-full_name"
                placeholder="Sardor Alimov"
                className="h-9 text-sm"
                {...createForm.register("full_name")}
              />
              {createForm.formState.errors.full_name && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-username" className="text-xs">
                  Username
                </Label>
                <Input
                  id="create-username"
                  placeholder="sardor_admin"
                  className="h-9 text-sm"
                  {...createForm.register("username")}
                />
                {createForm.formState.errors.username && (
                  <p className="text-xs text-destructive">
                    {createForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-phone" className="text-xs">
                  Telefon
                </Label>
                <Input
                  id="create-phone"
                  placeholder="+998901234567"
                  className="h-9 text-sm"
                  {...createForm.register("phone")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-password" className="text-xs">
                  Parol
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Kamida 6 ta belgi"
                  className="h-9 text-sm"
                  {...createForm.register("password")}
                />
                {createForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {createForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-role" className="text-xs">
                  Rol
                </Label>
                <select
                  id="create-role"
                  value={createForm.watch("role")}
                  onChange={(e) =>
                    createForm.setValue("role", e.target.value as AdminRole)
                  }
                  className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-xs font-medium">Faol hisob</p>
                <p className="text-sm text-muted-foreground">
                  Tizimga kirishga ruxsat
                </p>
              </div>
              <Switch
                size="sm"
                checked={createForm.watch("is_active")}
                onCheckedChange={(checked) =>
                  createForm.setValue("is_active", Boolean(checked))
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
                {createMutation.isPending ? "Saqlanmoqda..." : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog
        open={Boolean(editAdmin)}
        onOpenChange={(open) => !open && setEditAdmin(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adminni tahrirlash</DialogTitle>
            <DialogDescription>
              #{editAdmin?.id} — @{editAdmin?.username}
              {isEditingSelf ? " (Sizning profilingiz)" : ""}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={editForm.handleSubmit(handleEditSubmit)}
            className="space-y-3.5 py-1"
          >
            <div className="space-y-1.5">
              <Label htmlFor="edit-full_name" className="text-xs">
                To&apos;liq ism (F.I.Sh)
              </Label>
              <Input
                id="edit-full_name"
                className="h-9 text-sm"
                {...editForm.register("full_name")}
              />
              {editForm.formState.errors.full_name && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-username" className="text-xs">
                  Username
                </Label>
                <Input
                  id="edit-username"
                  className="h-9 text-sm"
                  {...editForm.register("username")}
                />
                {editForm.formState.errors.username && (
                  <p className="text-xs text-destructive">
                    {editForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs">
                  Telefon
                </Label>
                <Input
                  id="edit-phone"
                  className="h-9 text-sm"
                  {...editForm.register("phone")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-password" className="text-xs">
                  Yangi parol (ixtiyoriy)
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="O'zgartirmaslik uchun bo'sh"
                  className="h-9 text-sm"
                  {...editForm.register("password")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-role" className="text-xs">
                  Rol
                </Label>
                <select
                  id="edit-role"
                  value={editForm.watch("role")}
                  onChange={(e) =>
                    editForm.setValue("role", e.target.value as AdminRole)
                  }
                  className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-xs font-medium">Faollik holati</p>
                <p className="text-sm text-muted-foreground">
                  {isEditingSelf
                    ? "O'zingizning hisobingizni nofaol qila olmaysiz"
                    : "Nofaol bo'lsa tizimga kira olmaydi"}
                </p>
              </div>
              <Switch
                size="sm"
                checked={editForm.watch("is_active")}
                disabled={isEditingSelf}
                onCheckedChange={(checked) =>
                  !isEditingSelf &&
                  editForm.setValue("is_active", Boolean(checked))
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditAdmin(null)}
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

      {/* GET ONE SHEET */}
      <Sheet
        open={Boolean(viewAdminId)}
        onOpenChange={(open) => !open && setViewAdminId(null)}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Admin tafsilotlari</SheetTitle>
            <SheetDescription>ID #{viewAdminId}</SheetDescription>
          </SheetHeader>

          <div className="p-4 space-y-4">
            {detailQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : detailQuery.data ? (
              <>
                <div className="rounded-lg border p-3.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {detailQuery.data.full_name}
                    </p>
                    {currentAdmin?.id === detailQuery.data.id && (
                      <Badge variant="outline" className="text-xs h-4 px-1.5">
                        Siz
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{detailQuery.data.username}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Rol</span>
                    <span className="font-medium">
                      {detailQuery.data.role === "super_admin"
                        ? "Super Admin"
                        : "Admin"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Holati</span>
                    <span className="font-medium">
                      {detailQuery.data.is_active ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Telefon</span>
                    <span>{detailQuery.data.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Qo&apos;shilgan</span>
                    <span>
                      {new Date(detailQuery.data.created_at).toLocaleString(
                        "uz-UZ"
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      const target = detailQuery.data!;
                      setViewAdminId(null);
                      setEditAdmin(target);
                    }}
                  >
                    Tahrirlash
                  </Button>
                  {currentAdmin?.id !== detailQuery.data.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const target = detailQuery.data!;
                        setViewAdminId(null);
                        setDeleteAdmin(target);
                      }}
                    >
                      O&apos;chirish
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Topilmadi</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* DELETE DIALOG */}
      <Dialog
        open={Boolean(deleteAdmin)}
        onOpenChange={(open) => !open && setDeleteAdmin(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adminni o&apos;chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham{" "}
              <span className="font-medium text-foreground">
                {deleteAdmin?.full_name} (@{deleteAdmin?.username})
              </span>{" "}
              hisobini o&apos;chirmoqchimisiz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteAdmin(null)}
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
