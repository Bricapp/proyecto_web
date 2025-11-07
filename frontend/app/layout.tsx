import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Proyecto Monorepo",
  description: "Frontend de autenticación con Next.js"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
