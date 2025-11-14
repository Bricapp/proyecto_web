import Link from "next/link";

import { FinovaLogo } from "@/components/FinovaLogo";

const highlights = [
  {
    title: "Automatiza tus finanzas",
    description:
      "Conecta tus flujos de ingresos y gastos para visualizar tu salud financiera en tiempo real.",
  },
  {
    title: "Proyecciones inteligentes",
    description:
      "Modelos predictivos que te ayudan a anticipar escenarios y tomar decisiones con confianza.",
  },
  {
    title: "Alertas personalizadas",
    description:
      "Define umbrales críticos y recibe notificaciones oportunas para actuar antes de que sea tarde.",
  },
];

const benefits = [
  "Panel de control integral para tu equipo financiero",
  "Registro rápido de ingresos, gastos y partidas presupuestarias",
  "Reportes dinámicos con métricas accionables",
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18)_0%,_rgba(15,23,42,0.95)_55%,_rgb(2,6,23,1)_100%)]" />
      <div className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl" aria-hidden />
      <div className="absolute bottom-[-6rem] right-[-4rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/15 blur-3xl" aria-hidden />
      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 lg:px-12">
          <FinovaLogo />
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-4 py-2 text-slate-100 transition hover:border-emerald-400/80 hover:text-emerald-200"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500 px-4 py-2 text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:scale-[1.02]"
            >
              Registrarse
            </Link>
          </nav>
        </header>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-8 lg:flex-row lg:items-center lg:px-12">
          <div className="space-y-10 lg:w-1/2">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Finanzas empresariales
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Controla, proyecta y escala tus finanzas con Finova
              </h1>
              <p className="max-w-xl text-base text-slate-300 md:text-lg">
                Una plataforma moderna para administrar presupuestos, visualizar escenarios y alinear a tu equipo
                financiero con objetivos medibles. Toda la información crítica, siempre a tu alcance.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-200">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">
                    <svg
                      aria-hidden
                      className="h-3 w-3"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02]"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/login"
                className="flex flex-1 items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400/70 hover:text-emerald-200"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-emerald-500/20 backdrop-blur-lg lg:w-1/2">
            <div className="mb-6 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200">
                Inteligencia en acción
              </p>
              <h2 className="text-2xl font-semibold text-white">¿Qué podrás lograr con Finova?</h2>
              <p className="text-sm text-slate-300">
                Diseñada para equipos que necesitan visibilidad inmediata y colaboración segura.
              </p>
            </div>
            <div className="grid gap-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
                >
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-200">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mx-auto w-full max-w-6xl px-6 pb-10 text-xs text-slate-500 lg:px-12">
          © {new Date().getFullYear()} Finova. Finanzas inteligentes para equipos ambiciosos.
        </footer>
      </div>
    </main>
  );
}

