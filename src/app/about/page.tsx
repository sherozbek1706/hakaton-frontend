"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  UserCheck,
  Sparkles,
  Trophy,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/use-app-store";
import { translations } from "@/lib/i18n";

export default function AboutProjectPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useAppStore();
  const t = translations[lang];
  const p = t.aboutPage;

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground bg-minimal-grid">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,transparent_35%,var(--background)_100%)]" />

      {/* Minimal Header */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
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
              {p.backHome}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Top Hero / Author Intro */}
        <section className="rounded-2xl border bg-card/95 p-7 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 py-1 text-xs font-mono uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{p.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            {p.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {p.introLead}
          </p>

          {/* Author Card */}
          <div className="flex items-center gap-4 rounded-xl border bg-secondary/30 p-4 sm:p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background font-bold text-lg">
              SB
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-semibold">
                  {p.authorName}
                </h2>
                <Badge variant="outline" className="text-xs">
                  <UserCheck className="mr-1 h-3 w-3" />
                  Founder
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {p.authorRole}
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Story Section */}
        <section className="rounded-2xl border bg-card/95 p-7 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-5 w-5 text-foreground" />
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {p.storyTitle}
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {p.storyParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="rounded-xl border-l-4 border-foreground bg-secondary/30 p-5 text-sm sm:text-base font-medium leading-relaxed">
            {p.quoteBox}
          </div>
        </section>

        {/* 4 Core Pillars Grid */}
        <section className="space-y-5">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 text-foreground" />
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {p.pillarsTitle}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {p.pillars.map((pillar) => (
              <div
                key={pillar.num}
                className="rounded-xl border bg-card/95 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs space-y-2.5"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border font-mono text-xs font-semibold">
                  {pillar.num}
                </span>
                <h3 className="text-base sm:text-lg font-semibold">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-2xl border bg-card/95 p-7 sm:p-9 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-semibold">{p.ctaTitle}</h3>
            <p className="text-sm text-muted-foreground">{p.ctaDesc}</p>
          </div>
          <Link href="/#hackathons">
            <Button className="h-10 px-5 text-sm font-medium">
              {p.ctaBtn}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-background/85 backdrop-blur-xs">
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl px-4 sm:px-6 py-6 text-sm text-muted-foreground">
          <span>{t.footer.text}</span>
          <span>© 2026 Hakaton. {t.footer.rights}</span>
        </div>
      </footer>
    </div>
  );
}
