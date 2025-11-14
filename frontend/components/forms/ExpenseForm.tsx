"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Partida } from "@/lib/api";
import { formatCLP, parseCLP } from "@/lib/currency";

const schema = z
  .object({
    monto: z
      .number({ invalid_type_error: "Ingresa un monto válido" })
      .positive("El monto debe ser mayor a 0"),
    fecha: z.string().min(1, "La fecha es obligatoria"),
    tipo: z.enum(["fijo", "variable"], {
      errorMap: () => ({ message: "Selecciona un tipo de gasto" })
    }),
    partida: z.number().nullable().optional(),
    categoria: z.string().optional(),
    observacion: z.string().optional()
  })
  .refine((data) => Boolean(data.partida) || Boolean(data.categoria?.trim()), {
    message: "Selecciona una partida o escribe una categoría",
    path: ["categoria"]
  });

export type ExpenseFormValues = z.infer<typeof schema>;

type ExpenseFormProps = {
  partidas: Partida[];
  defaultValues?: Partial<ExpenseFormValues>;
  onSubmit: (values: ExpenseFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
};

export function ExpenseForm({
  partidas,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar gasto",
  isSubmitting = false
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: "variable",
      fecha: new Date().toISOString().slice(0, 10),
      ...defaultValues,
      partida: defaultValues?.partida ?? null
    }
  });

  const partidasOptions = useMemo(
    () =>
      partidas.map((partida) => ({
        value: partida.id,
        label: `${partida.nombre} (${formatCLP(partida.monto_asignado)})`
      })),
    [partidas]
  );

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
        {errors.monto && (
          <p className="mt-1 text-sm text-rose-500">{errors.monto.message}</p>
        )}
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
          {errors.fecha && (
            <p className="mt-1 text-sm text-rose-500">{errors.fecha.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="tipo">
            Tipo de gasto
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
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="partida">
          Partida presupuestaria
        </label>
        <select
          id="partida"
          className={clsx(
            "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
            errors.partida && "border-rose-300"
          )}
          {...register("partida", {
            setValueAs: (value) => {
              if (value === "" || value === undefined) return null;
              return Number(value);
            }
          })}
        >
          <option value="">Sin partida asignada</option>
          {partidasOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.partida && (
          <p className="mt-1 text-sm text-rose-500">{errors.partida.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="categoria">
          Categoría personalizada
        </label>
        <input
          id="categoria"
          type="text"
          placeholder="Ej. Alimentación, Educación, Transporte"
          className={clsx(
            "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200",
            errors.categoria && "border-rose-300"
          )}
          {...register("categoria")}
        />
        {errors.categoria && (
          <p className="mt-1 text-sm text-rose-500">{errors.categoria.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="observacion">
          Observaciones
        </label>
        <textarea
          id="observacion"
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Añade un comentario para recordar detalles importantes"
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
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400"
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
