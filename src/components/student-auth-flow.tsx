"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGoogleLogin } from "@react-oauth/google";
import {
  Eye,
  EyeOff,
  Phone,
  KeyRound,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/use-app-store";
import { useUserAuthStore } from "@/store/use-user-auth-store";
import { translations } from "@/lib/i18n";
import {
  useUserLoginMutation,
  useUserRegisterMutation,
  useGoogleAuthMutation,
  useCompleteProfileMutation,
} from "@/hooks/use-public-overview";

export type AuthStep = "login" | "register" | "complete-profile";

const PIN_REGEX = /^\d{6}$/;
const PHONE_REGEX = /^\+?[0-9]{9,15}$/;

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function StudentAuthFlow({
  initialStep = "login",
  onSuccess,
}: {
  initialStep?: AuthStep;
  onSuccess?: () => void;
}) {
  const { lang } = useAppStore();
  const t = translations[lang].auth;
  const { user, token, setUserAuth } = useUserAuthStore();

  const [step, setStep] = React.useState<AuthStep>(initialStep);
  const [showPin, setShowPin] = React.useState(false);

  React.useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const loginMutation = useUserLoginMutation();
  const registerMutation = useUserRegisterMutation();
  const googleMutation = useGoogleAuthMutation();
  const completeProfileMutation = useCompleteProfileMutation();

  // 1. Login Form (Phone + 6-digit PIN)
  const loginSchema = React.useMemo(
    () =>
      z.object({
        phone: z.string().regex(PHONE_REGEX, t.phoneError),
        pin: z.string().regex(PIN_REGEX, t.pinError),
      }),
    [t]
  );

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "+998", pin: "" },
  });

  // 2. Register Form (First name, Last name, Phone, 6-digit PIN)
  const registerSchema = React.useMemo(
    () =>
      z.object({
        first_name: z.string().min(2, t.nameError),
        last_name: z.string().min(2, t.nameError),
        phone: z.string().regex(PHONE_REGEX, t.phoneError),
        pin: z.string().regex(PIN_REGEX, t.pinError),
      }),
    [t]
  );

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "+998",
      pin: "",
    },
  });

  // 3. Complete Profile Form (after Google Auth: Phone + 6-digit PIN + prefilled Google First/Last name)
  const completeSchema = React.useMemo(
    () =>
      z.object({
        first_name: z.string().min(2, t.nameError),
        last_name: z.string().min(2, t.nameError),
        phone: z.string().regex(PHONE_REGEX, t.phoneError),
        pin: z.string().regex(PIN_REGEX, t.pinError),
      }),
    [t]
  );

  const completeForm = useForm<z.infer<typeof completeSchema>>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "+998",
      pin: "",
    },
  });

  React.useEffect(() => {
    if (user && step === "complete-profile") {
      completeForm.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "+998",
        pin: "",
      });
    }
  }, [user, step, completeForm]);

  // Real Google OAuth Account Chooser Popup
  const triggerGooglePopup = useGoogleLogin({
    prompt: "select_account",
    onSuccess: async (tokenResponse) => {
      try {
        const res = await googleMutation.mutateAsync({
          access_token: tokenResponse.access_token,
        });

        setUserAuth(res.user, res.token, res.needsProfileCompletion);

        if (res.needsProfileCompletion) {
          completeForm.reset({
            first_name: res.user.first_name || "",
            last_name: res.user.last_name || "",
            phone: res.user.phone || "+998",
            pin: "",
          });
          setStep("complete-profile");
          toast.info(t.googleNeedsPhone);
        } else {
          toast.success(t.loginSuccess);
          onSuccess?.();
        }
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Google orqali kirishda xatolik"
        );
      }
    },
    onError: () => {
      toast.error("Google oynasi yopildi yoki xatolik yuz berdi");
    },
  });

  const handleGoogleButtonClick = () => {
    triggerGooglePopup();
  };

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      const res = await loginMutation.mutateAsync(values);
      setUserAuth(res.user, res.token, res.needsProfileCompletion);
      if (res.needsProfileCompletion) {
        setStep("complete-profile");
        toast.info(t.googleNeedsPhone);
      } else {
        toast.success(t.loginSuccess);
        onSuccess?.();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login error");
    }
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    try {
      const res = await registerMutation.mutateAsync(values);
      setUserAuth(res.user, res.token, false);
      toast.success(t.registerSuccess);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Register error");
    }
  };

  const handleCompleteProfile = async (
    values: z.infer<typeof completeSchema>
  ) => {
    if (!token) return;
    try {
      const res = await completeProfileMutation.mutateAsync({
        token,
        payload: values,
      });
      setUserAuth(res.user, res.token, false);
      toast.success(t.registerSuccess);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error saving profile");
    }
  };

  const handlePinChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (val: string) => void
  ) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(digitsOnly);
  };

  if (step === "complete-profile") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border bg-secondary/40 p-3.5 space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-foreground" />
            <span className="text-sm font-semibold">{t.completeTitle}</span>
          </div>
          {user?.email && (
            <Badge variant="outline" className="text-xs font-mono">
              Google: {user.email}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground pt-1">{t.completeDesc}</p>
        </div>

        <form
          onSubmit={completeForm.handleSubmit(handleCompleteProfile)}
          className="space-y-3.5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">{t.firstNameLabel}</Label>
              <Input
                placeholder={t.firstNamePlaceholder}
                className="h-10 text-sm bg-background"
                {...completeForm.register("first_name")}
              />
              {completeForm.formState.errors.first_name && (
                <p className="text-xs text-destructive">
                  {completeForm.formState.errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{t.lastNameLabel}</Label>
              <Input
                placeholder={t.lastNamePlaceholder}
                className="h-10 text-sm bg-background"
                {...completeForm.register("last_name")}
              />
              {completeForm.formState.errors.last_name && (
                <p className="text-xs text-destructive">
                  {completeForm.formState.errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">{t.phoneLabel} *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.phonePlaceholder}
                className="h-10 pl-9 text-sm bg-background font-mono"
                {...completeForm.register("phone")}
              />
            </div>
            {completeForm.formState.errors.phone && (
              <p className="text-xs text-destructive">
                {completeForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">{t.pinLabel} *</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={completeForm.watch("pin")}
                onChange={(e) =>
                  handlePinChange(e, (val) =>
                    completeForm.setValue("pin", val, { shouldValidate: true })
                  )
                }
                className="h-10 pl-9 pr-10 text-sm bg-background font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPin((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {completeForm.formState.errors.pin && (
              <p className="text-xs text-destructive">
                {completeForm.formState.errors.pin.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 text-sm"
            disabled={completeProfileMutation.isPending}
          >
            {completeProfileMutation.isPending ? t.submitting : t.completeBtn}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="space-y-4">
        <form
          onSubmit={loginForm.handleSubmit(handleLogin)}
          className="space-y-3.5"
        >
          <div className="space-y-1.5">
            <Label className="text-sm">{t.phoneLabel}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.phonePlaceholder}
                className="h-10 pl-9 text-sm bg-background font-mono"
                {...loginForm.register("phone")}
              />
            </div>
            {loginForm.formState.errors.phone && (
              <p className="text-xs text-destructive">
                {loginForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">{t.pinLabel}</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={loginForm.watch("pin")}
                onChange={(e) =>
                  handlePinChange(e, (val) =>
                    loginForm.setValue("pin", val, { shouldValidate: true })
                  )
                }
                className="h-10 pl-9 pr-10 text-sm bg-background font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPin((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {loginForm.formState.errors.pin && (
              <p className="text-xs text-destructive">
                {loginForm.formState.errors.pin.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 text-sm"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? t.submitting : t.loginBtn}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="relative flex items-center justify-center py-1">
          <div className="border-t w-full" />
          <span className="bg-card px-2.5 text-xs text-muted-foreground uppercase">
            {t.orDivider}
          </span>
          <div className="border-t w-full" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={googleMutation.isPending}
          className="w-full h-10 text-sm bg-background"
          onClick={handleGoogleButtonClick}
        >
          <GoogleIcon />
          {googleMutation.isPending ? t.submitting : t.googleBtn}
        </Button>

        <div className="text-center text-sm text-muted-foreground pt-2 border-t">
          {t.noAccount}{" "}
          <button
            type="button"
            onClick={() => setStep("register")}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {t.switchToRegister}
          </button>
        </div>
      </div>
    );
  }

  // Register Step
  return (
    <div className="space-y-4">
      <form
        onSubmit={registerForm.handleSubmit(handleRegister)}
        className="space-y-3.5"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm">{t.firstNameLabel} *</Label>
            <Input
              placeholder={t.firstNamePlaceholder}
              className="h-10 text-sm bg-background"
              {...registerForm.register("first_name")}
            />
            {registerForm.formState.errors.first_name && (
              <p className="text-xs text-destructive">
                {registerForm.formState.errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">{t.lastNameLabel} *</Label>
            <Input
              placeholder={t.lastNamePlaceholder}
              className="h-10 text-sm bg-background"
              {...registerForm.register("last_name")}
            />
            {registerForm.formState.errors.last_name && (
              <p className="text-xs text-destructive">
                {registerForm.formState.errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">{t.phoneLabel} *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.phonePlaceholder}
              className="h-10 pl-9 text-sm bg-background font-mono"
              {...registerForm.register("phone")}
            />
          </div>
          {registerForm.formState.errors.phone && (
            <p className="text-xs text-destructive">
              {registerForm.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">{t.pinLabel} *</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={registerForm.watch("pin")}
              onChange={(e) =>
                handlePinChange(e, (val) =>
                  registerForm.setValue("pin", val, { shouldValidate: true })
                )
              }
              className="h-10 pl-9 pr-10 text-sm bg-background font-mono tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPin((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPin ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {registerForm.formState.errors.pin && (
            <p className="text-xs text-destructive">
              {registerForm.formState.errors.pin.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-10 text-sm"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? t.submitting : t.registerBtn}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <div className="relative flex items-center justify-center py-1">
        <div className="border-t w-full" />
        <span className="bg-card px-2.5 text-xs text-muted-foreground uppercase">
          {t.orDivider}
        </span>
        <div className="border-t w-full" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={googleMutation.isPending}
        className="w-full h-10 text-sm bg-background"
        onClick={handleGoogleButtonClick}
      >
        <GoogleIcon />
        {googleMutation.isPending ? t.submitting : t.googleBtn}
      </Button>

      <div className="text-center text-sm text-muted-foreground pt-2 border-t">
        {t.hasAccount}{" "}
        <button
          type="button"
          onClick={() => setStep("login")}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {t.switchToLogin}
        </button>
      </div>
    </div>
  );
}
