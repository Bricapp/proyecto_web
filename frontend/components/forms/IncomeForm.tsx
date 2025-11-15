"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { formatCLP, parseCLP } from "@/lib/currency";

const schema = z.object({
  monto: z
    .number({ invalid_type_error: "Ingresa un monto válido" })
    .positive("El monto debe ser mayor a 0"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  tipo: z.enum(["fijo", "eventual"], {
    errorMap: () => ({ message: "Selecciona un tipo de ingreso" })
  }),
  observacion: z.string().optional()
});

export type IncomeFormValues = z.infer<typeof schema>;

type IncomeFormProps = {
  defaultValues?: Partial<IncomeFormValues>;
  onSubmit: (values: IncomeFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
};

export function IncomeForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar ingreso",
  isSubmitting = false
}: IncomeFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: "fijo",
      fecha: new Date().toISOString().slice(0, 10),
      ...defaultValues
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="monto">
          Monto
        </label>
        <Controller
          control={control}
          name="monto"
          render={({ field }) => (
            <input
              id="monto"
              type="text"
              inputMode="numeric"
              className={clsx(
                "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
                errors.monto && "border-rose-300"
              )}
              value={field.value ? formatCLP(field.value) : ""}
              onChange={(event) => field.onChange(parseCLP(event.target.value))}
              onBlur={(event) => field.onChange(parseCLP(event.target.value))}
              placeholder="$0"
            />
          )}
        />
        {errors.monto && <p className="mt-1 text-sm text-rose-500">{errors.monto.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="fecha">
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            className={clsx(
              "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
              errors.fecha && "border-rose-300"
            )}
            {...register("fecha")}
          />
          {errors.fecha && <p className="mt-1 text-sm text-rose-500">{errors.fecha.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="tipo">
            Tipo de ingreso
          </label>
          <select
            id="tipo"
            className={clsx(
              "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
              errors.tipo && "border-rose-300"
            )}
            {...register("tipo")}
          >
            <option value="fijo">Fijo</option>
            <option value="eventual">Eventual</option>
          </select>
          {errors.tipo && <p className="mt-1 text-sm text-rose-500">{errors.tipo.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="observacion">
          Observaciones
        </label>
        <textarea
          id="observacion"
          rows={3}
          placeholder="Describe el origen del ingreso o notas relevantes"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          {...register("observacion")}
        />
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
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-sky-600 hover:to-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400"
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
