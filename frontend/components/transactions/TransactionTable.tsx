"use client";

import clsx from "clsx";

export type TransactionRow = {
  id: number;
  fecha: string;
  concepto: string;
  categoria?: string | null;
  tipo: string;
  monto: number;
};

type TransactionTableProps = {
  items: TransactionRow[];
  emptyMessage: string;
  onEdit?: (row: TransactionRow) => void;
  onDelete?: (row: TransactionRow) => void;
  currency?: string;
};

export function TransactionTable({
  items,
  emptyMessage,
  onEdit,
  onDelete,
  currency = "CLP"
}: TransactionTableProps) {
  const formatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency
  });

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Concepto</th>
            <th className="px-4 py-3 font-semibold">Categoría</th>
            <th className="px-4 py-3 font-semibold">Tipo</th>
            <th className="px-4 py-3 text-right font-semibold">Monto</th>
            {(onEdit || onDelete) && <th className="px-4 py-3 text-right font-semibold">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3 font-medium text-slate-600">{item.fecha}</td>
              <td className="px-4 py-3 text-slate-700">{item.concepto}</td>
              <td className="px-4 py-3 text-slate-500">{item.categoria ?? "-"}</td>
              <td className="px-4 py-3">
                <span
                  className={clsx(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                    item.tipo.toLowerCase() === "fijo"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-sky-100 text-sky-700"
                  )}
                >
                  {item.tipo}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                {formatter.format(item.monto)}
              </td>
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
