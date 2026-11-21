import { Button } from "@/components/ui/button";

export default function PublicStudentHomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-minimal-grid" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_85%)]" />

      <header className="relative z-10 border-b bg-background/85 backdrop-blur-xs">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background text-xs font-bold">
              H
            </div>
            <span className="font-semibold tracking-tight text-sm">
              Hakaton
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Student Portal</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-xl text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            O&apos;quv va loyihalar platformasi
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Kurslar, topshiriqlar va natijalarni yagona minimal interfeysda
            kuzatib boring.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Button size="sm" className="h-8 text-xs">
              Darslarni ko&apos;rish
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-background"
            >
              Reyting
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
