"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { useAuth } from "@/components/auth/auth-context";
import { fetchResumenFinanciero } from "@/lib/api";

export default function ReportesPage() {
  const { accessToken } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["resumen", accessToken],
    queryFn: () => fetchResumenFinanciero(accessToken ?? ""),
    enabled: Boolean(accessToken)
  });

  const currencyFormatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP"
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Reportes financieros</h1>
        <p className="text-sm text-slate-500">
          Analiza tus gastos e ingresos con mayor detalle y detecta oportunidades de mejora.
        </p>
      </header>

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error instanceof Error ? error.message : "No pudimos generar los reportes. Intenta nuevamente."}
        </div>
      )}

      {data && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total ingresos"
              value={currencyFormatter.format(data.total_ingresos)}
              caption="Suma de ingresos del mes"
            />
            <MetricCard
              title="Total gastos"
              value={currencyFormatter.format(data.total_gastos)}
              caption="Suma de gastos del mes"
            />
            <MetricCard
              title="Saldo disponible"
              value={currencyFormatter.format(data.saldo)}
              caption="Resultado después de gastos"
            />
            <MetricCard
              title="Ahorro estimado"
              value={`${data.ahorro_porcentaje.toFixed(2)}%`}
              caption="Porcentaje del ingreso que se mantiene"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Distribución de gastos por categoría</h2>
              <p className="mt-1 text-sm text-slate-500">
                Identifica qué categorías concentran tus gastos para tomar acciones específicas.
              </p>
              <div className="mt-4 space-y-4">
                {Object.entries(data.gastos_por_categoria).map(([categoria, monto]) => {
                  const porcentaje = data.total_gastos > 0 ? Math.round((monto / data.total_gastos) * 100) : 0;
                  return (
                    <div key={categoria}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{categoria}</span>
                        <span className="text-slate-500">
                          {currencyFormatter.format(monto)} ({porcentaje}%)
                        </span>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200/70">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-emerald-500"
                          style={{ width: `${Math.min(porcentaje, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Alertas de presupuesto</h2>
              <p className="mt-1 text-sm text-slate-500">
                Visualiza las partidas que están cerca de su límite o que ya lo han superado.
              </p>
              <div className="mt-4 space-y-3">
                {data.partidas.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-500">
                    Aún no has configurado partidas de presupuesto.
                  </p>
                ) : (
                  data.partidas
                    .map((partida) => ({
                      ...partida,
                      porcentaje:
                        partida.monto_asignado > 0
                          ? Math.round((partida.gastado_mes / partida.monto_asignado) * 100)
                          : 0
                    }))
                    .sort((a, b) => b.porcentaje - a.porcentaje)
                    .map((partida) => (
                      <div
                        key={partida.id}
                        className={clsx(
                          "rounded-2xl border px-4 py-3 text-sm transition",
                          partida.disponible_mes < 0
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : partida.porcentaje >= 80
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{partida.nombre}</p>
                          <span>
                            {currencyFormatter.format(partida.gastado_mes)} / {currencyFormatter.format(partida.monto_asignado)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs">
                          {partida.porcentaje}% utilizado · Disponible: {currencyFormatter.format(partida.disponible_mes)}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </article>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Indicadores sugeridos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Utiliza estas recomendaciones para mejorar tu salud financiera.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {data.sugerencias.map((sugerencia, index) => (
                <div
                  key={`${sugerencia}-${index}`}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                >
                  {sugerencia}
                </div>
              ))}
              {data.sugerencias.length === 0 && (
                <p className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
                  Aún no hay sugerencias. Sigue registrando tus movimientos para obtener recomendaciones personalizadas.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  caption: string;
};

function MetricCard({ title, value, caption }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{caption}</p>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
