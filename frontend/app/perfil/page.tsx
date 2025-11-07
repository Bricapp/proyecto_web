"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchProfile } from "@/lib/api";

export default function ProfilePage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccessToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["profile", accessToken],
    queryFn: () => fetchProfile(accessToken ?? ""),
    enabled: Boolean(accessToken)
  });

  if (!accessToken) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="rounded-lg bg-white p-8 shadow">
          <p className="text-lg font-medium text-slate-900">
            No encontramos un token de acceso. Por favor, inicia sesión nuevamente.
          </p>
          <Link className="mt-6 inline-block font-semibold text-slate-900 underline" href="/login">
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      <section className="rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Mi perfil</h1>
        {isLoading && <p className="text-slate-700">Cargando...</p>}
        {isError && (
          <p className="text-red-600">{error instanceof Error ? error.message : "Error inesperado"}</p>
        )}
        {data && (
          <dl className="space-y-3 text-slate-800">
            <div>
              <dt className="text-sm font-medium text-slate-500">Usuario</dt>
              <dd className="text-lg font-semibold">{data.username}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Nombre</dt>
              <dd className="text-lg">{data.first_name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Apellidos</dt>
              <dd className="text-lg">{data.last_name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Correo electrónico</dt>
              <dd className="text-lg">{data.email || "-"}</dd>
            </div>
          </dl>
        )}
        <div className="mt-8 flex items-center justify-between">
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
              }
              setAccessToken(null);
            }}
            type="button"
          >
            Cerrar sesión
          </button>
          <Link className="text-sm font-semibold text-slate-900 underline" href="/login">
            Cambiar de usuario
          </Link>
        </div>
      </section>
    </main>
  );
}
