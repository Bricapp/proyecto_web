"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FinovaLogo } from "@/components/FinovaLogo";

const navItems = [
  {
    label: "Resumen",
    href: "/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
        <path d="M4 12h4v8H4zM10 4h4v16h-4zM16 9h4v11h-4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: "Gastos",
    href: "/dashboard/gastos",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
        <path
          d="M6 18L18 6M9 6h9v9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    label: "Ingresos",
    href: "/dashboard/ingresos",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: "Presupuesto",
    href: "/dashboard/presupuesto",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: "Reportes",
    href: "/dashboard/reportes",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
        <path
          d="M5 3h4l2 3h8a1 1 0 011 1v11a2 2 0 01-2 2H6a2 2 0 01-2-2V4a1 1 0 011-1z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    label: "Perfil",
    href: "/dashboard/perfil",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
        <path
          d="M12 12a4 4 0 100-8 4 4 0 000 8zM6 20a6 6 0 0112 0"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    label: "Configuración",
    href: "/dashboard/configuracion",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
        <path
          d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.4 15a1.65 1.65 0 01.33 1.82l-.06.12a2 2 0 01-1.73 1h-1.09a6.94 6.94 0 01-1.22 1.22v1.09a2 2 0 01-1 1.73l-.12.06a1.65 1.65 0 01-1.82-.33l-.77-.77a6.93 6.93 0 01-1.72 0l-.77.77a1.65 1.65 0 01-1.82.33l-.12-.06a2 2 0 01-1-1.73v-1.09a6.94 6.94 0 01-1.22-1.22H5.06a2 2 0 01-1.73-1l-.06-.12a1.65 1.65 0 01.33-1.82l.77-.77a6.93 6.93 0 010-1.72l-.77-.77a1.65 1.65 0 01-.33-1.82l.06-.12a2 2 0 011.73-1h1.09c.36-.46.77-.87 1.22-1.22V5.06a2 2 0 011-1.73l.12-.06a1.65 1.65 0 011.82.33l.77.77a6.93 6.93 0 011.72 0l.77-.77a1.65 1.65 0 011.82-.33l.12.06a2 2 0 011 1.73v1.09c.46.36.87.77 1.22 1.22h1.09a2 2 0 011.73 1l.06.12a1.65 1.65 0 01-.33 1.82l-.77.77a6.93 6.93 0 010 1.72z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-6 border-r border-white/10 bg-slate-950 px-6 py-6 text-slate-200 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between">
          <FinovaLogo />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-200 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:hidden"
            aria-label="Cerrar navegación"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors",
                  isActive
                    ? "bg-emerald-500/20 text-emerald-100 shadow-inner shadow-emerald-500/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
                onClick={onClose}
              >
                <span className="text-emerald-300 transition group-hover:text-emerald-200">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          <p className="font-semibold text-white">Consejo rápido</p>
          <p className="mt-1">
            Revisa tus reportes cada semana para anticipar desvíos y ajustar tu presupuesto a tiempo.
          </p>
        </div>
      </aside>
    </>
  );
}
