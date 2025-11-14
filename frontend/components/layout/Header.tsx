"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-context";

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

type HeaderProps = {
  onToggleSidebar: () => void;
};

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const initials = useMemo(() => {
    if (!user) return "FF";
    const names = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    if (names.length === 0) {
      return user.username.slice(0, 2).toUpperCase();
    }
    const parts = names.split(" ").filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user]);

  const now = new Date();
  const monthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:hidden"
            aria-label="Abrir menú de navegación"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">Finnova Finanzas</p>
            <p className="text-lg font-semibold text-slate-900">Panel ejecutivo</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 sm:flex">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
              <path d="M12 8v4l2 2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 3a9 9 0 109 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {monthLabel}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
                <path d="M4 12h16M4 12a8 8 0 018-8m8 8a8 8 0 01-8 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-slate-700">Salud financiera</p>
              <p className="text-[11px] text-emerald-500">Actualizada al día de hoy</p>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-blue-500 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="hidden text-sm sm:block">
                <p className="font-semibold text-slate-900">{user?.first_name || user?.username}</p>
                <p className="text-xs text-slate-500">{user?.email || "Sin correo"}</p>
              </div>
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              className={clsx(
                "absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-lg",
                menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-700 transition hover:bg-emerald-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
                  <path d="M5 7h14M12 7v10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Perfil
              </Link>
              <Link
                href="/dashboard/configuracion"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-700 transition hover:bg-emerald-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
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
                Configuración
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-rose-600 transition hover:bg-rose-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
                  <path d="M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 8l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 5h2a2 2 0 012 2v10a2 2 0 01-2 2h-2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
