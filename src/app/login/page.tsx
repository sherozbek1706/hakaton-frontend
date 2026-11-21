"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sun, Moon, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/use-app-store";
import { useUserAuthStore } from "@/store/use-user-auth-store";
import { translations } from "@/lib/i18n";
import { useUserLoginMutation } from "@/hooks/use-public-overview";

const loginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(4),
});

export default function StudentLoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useAppStore();
  const { setUserAuth } = useUserAuthStore();
  const t = translations[lang];
  const loginMutation = useUserLoginMutation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const res = await loginMutation.mutateAsync(values);
      setUserAuth(res.user, res.token);
      toast.success(t.auth.loginSuccess);
      router.push("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground px-4 py-8 bg-minimal-grid">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,var(--background)_85%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.auth.backHome}
        </Link>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            {t.auth.loginTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{t.auth.loginDesc}</p>
        </div>

        <div className="rounded-2xl border bg-card/95 p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xs">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">{t.auth.usernameLabel}</Label>
              <Input
                placeholder={t.auth.usernamePlaceholder}
                className="h-10 text-sm bg-background"
                {...form.register("username")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{t.auth.passwordLabel}</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-10 text-sm bg-background"
                {...form.register("password")}
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-10 text-sm"
            >
              {loginMutation.isPending ? t.auth.submitting : t.auth.loginBtn}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <Link
              href="/register"
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t.auth.switchToRegister}
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center text-xs text-muted-foreground">
        © 2026 Hakaton
      </div>
    </div>
  );
}
