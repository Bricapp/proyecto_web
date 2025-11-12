"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  tipo: z.enum(["fijo", "variable"], {
    errorMap: () => ({ message: "Selecciona el tipo de partida" })
  }),
  monto_asignado: z
    .number({ invalid_type_error: "Ingresa un monto válido" })
    .positive("El monto debe ser mayor a 0")
});

export type BudgetFormValues = z.infer<typeof schema>;

type BudgetFormProps = {
  defaultValues?: Partial<BudgetFormValues>;
  onSubmit: (values: BudgetFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
};

export function BudgetForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar partida",
  isSubmitting = false
}: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: "variable",
      ...defaultValues
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="nombre">
          Nombre de la partida
        </label>
        <input
          id="nombre"
          type="text"
          className={clsx(
            "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
            errors.nombre && "border-rose-300"
          )}
          placeholder="Ej. Alimentación, Transporte, Marketing"
          {...register("nombre")}
        />
        {errors.nombre && <p className="mt-1 text-sm text-rose-500">{errors.nombre.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="tipo">
            Tipo
          </label>
          <select
            id="tipo"
            className={clsx(
              "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
              errors.tipo && "border-rose-300"
            )}
            {...register("tipo")}
          >
            <option value="variable">Variable</option>
            <option value="fijo">Fijo</option>
          </select>
          {errors.tipo && <p className="mt-1 text-sm text-rose-500">{errors.tipo.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="monto_asignado">
            Monto mensual asignado
          </label>
          <input
            id="monto_asignado"
            type="number"
            step="0.01"
            className={clsx(
              "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
              errors.monto_asignado && "border-rose-300"
            )}
            {...register("monto_asignado", { valueAsNumber: true })}
          />
          {errors.monto_asignado && (
            <p className="mt-1 text-sm text-rose-500">{errors.monto_asignado.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-400 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400"
        >
          {isSubmitting && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4" opacity="0.25" />
              <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
