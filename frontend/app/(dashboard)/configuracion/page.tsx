"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/auth/auth-context";
import { changePassword } from "@/lib/api";

const schema = z
  .object({
    password_actual: z.string().min(6, "Ingresa tu contraseña actual"),
    password_nuevo: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    password_confirmacion: z.string().min(8, "Confirma la nueva contraseña")
  })
  .refine((values) => values.password_nuevo === values.password_confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmacion"]
  });

type FormValues = z.infer<typeof schema>;

export default function ConfiguracionPage() {
  const { user, accessToken, refreshProfile } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      changePassword(accessToken ?? "", {
        password_actual: values.password_actual,
        password_nuevo: values.password_nuevo
      }),
    onSuccess: async () => {
      reset();
      await refreshProfile();
    }
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Perfil de usuario</h1>
        <p className="mt-1 text-sm text-slate-500">
          Actualiza tu información básica y revisa los datos asociados a tu cuenta.
        </p>

        <dl className="mt-6 space-y-4 text-sm text-slate-600">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Nombre completo</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {user?.first_name || user?.last_name
                ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
                : "Sin información"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Usuario</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">{user?.username}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Correo electrónico</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">{user?.email || "No registrado"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Cambiar contraseña</h2>
        <p className="mt-1 text-sm text-slate-500">
          Por seguridad, utiliza una contraseña robusta que combine letras, números y símbolos.
        </p>

        {mutation.isSuccess && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Contraseña actualizada correctamente.
          </div>
        )}

        {mutation.isError && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "No se pudo actualizar la contraseña. Intenta nuevamente."}
          </div>
        )}

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-6 space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-slate-700" htmlFor="password_actual">
              Contraseña actual
            </label>
            <input
              id="password_actual"
              type="password"
              autoComplete="current-password"
              className={clsx(
                "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
                errors.password_actual && "border-rose-300"
              )}
              {...register("password_actual")}
            />
            {errors.password_actual && (
              <p className="mt-1 text-rose-600">{errors.password_actual.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700" htmlFor="password_nuevo">
              Nueva contraseña
            </label>
            <input
              id="password_nuevo"
              type="password"
              autoComplete="new-password"
              className={clsx(
                "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
                errors.password_nuevo && "border-rose-300"
              )}
              {...register("password_nuevo")}
            />
            {errors.password_nuevo && <p className="mt-1 text-rose-600">{errors.password_nuevo.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700" htmlFor="password_confirmacion">
              Confirmar nueva contraseña
            </label>
            <input
              id="password_confirmacion"
              type="password"
              autoComplete="new-password"
              className={clsx(
                "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
                errors.password_confirmacion && "border-rose-300"
              )}
              {...register("password_confirmacion")}
            />
            {errors.password_confirmacion && (
              <p className="mt-1 text-rose-600">{errors.password_confirmacion.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-400 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400"
          >
            {mutation.isPending && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            Guardar cambios
          </button>
        </form>
      </section>
    </div>
  );
}
