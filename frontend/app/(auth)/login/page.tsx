"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { FinovaLogo } from "@/components/FinovaLogo";
import { useAuth } from "@/components/auth/auth-context";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { LoginForm } from "@/components/forms/login-form";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const features = [
  {
    title: "Presupuestos inteligentes",
    description: "Configura límites personalizados y recibe alertas en tiempo real.",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          d="M4 6h16M4 10h16M4 14h10M4 18h6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    title: "Visualizaciones claras",
    description: "Analiza tus gastos, ahorros y metas con gráficos dinámicos.",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          d="M4 19V5M9 19V11M14 19V7M19 19V3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    title: "Decisiones seguras",
    description: "Recibe recomendaciones basadas en datos para impulsar tu crecimiento.",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          d="M12 6v6l3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3a9 9 0 109 9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
];

export default function LoginPage() {
  const router = useRouter();
  const { accessToken, isLoading, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (!isLoading && accessToken) {
      router.replace("/dashboard");
    }
  }, [accessToken, isLoading, router]);

  return (
    <main
      className={`${poppins.className} relative min-h-screen overflow-hidden bg-[#0F172A]`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18)_0%,_rgba(15,23,42,0.92)_55%,_rgba(2,6,23,1)_100%)]" />
      <div className="absolute -left-40 top-36 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl" aria-hidden />
      <div className="absolute bottom-[-6rem] right-[-4rem] h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />
      <div className="absolute -right-10 top-20 hidden h-72 w-72 rotate-12 rounded-full border border-emerald-400/20 opacity-60 blur-2xl lg:block" aria-hidden />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 lg:px-12">
        <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <FinovaLogo />
          <span className="text-sm font-medium text-emerald-100/80">
            Plataforma integral de gestión financiera
          </span>
        </header>

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-8 text-slate-100">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Domina tus finanzas con herramientas inteligentes
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Controla gastos, automatiza presupuestos y alcanza tus metas financieras
                con visualizaciones claras y asesoría basada en datos.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur transition duration-500 hover:border-emerald-300/60 hover:shadow-emerald-400/25">
              <p className="text-xl font-semibold text-emerald-200">
                “Tu dinero, bajo control. Siempre.”
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Finova te acompaña con alertas inteligentes y paneles personalizables para
                que tomes decisiones con confianza.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-500 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-emerald-400/10"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-200 transition group-hover:bg-emerald-400/30 group-hover:text-emerald-50">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-200/80">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute inset-0 -left-6 hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent blur-3xl lg:block"
              aria-hidden
            />
            <div className="relative rounded-3xl bg-white/95 p-8 shadow-2xl shadow-emerald-500/10 transition duration-500 hover:-translate-y-1 hover:shadow-emerald-500/25 md:p-10">
              <div className="mb-8 flex items-center justify-between">
                <FinovaLogo variant="dark" />
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Acceso seguro
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">Iniciar sesión</h2>
                <p className="text-sm text-slate-500">
                  Ingresa con tus credenciales para seguir impulsando tu crecimiento financiero.
                </p>
              </div>
              <div className="mt-8 space-y-6">
                <GoogleAuthButton
                  onCredential={loginWithGoogle}
                  buttonType="signin_with"
                />
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span>o ingresa con tu correo</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <LoginForm />
                <div className="text-center text-sm">
                  <Link className="font-semibold text-emerald-600 hover:text-emerald-500" href="/recuperar-clave">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
              <p className="mt-6 text-center text-xs text-slate-400">
                ¿Aún no eres parte de Finova?{' '}
                <Link className="font-semibold text-emerald-300 hover:text-emerald-200" href="/registro">
                  Crea tu cuenta gratis
                </Link>{' '}
                y comienza hoy mismo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
