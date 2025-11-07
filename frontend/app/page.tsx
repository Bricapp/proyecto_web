"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LoginForm } from "@/components/forms/login-form";

const features = [
  {
    title: "Seguimiento inteligente",
    description: "Visualiza tu avance en tiempo real con paneles intuitivos y alertas automáticas.",
    icon: "📊"
  },
  {
    title: "Colaboración segura",
    description: "Comparte información con tu equipo de forma protegida y con control total.",
    icon: "🔒"
  },
  {
    title: "Respuestas inmediatas",
    description: "Automatiza tareas rutinarias y recibe notificaciones cuando sea necesario actuar.",
    icon: "⚡"
  }
];

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute -right-20 top-36 h-64 w-64 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-20 md:flex-row md:items-center md:justify-between md:gap-12">
        <section
          className={`max-w-xl space-y-8 text-center transition-all duration-1000 md:text-left ${
            isMounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-slate-100/80 backdrop-blur">
            <span className="h-2 w-2 animate-glow-pulse rounded-full bg-emerald-300" />
            Plataforma renovada 2024
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Gestiona tu información con una experiencia moderna y ágil
            </h1>
            <p className="text-base text-slate-200/80 md:text-lg">
              Centraliza todo tu trabajo en un solo lugar. Visualiza métricas clave, automatiza procesos y mantén la comunicación fluida con tu equipo en un entorno seguro.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link
              className="group relative overflow-hidden rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
              href="/login"
            >
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500 opacity-0 transition group-hover:opacity-100" />
              Empieza ahora
            </Link>
            <a
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              href="#features"
            >
              Descubre más
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left text-xs text-slate-300/80 sm:text-sm md:max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-emerald-500/10">
              <p className="font-semibold text-white">Disponibilidad 99.9%</p>
              <p>Infraestructura confiable siempre lista para tu equipo.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-sky-500/10">
              <p className="font-semibold text-white">Soporte inmediato</p>
              <p>Respuesta prioritaria con especialistas en minutos.</p>
            </div>
          </div>
        </section>

        <section
          className={`relative w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-1000 md:mt-0 ${
            isMounted ? "translate-y-0 opacity-100 delay-150" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="pointer-events-none absolute -top-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 right-1/2 h-36 w-36 translate-x-1/2 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="relative space-y-6">
            <header className="space-y-2 text-center md:text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-200/80">Acceso seguro</p>
              <h2 className="text-2xl font-semibold">Inicia sesión en segundos</h2>
              <p className="text-sm text-slate-200/70">
                Ingresa tus credenciales para continuar con tus proyectos. Todos los datos son cifrados en tránsito.
              </p>
            </header>
            <LoginForm variant="dark" />
            <p className="text-center text-xs text-slate-200/70 md:text-left">
              ¿No tienes una cuenta? <span className="font-semibold text-emerald-300">Solicítala con tu administrador.</span>
            </p>
          </div>
        </section>
      </div>

      <section id="features" className="mx-auto mb-24 w-full max-w-5xl px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur transition-all duration-700 ${
                isMounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: `${250 + index * 120}ms` }}
            >
              <div className="absolute -right-6 top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl transition duration-1000 group-hover:scale-125" />
              <div className="relative space-y-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-slate-200/80">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
