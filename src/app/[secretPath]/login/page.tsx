"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, Moon, Sun, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLoginMutation } from "@/hooks/use-admins";
import { useAdminAuthStore } from "@/store/use-admin-auth-store";
import { adminPath } from "@/lib/constants";

const loginSchema = z.object({
  username: z.string().min(2, "Username kiriting"),
  password: z.string().min(4, "Parolni kiriting"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SecretAdminLoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, hasHydrated, setAuth } = useAdminAuthStore();
  const loginMutation = useAdminLoginMutation();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace(adminPath("dashboard"));
    }
  }, [hasHydrated, isAuthenticated, router]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const res = await loginMutation.mutateAsync(values);
      setAuth(res.data.admin, res.data.token);
      toast.success(`Xush kelibsiz, ${res.data.admin.full_name}`);
      router.replace(adminPath("dashboard"));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Username yoki parol noto'g'ri";
      toast.error(msg);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground px-4 py-8 overflow-hidden">
      {/* Subtle Grid ("Kletka") Background with soft edge vignette */}
      <div className="pointer-events-none absolute inset-0 bg-minimal-grid" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,var(--background)_85%)]" />

      {/* Top minimal bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-sm font-bold">
            A
          </span>
          <span>Admin Panel</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 bg-background/80 backdrop-blur-xs"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Mavzuni almashtirish"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>

      {/* Center Minimal Login Form */}
      <div className="relative z-10 mx-auto w-full max-w-md space-y-6">
        <div className="space-y-1.5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border bg-card shadow-2xs">
            <Lock className="h-5 w-5 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tizimga kirish
          </h1>
          <p className="text-sm text-muted-foreground">
            Davom etish uchun administrator ma&apos;lumotlarini kiriting
          </p>
        </div>

        <div className="relative rounded-2xl border bg-card/95 p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xs">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Username kiriting"
                autoComplete="username"
                className="h-10 text-sm bg-background"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Parol
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-10 text-sm pr-10 bg-background"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-10 text-sm font-medium mt-1"
            >
              {loginMutation.isPending ? (
                "Tekshirilmoqda..."
              ) : (
                <>
                  Kirish
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-muted-foreground">
        Maxfiy boshqaruv tizimi
      </div>
    </div>
  );
}
