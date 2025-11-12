import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Finnova Finanzas",
  description:
    "Panel financiero de Finnova para gestionar presupuestos, gastos, ingresos y reportes en tiempo real.",
  icons: {
    icon: "/favicon.svg"
  }
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
