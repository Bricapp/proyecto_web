"use client";

import Image from "next/image";
import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/auth/auth-context";

const schema = z.object({
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().optional(),
  phone: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, isLoading, accessToken, refreshProfile, updateProfile, logout } = useAuth();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      phone: user?.phone ?? ""
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        phone: user.phone ?? ""
      });
      setPreviewUrl(null);
      setSelectedPhoto(null);
      setRemovePhoto(false);
    }
  }, [user, reset]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!accessToken) return;
    refreshProfile(accessToken).catch((error) => {
      console.error(error);
      setStatus({ type: "error", message: "No pudimos cargar tu perfil. Intenta nuevamente." });
    });
  }, [accessToken, refreshProfile]);

  const avatarSource = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (user?.avatar_url) return user.avatar_url;
    return null;
  }, [previewUrl, user?.avatar_url]);

  const createdAt = useMemo(() => {
    if (!user?.created_at) return "-";
    try {
      return new Date(user.created_at).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return user.created_at;
    }
  }, [user?.created_at]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!accessToken) {
      setStatus({ type: "error", message: "Tu sesión expiró. Ingresa nuevamente." });
      return;
    }
    setStatus(null);
    try {
      await updateProfile({
        first_name: values.first_name.trim(),
        last_name: values.last_name?.trim(),
        phone: values.phone?.trim(),
        photo: removePhoto ? null : selectedPhoto,
        remove_photo: removePhoto
      });
      setStatus({ type: "success", message: "Actualizamos tu perfil correctamente." });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedPhoto(null);
      setPreviewUrl(null);
      setRemovePhoto(false);
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "No pudimos guardar los cambios. Intenta nuevamente.";
      setStatus({ type: "error", message });
    }
  };

  if (isLoading && !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-sm">
          <svg className="h-10 w-10 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4" opacity="0.2" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium text-slate-600">Cargando tu perfil...</p>
        </div>
      </main>
    );
  }

  if (!accessToken && !isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
        <div className="rounded-3xl bg-white p-10 shadow-xl">
          <p className="text-lg font-medium text-slate-900">
            Tu sesión expiró. Por favor, inicia sesión nuevamente para ver tu perfil.
          </p>
          <Link className="mt-6 inline-block font-semibold text-emerald-600 underline" href="/login">
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {avatarSource ? (
                <Image
                  alt={`Foto de ${user?.full_name ?? "usuario"}`}
                  src={avatarSource}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-500">
                  {user?.full_name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{user?.full_name ?? "Tu perfil"}</h1>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-400">Miembro desde {createdAt}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout({ redirect: true })}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Información personal</h2>
            <p className="text-sm text-slate-500">Actualiza tu nombre, teléfono y foto de perfil.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="first_name">
                Nombre
              </label>
              <input
                id="first_name"
                type="text"
                className={clsx(
                  "mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
                  errors.first_name && "border-rose-300 focus:border-rose-300 focus:ring-rose-200"
                )}
                placeholder="Tu nombre"
                {...register("first_name")}
              />
              {errors.first_name && <p className="mt-1 text-sm text-rose-500">{errors.first_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="last_name">
                Apellidos
              </label>
              <input
                id="last_name"
                type="text"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Tus apellidos"
                {...register("last_name")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="phone">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Opcional"
                {...register("phone")}
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="photo">
                Foto de perfil
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  Subir nueva foto
                </label>
                {(user?.avatar_url || previewUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRemovePhoto(true);
                      setPreviewUrl(null);
                      setSelectedPhoto(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Quitar foto
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">Formatos recomendados: JPG o PNG de hasta 2MB.</p>
            </div>

            {previewUrl && (
              <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-700">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                  <Image alt="Vista previa" src={previewUrl} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <p className="font-semibold">Vista previa</p>
                  <p>Se actualizará al guardar los cambios.</p>
                </div>
              </div>
            )}
          </div>

          {status && (
            <div
              className={clsx(
                "mt-6 rounded-xl border px-4 py-3 text-sm",
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              )}
            >
              {status.message}
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400"
            >
              {isSubmitting && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                  <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
              Guardar cambios
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Detalles de la cuenta</h2>
          <dl className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <dt className="font-medium text-slate-500">Correo registrado</dt>
              <dd className="font-semibold text-slate-900">{user?.email ?? "-"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-slate-500">Nombre de usuario</dt>
              <dd className="font-semibold text-slate-900">{user?.username ?? "-"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-slate-500">Teléfono</dt>
              <dd className="font-semibold text-slate-900">{user?.phone || "No registrado"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-slate-500">Cuenta creada</dt>
              <dd className="font-semibold text-slate-900">{createdAt}</dd>
            </div>
          </dl>
          <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
            Si conectaste tu cuenta con Google, mantendremos sincronizada tu información básica y usaremos la foto de tu perfil
            como respaldo.
          </div>
        </div>
      </section>
    </main>
  );
}
