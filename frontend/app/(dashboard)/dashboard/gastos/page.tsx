"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-context";
import { ExpenseForm, ExpenseFormValues } from "@/components/forms/ExpenseForm";
import { TransactionRow, TransactionTable } from "@/components/transactions/TransactionTable";
import {
  Gasto,
  Partida,
  createGasto,
  deleteGasto,
  fetchGastos,
  fetchPartidas,
  updateGasto
} from "@/lib/api";

export default function GastosPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const { data: partidas = [], isLoading: isLoadingPartidas } = useQuery({
    queryKey: ["partidas", accessToken],
    queryFn: () => fetchPartidas(accessToken ?? ""),
    enabled: Boolean(accessToken)
  });

  const { data: gastos = [], isLoading: isLoadingGastos } = useQuery({
    queryKey: ["gastos", accessToken],
    queryFn: () => fetchGastos(accessToken ?? ""),
    enabled: Boolean(accessToken)
  });

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ["gastos"] });
    queryClient.invalidateQueries({ queryKey: ["resumen"] });
    queryClient.invalidateQueries({ queryKey: ["partidas"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: ExpenseFormValues) =>
      createGasto(accessToken ?? "", {
        partida: values.partida ?? null,
        monto: values.monto,
        fecha: values.fecha,
        tipo: values.tipo,
        categoria: values.categoria?.trim() || null,
        observacion: values.observacion?.trim() || null
      }),
    onSuccess: () => {
      setFeedback("Gasto registrado correctamente.");
      setFormKey((key) => key + 1);
      invalidateData();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (values: ExpenseFormValues) =>
      updateGasto(accessToken ?? "", editing!.id, {
        partida: values.partida ?? null,
        monto: values.monto,
        fecha: values.fecha,
        tipo: values.tipo,
        categoria: values.categoria?.trim() || null,
        observacion: values.observacion?.trim() || null
      }),
    onSuccess: () => {
      setFeedback("Gasto actualizado correctamente.");
      setEditing(null);
      setFormKey((key) => key + 1);
      invalidateData();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGasto(accessToken ?? "", id),
    onSuccess: () => {
      setFeedback("Gasto eliminado correctamente.");
      invalidateData();
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const defaultValues: Partial<ExpenseFormValues> | undefined = useMemo(() => {
    if (!editing) return undefined;
    return {
      monto: editing.monto,
      fecha: editing.fecha,
      tipo: editing.tipo as "fijo" | "variable",
      partida: editing.partida ?? null,
      categoria: editing.categoria ?? undefined,
      observacion: editing.observacion ?? undefined
    };
  }, [editing]);

  const rows: TransactionRow[] = useMemo(
    () =>
      gastos.map((gasto) => ({
        id: gasto.id,
        fecha: new Date(gasto.fecha).toLocaleDateString("es-CL"),
        concepto: gasto.observacion || "Gasto registrado",
        categoria: gasto.partida_nombre ?? gasto.categoria,
        tipo: gasto.tipo === "fijo" ? "Fijo" : "Variable",
        monto: gasto.monto
      })),
    [gastos]
  );

  const handleSubmit = async (values: ExpenseFormValues) => {
    setFeedback(null);
    if (editing) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleEdit = (row: TransactionRow) => {
    const gasto = gastos.find((item) => item.id === row.id);
    if (gasto) {
      setEditing(gasto);
      setFeedback(null);
      setFormKey((key) => key + 1);
    }
  };

  const handleDelete = async (row: TransactionRow) => {
    if (!window.confirm("¿Deseas eliminar este gasto?")) return;
    setFeedback(null);
    await deleteMutation.mutateAsync(row.id);
  };

  const activeMutationError = createMutation.error || updateMutation.error || deleteMutation.error;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4">
          <h1 className="text-xl font-semibold text-slate-900">Registrar un gasto</h1>
          <p className="text-sm text-slate-500">
            Ingresa los detalles del gasto para mantener tu control mensual actualizado.
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

        <ExpenseForm
          key={`${formKey}-${editing?.id ?? "nuevo"}`}
          partidas={partidas as Partida[]}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={editing ? () => setEditing(null) : undefined}
          submitLabel={editing ? "Actualizar gasto" : "Guardar gasto"}
          isSubmitting={isSubmitting}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Gastos del mes</h2>
            <p className="text-sm text-slate-500">
              Consulta, edita o elimina tus gastos para mantenerlos organizados.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {gastos.length} registros
          </span>
        </header>

        {(isLoadingGastos || isLoadingPartidas) && gastos.length === 0 ? (
          <div className="h-48 animate-pulse rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
        ) : (
          <TransactionTable
            items={rows}
            emptyMessage="Aún no registras gastos en el sistema."
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}
