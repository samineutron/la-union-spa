import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { formatCLP } from '../../../shared/utils/formatCurrency';
import { reloadCatalog } from '../../catalog';
import {
  $isDrawerOpen,
  $orderSummary,
  $stockAdjustmentNotice,
  clearOrder,
  closeDrawer,
  dismissStockNotice,
} from '../store/orderStore';
import {
  buildOrderTextMessage,
  buildWhatsAppUrl,
} from '../utils/whatsappFormatter';
import { OrderItemRow, OutOfStockItemRow } from './OrderItemRow';

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continuar al fallback textarea
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  }

  return false;
}

export function OrderDrawer() {
  const isOpen = useStore($isDrawerOpen);
  const summary = useStore($orderSummary);
  const stockNotice = useStore($stockAdjustmentNotice);

  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  // Sincroniza stock en segundo plano al abrir el drawer (Matriz 5 estados - Carga)
  useEffect(() => {
    if (!isOpen) {
      setConfirmClear(false);
      return;
    }

    void reloadCatalog();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isEmpty =
    summary.lines.length === 0 && summary.outOfStockLines.length === 0;
  const hasValidLines = summary.lines.length > 0;

  const handleCopyOrder = async () => {
    if (!hasValidLines) return;
    const message = buildOrderTextMessage(summary);
    const ok = await copyTextToClipboard(message);
    if (ok) {
      setCopiedFeedback(true);
      window.setTimeout(() => {
        setCopiedFeedback(false);
      }, 2200);
    }
  };

  const whatsappHref = hasValidLines ? buildWhatsAppUrl(summary) : '#';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/55 backdrop-blur-[1px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeDrawer();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-drawer-title"
        className="flex h-full w-full max-w-md flex-col bg-[var(--color-bg-page)] shadow-2xl"
      >
        {/* Cabecera del Drawer */}
        <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-white px-4 py-3.5">
          <div>
            <h2
              id="order-drawer-title"
              className="text-base font-extrabold text-[var(--color-text-main)] sm:text-lg"
            >
              Mi Pedido de Bodega
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] tabular-nums">
              {summary.totalUnits === 0
                ? 'Sin productos seleccionados'
                : `${summary.totalUnits} ${summary.totalUnits === 1 ? 'unidad seleccionada' : 'unidades seleccionadas'}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => closeDrawer()}
            aria-label="Cerrar panel de pedido"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)]/60 text-[var(--color-text-main)] transition-colors hover:bg-blue-100"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4">
          {stockNotice && (
            <div
              role="status"
              className="mb-3 flex items-start justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950"
            >
              <span>{stockNotice}</span>
              <button
                type="button"
                onClick={() => dismissStockNotice()}
                aria-label="Cerrar aviso de stock"
                className="shrink-0 cursor-pointer font-bold text-amber-900 underline"
              >
                OK
              </button>
            </div>
          )}

          {isEmpty ? (
            /* Estado Vacío */
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)]">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-bold text-[var(--color-text-main)] sm:text-base">
                Tu lista está vacía. Agrega productos desde 1 unidad
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Arma tu listado sin compromiso y envíalo directo por WhatsApp para coordinar retiro o despacho en Maipú.
              </p>
              <button
                type="button"
                onClick={() => closeDrawer()}
                className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl bg-[var(--color-cta)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-cta-hover)]"
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Alertas de productos que pasaron a stock === 0 */}
              {summary.outOfStockLines.length > 0 && (
                <ul className="space-y-2" aria-label="Productos sin stock">
                  {summary.outOfStockLines.map((outLine) => (
                    <OutOfStockItemRow
                      key={outLine.product.id}
                      product={outLine.product}
                    />
                  ))}
                </ul>
              )}

              {/* Líneas válidas del pedido */}
              {hasValidLines && (
                <ul className="space-y-2.5" aria-label="Productos en tu pedido">
                  {summary.lines.map((line) => (
                    <OrderItemRow key={line.product.id} line={line} />
                  ))}
                </ul>
              )}

              {/* Botón para vaciar lista */}
              <div className="pt-1 text-right">
                {!confirmClear ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] underline hover:text-[var(--color-soldout)]"
                  >
                    Vaciar lista completa
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs">
                    <span className="font-semibold text-red-900">¿Seguro?</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearOrder();
                        setConfirmClear(false);
                      }}
                      className="cursor-pointer font-extrabold text-[var(--color-soldout)] underline"
                    >
                      Sí, vaciar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="cursor-pointer font-semibold text-slate-600"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pie fijo con totales y botones WhatsApp / Copiar */}
        {hasValidLines && (
          <footer className="border-t border-[var(--color-border-subtle)] bg-white p-4 shadow-[0_-4px_12px_rgba(15,23,42,0.05)]">
            {summary.totalSavings > 0 && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--color-wholesale-bg)] px-3 py-1.5 text-xs font-bold text-[var(--color-wholesale)] tabular-nums">
                <span>Ahorro total en este pedido</span>
                <span>{formatCLP(summary.totalSavings)}</span>
              </div>
            )}

            <div className="flex items-baseline justify-between tabular-nums">
              <span className="text-sm font-bold text-[var(--color-text-muted)]">
                Total estimado
              </span>
              <span className="text-xl font-extrabold text-[var(--color-text-main)]">
                {formatCLP(summary.totalAmount)}
              </span>
            </div>

            <p className="mt-1.5 text-[11px] leading-snug text-[var(--color-text-muted)]">
              Retiro en local (Maipú) o despacho a domicilio con recargo según sector, y pago vía transferencia o link MercadoPago se confirman por WhatsApp.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[var(--color-wholesale)] px-4 py-2.5 text-center text-sm font-extrabold text-white shadow-xs transition-colors hover:bg-emerald-700 active:scale-[0.99]"
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.82 14.01c-.24.68-1.41 1.3-1.96 1.38-.5.08-1.14.11-1.84-.11-.43-.14-.98-.32-1.68-.62-2.95-1.27-4.88-4.24-5.03-4.44-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.59.83 2.03.9 2.18.08.15.13.32.03.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.07 1.31 2.37 1.46.3.15.47.12.64-.08.18-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.72.81 2.02.96.3.15.49.22.56.35.08.12.08.72-.16 1.4Z" />
                </svg>
                <span>Enviar por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => void handleCopyOrder()}
                className={`flex min-h-[46px] cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-xs transition-colors active:scale-[0.99] ${
                  copiedFeedback
                    ? 'bg-slate-800'
                    : 'bg-[var(--color-cta)] hover:bg-[var(--color-cta-hover)]'
                }`}
              >
                {copiedFeedback ? (
                  <>
                    <span aria-hidden="true">✓</span>
                    <span>¡Pedido copiado!</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copiar pedido</span>
                  </>
                )}
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
