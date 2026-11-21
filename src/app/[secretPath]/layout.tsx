import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ADMIN_SECRET_PATH } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tizim Boshqaruv Markazi",
  robots: {
    index: false,
    follow: false,
  },
};

async function SecretPathGuard({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ secretPath: string }>;
}) {
  const { secretPath } = await params;

  if (secretPath !== ADMIN_SECRET_PATH) {
    notFound();
  }

  return <>{children}</>;
}

export default function SecretAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ secretPath: string }>;
}) {
  return (
    <div className="min-h-screen bg-background">
      <React.Suspense fallback={null}>
        <SecretPathGuard params={params}>{children}</SecretPathGuard>
      </React.Suspense>
    </div>
  );
}
