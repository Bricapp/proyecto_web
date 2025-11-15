"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FinovaLogo } from "@/components/FinovaLogo";
import { useAuth } from "@/components/auth/auth-context";

const schema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string()
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

type Params = {
  uid: string;
  token: string;
};

export default function PasswordResetConfirmPage() {
  const params = useParams<Params>();
  const { confirmPasswordReset } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    if (!params?.uid || !params?.token) {
      setError("El enlace de recuperación no es válido.");
      return;
    }
    setMessage(null);
    setError(null);
    try {
      const response = await confirmPasswordReset({
        uid: params.uid,
        token: params.token,
        password: values.password
      });
      setMessage(response.detail);
    } catch (err) {
      const detail = err instanceof Error && err.message.trim().length > 0 ? err.message : null;
      setError(detail ?? "No pudimos actualizar tu contraseña. Intenta nuevamente.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-50">
      <div className="w-full max-w-lg rounded-3xl bg-white/10 p-8 shadow-2xl shadow-emerald-500/20 backdrop-blur">
        <div className="mb-8 flex items-center justify-between">
          <FinovaLogo />
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
            Crear nueva contraseña
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Restablece tu contraseña</h1>
          <p className="text-sm text-slate-200/80">
            Crea una contraseña segura para continuar usando la plataforma con normalidad.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor="password">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              className={clsx(
                "mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-200/60 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60",
                errors.password && "border-rose-300/60 focus:border-rose-300 focus:ring-rose-200/50"
              )}
              placeholder="Ingresa una contraseña segura"
              {...register("password")}
            />
            {errors.password && <p className="mt-2 text-sm text-rose-200">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor="confirmPassword">
              Confirma tu contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={clsx(
                "mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-200/60 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60",
                errors.confirmPassword && "border-rose-300/60 focus:border-rose-300 focus:ring-rose-200/50"
              )}
              placeholder="Repite tu contraseña"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-rose-200">{errors.confirmPassword.message}</p>
            )}
          </div>

          {message && (
            <div className="rounded-xl border border-emerald-200/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:from-emerald-500 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:from-slate-500 disabled:via-slate-500 disabled:to-slate-500"
          >
            {isSubmitting && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            Guardar nueva contraseña
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-200/80">
          <Link className="font-semibold text-emerald-200 hover:text-emerald-100" href="/login">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
