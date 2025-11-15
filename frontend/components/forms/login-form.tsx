"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/auth/auth-context";

const schema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria")
});

type FormValues = z.infer<typeof schema>;

type LoginFormProps = {
  variant?: "light" | "dark";
};

export function LoginForm({ variant = "light" }: LoginFormProps) {
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      try {
        await login(values);
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error(
            "No se pudo establecer conexión con el servidor. Intenta nuevamente en unos segundos."
          );
        }
        throw error;
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        setFormError(
          error.message.trim().length > 0
            ? error.message
            : "Algo no salió como esperábamos. Intenta nuevamente."
        );
      } else {
        setFormError("Error inesperado");
      }
    }
  });

  const onSubmit = (values: FormValues) => {
    setFormError(null);
    mutation.mutate(values);
  };

  const isDark = variant === "dark";

  const fieldStyles = useMemo(
    () =>
      clsx(
        "block w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2",
        isDark
          ? "border-white/20 bg-white/10 text-white placeholder:text-slate-200/70 focus:border-emerald-300 focus:ring-emerald-300/40"
          : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-900/60 focus:ring-slate-900/20"
      ),
    [isDark]
  );

  const labelStyles = useMemo(
    () =>
      clsx(
        "mb-1 block text-sm font-medium",
        isDark ? "text-slate-100" : "text-slate-700"
      ),
    [isDark]
  );

  const errorTextStyles = useMemo(
    () =>
      clsx(
        "mt-1 text-sm",
        isDark ? "text-rose-200" : "text-red-600"
      ),
    [isDark]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label className={labelStyles} htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={fieldStyles}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email", { onChange: () => setFormError(null) })}
        />
        {errors.email && (
          <p id="email-error" className={errorTextStyles} role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className={labelStyles} htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={fieldStyles}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password", { onChange: () => setFormError(null) })}
        />
        {errors.password && (
          <p id="password-error" className={errorTextStyles} role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {formError && (
        <div
          className={clsx(
            "flex items-start gap-3 rounded-xl border px-3 py-3 text-sm shadow-sm",
            isDark
              ? "border-rose-300/40 bg-rose-500/10 text-rose-100"
              : "border-red-200 bg-red-50 text-red-700"
          )}
          role="alert"
          aria-live="assertive"
        >
          <svg
            aria-hidden
            className="mt-0.5 h-5 w-5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-2 8a1 1 0 102 0 1 1 0 00-2 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>{formError}</span>
        </div>
      )}

      <button
        type="submit"
        className={clsx(
          "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isDark
            ? "bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500 text-slate-900 focus-visible:ring-emerald-200/80 focus-visible:ring-offset-slate-950 disabled:from-slate-500 disabled:via-slate-500 disabled:to-slate-500"
            : "bg-slate-900 text-white focus-visible:ring-slate-400/80 focus-visible:ring-offset-white disabled:bg-slate-400"
        )}
        disabled={mutation.isPending}
      >
        {mutation.isPending && (
          <svg
            aria-hidden
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className={isDark ? "stroke-slate-900/60" : "stroke-white/60"}
              cx="12"
              cy="12"
              r="9"
              strokeWidth="4"
            />
            <path
              className={isDark ? "stroke-slate-900" : "stroke-white"}
              d="M21 12a9 9 0 00-9-9"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}
        <span>{mutation.isPending ? "Ingresando..." : "Ingresar"}</span>
      </button>
    </form>
  );
}
