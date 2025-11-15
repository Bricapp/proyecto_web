"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-context";
import { BudgetForm, BudgetFormValues } from "@/components/forms/BudgetForm";
import {
  Partida,
  createPartida,
  deletePartida,
  fetchPartidas,
  updatePartida
} from "@/lib/api";

export default function PresupuestoPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partida | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const { data: partidas = [], isLoading } = useQuery({
    queryKey: ["partidas", accessToken],
    queryFn: () => fetchPartidas(accessToken ?? ""),
    enabled: Boolean(accessToken)
  });

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ["partidas"] });
    queryClient.invalidateQueries({ queryKey: ["resumen"] });
    queryClient.invalidateQueries({ queryKey: ["gastos"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: BudgetFormValues) =>
      createPartida(accessToken ?? "", {
        nombre: values.nombre,
        tipo: values.tipo,
        monto_asignado: values.monto_asignado
      }),
    onSuccess: () => {
      setFeedback("Partida creada correctamente.");
      setFormKey((key) => key + 1);
      invalidateData();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (values: BudgetFormValues) =>
      updatePartida(accessToken ?? "", editing!.id, {
        nombre: values.nombre,
        tipo: values.tipo,
        monto_asignado: values.monto_asignado
      }),
    onSuccess: () => {
      setFeedback("Partida actualizada correctamente.");
      setEditing(null);
      setFormKey((key) => key + 1);
      invalidateData();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePartida(accessToken ?? "", id),
    onSuccess: () => {
      setFeedback("Partida eliminada correctamente.");
      invalidateData();
    }
  });

  const defaultValues: Partial<BudgetFormValues> | undefined = useMemo(() => {
    if (!editing) return undefined;
    return {
      nombre: editing.nombre,
      tipo: editing.tipo as "fijo" | "variable",
      monto_asignado: editing.monto_asignado
    };
  }, [editing]);

  const handleSubmit = async (values: BudgetFormValues) => {
    setFeedback(null);
    if (editing) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async (partida: Partida) => {
    if (!window.confirm(`¿Eliminar la partida ${partida.nombre}?`)) return;
    setFeedback(null);
    if (editing?.id === partida.id) {
      setEditing(null);
      setFormKey((key) => key + 1);
    }
    await deleteMutation.mutateAsync(partida.id);
  };

  const activeMutationError = createMutation.error || updateMutation.error || deleteMutation.error;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const currencyFormatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP"
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_1fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4">
          <h1 className="text-xl font-semibold text-slate-900">Gestionar partidas</h1>
          <p className="text-sm text-slate-500">
            Define los montos mensuales para cada categoría y controla cuánto queda disponible.
          </p>
        </header>

        {(createMutation.isSuccess || updateMutation.isSuccess || deleteMutation.isSuccess) && feedback && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </div>
        )}

        {activeMutationError && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {activeMutationError instanceof Error
              ? activeMutationError.message
              : "No se pudo completar la acción. Intenta nuevamente."}
          </div>
        )}

        <BudgetForm
          key={`${formKey}-${editing?.id ?? "nueva"}`}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={editing ? () => setEditing(null) : undefined}
          submitLabel={editing ? "Actualizar partida" : "Crear partida"}
          isSubmitting={isSubmitting}
        />
      </section>

      <section className="space-y-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-900">Partidas activas</h2>
          <p className="text-sm text-slate-500">
            Consulta el detalle de cada partida y ajusta tus presupuestos cuando sea necesario.
          </p>
        </header>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
        ) : partidas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500">
            Aún no has creado partidas. Define tus categorías para comenzar a presupuestar.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {partidas.map((partida) => {
              const porcentaje = partida.monto_asignado
                ? Math.min(120, Math.round((partida.gastado_mes / partida.monto_asignado) * 100))
                : 0;
              const disponible = partida.disponible_mes;
              return (
                <article
                  key={partida.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-200/40"
                >
                  <header className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{partida.nombre}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{partida.tipo === "fijo" ? "Gasto fijo" : "Gasto variable"}</p>
                    </div>
                    <span
                      className={clsx(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        disponible < 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                      )}
                    >
                      {disponible < 0 ? "Excedido" : "En control"}
                    </span>
                  </header>
                  <p className="mt-4 text-2xl font-semibold text-slate-900">
                    {currencyFormatter.format(partida.monto_asignado)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Gastado: {currencyFormatter.format(partida.gastado_mes)} ({Math.min(porcentaje, 999)}%)
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/70">
                    <div
                      className={clsx(
                        "h-full rounded-full",
                        disponible < 0 ? "bg-rose-500" : "bg-gradient-to-r from-emerald-400 via-sky-400 to-sky-500"
                      )}
                      style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Disponible: {currencyFormatter.format(disponible)}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(partida);
                        setFeedback(null);
                      }}
                      className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-emerald-400 hover:text-emerald-600"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(partida)}
                      className="rounded-full border border-rose-200 px-3 py-1 text-rose-600 transition hover:bg-rose-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
