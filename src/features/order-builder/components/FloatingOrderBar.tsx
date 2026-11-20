import { useStore } from '@nanostores/preact';
import { formatCLP } from '../../../shared/utils/formatCurrency';
import { $orderSummary, openDrawer } from '../store/orderStore';

export function FloatingOrderBar() {
  const summary = useStore($orderSummary);
  const hasItems = summary.totalUnits > 0 || summary.outOfStockLines.length > 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-3 sm:p-4">
      <div className="mx-auto flex max-w-7xl justify-end">
        <button
          type="button"
          onClick={() => openDrawer()}
          aria-label="Abrir resumen de mi pedido"
          className={`pointer-events-auto flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-white shadow-lg transition-all active:scale-[0.99] sm:w-auto sm:min-w-[320px] ${
            hasItems
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] ring-2 ring-white/80'
              : 'bg-slate-800/95 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {summary.totalUnits > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-wholesale)] px-1 text-[11px] font-extrabold text-white shadow-xs tabular-nums">
                  {summary.totalUnits}
                </span>
              )}
            </span>

            <div className="text-left">
              <p className="text-xs font-extrabold tracking-tight sm:text-sm">
                Ver mi pedido
              </p>
              <p className="text-[11px] text-blue-100 tabular-nums">
                {summary.totalUnits === 0
                  ? 'Lista vacía · Desde 1 un.'
                  : `${summary.totalUnits} ${summary.totalUnits === 1 ? 'unidad' : 'unidades'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 tabular-nums">
            <span className="text-base font-extrabold sm:text-lg">
              {formatCLP(summary.totalAmount)}
            </span>
            <span aria-hidden="true" className="text-blue-200">
              ›
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
