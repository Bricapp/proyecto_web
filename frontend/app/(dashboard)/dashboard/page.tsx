"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { useAuth } from "@/components/auth/auth-context";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { fetchResumenFinanciero } from "@/lib/api";

export default function DashboardPage() {
  const { accessToken, user } = useAuth();

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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Hola {user?.first_name || user?.username},</h1>
        <p className="text-sm text-slate-500">
          Aquí tienes un resumen de tus finanzas del mes. Revisa tus avances y toma decisiones informadas.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-3xl border border-slate-200 bg-white/70 shadow-sm shadow-emerald-500/10"
            >
              <div className="h-full animate-pulse rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error instanceof Error
            ? error.message
            : "No pudimos cargar el resumen financiero. Intenta nuevamente en unos minutos."}
        </div>
      )}

      {data && (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            <SummaryCard
              title="Saldo del mes"
              subtitle="Ingresos - gastos"
              value={currencyFormatter.format(data.saldo)}
              trend={data.saldo >= 0 ? "positivo" : "negativo"}
            />
            <SummaryCard
              title="Ingresos acumulados"
              subtitle="Total registrado en el mes"
              value={currencyFormatter.format(data.total_ingresos)}
              highlight="Ingresos"
            />
            <SummaryCard
              title="Gastos acumulados"
              subtitle="Total registrado en el mes"
              value={currencyFormatter.format(data.total_gastos)}
              highlight="Gastos"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Partidas presupuestarias</h2>
                  <p className="text-sm text-slate-500">Revisa cuánto queda disponible en cada partida del mes.</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {data.partidas.length} partidas activas
                </span>
              </header>
              <div className="space-y-4">
                {data.partidas.map((partida) => {
                  const gasto = partida.gastado_mes;
                  const porcentaje = partida.monto_asignado
                    ? Math.min(100, Math.round((gasto / partida.monto_asignado) * 100))
                    : 0;
                  const disponible = partida.disponible_mes;
                  return (
                    <div key={partida.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{partida.nombre}</p>
                          <p className="text-xs text-slate-500">
                            Asignado: {currencyFormatter.format(partida.monto_asignado)}
                          </p>
                        </div>
                        <div className="text-right text-sm font-semibold">
                          <p className={clsx(disponible < 0 ? "text-rose-600" : "text-emerald-600")}
                          >
                            {currencyFormatter.format(disponible)}
                          </p>
                          <p className="text-xs font-normal text-slate-400">Disponibles</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/70">
                        <div
                          className={clsx(
                            "h-full rounded-full",
                            disponible < 0 ? "bg-rose-500" : "bg-gradient-to-r from-emerald-400 to-sky-500"
                          )}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Gastado este mes: {currencyFormatter.format(gasto)} ({porcentaje}% del presupuesto)
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Gastos por categoría</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Visualiza cómo se distribuyen tus gastos y detecta las categorías más relevantes.
                </p>
                <div className="mt-4 space-y-4">
                  {Object.entries(data.gastos_por_categoria).map(([categoria, monto]) => {
                    const porcentaje = data.total_gastos > 0 ? Math.min(100, Math.round((monto / data.total_gastos) * 100)) : 0;
                    return (
                      <div key={categoria}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{categoria}</span>
                          <span className="text-slate-500">{currencyFormatter.format(monto)}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-200/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-emerald-500"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Sugerencias inteligentes</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Acciones recomendadas según tus movimientos más recientes.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {data.sugerencias.map((sugerencia, index) => (
                    <li
                      key={`${sugerencia}-${index}`}
                      className="flex items-start gap-3 rounded-2xl bg-emerald-50/60 p-3 text-left text-emerald-800"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                      {sugerencia}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Últimos gastos</h2>
              <TransactionTable
                items={data.gastos_recientes.map((gasto) => ({
                  id: gasto.id,
                  fecha: new Date(gasto.fecha).toLocaleDateString("es-CL"),
                  concepto: gasto.observacion || gasto.partida_nombre || "Gasto registrado",
                  categoria: gasto.partida_nombre ?? gasto.categoria,
                  tipo: gasto.tipo === "fijo" ? "Fijo" : "Variable",
                  monto: gasto.monto
                }))}
                emptyMessage="Aún no registras gastos este mes."
              />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Últimos ingresos</h2>
              <TransactionTable
                items={data.ingresos_recientes.map((ingreso) => ({
                  id: ingreso.id,
                  fecha: new Date(ingreso.fecha).toLocaleDateString("es-CL"),
                  concepto: ingreso.observacion || "Ingreso registrado",
                  categoria: ingreso.tipo === "fijo" ? "Ingreso fijo" : "Ingreso eventual",
                  tipo: ingreso.tipo === "fijo" ? "Fijo" : "Eventual",
                  monto: ingreso.monto
                }))}
                emptyMessage="Registra tus ingresos para visualizar tendencias."
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  subtitle: string;
  value: string;
  trend?: "positivo" | "negativo";
  highlight?: "Ingresos" | "Gastos";
};

function SummaryCard({ title, subtitle, value, trend, highlight }: SummaryCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:shadow-emerald-500/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{subtitle}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
        </div>
        {highlight && (
          <span
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-semibold",
              highlight === "Ingresos" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
            )}
          >
            {highlight}
          </span>
        )}
      </div>
      <p className="mt-6 text-3xl font-semibold text-slate-900">{value}</p>
      {trend && (
        <p
          className={clsx(
            "mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
            trend === "positivo" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
            {trend === "positivo" ? (
              <path d="M5 12l4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M19 12l-4-4-10 10" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          {trend === "positivo" ? "Saldo saludable" : "Revisa tus gastos"}
        </p>
      )}
    </article>
  );
}
