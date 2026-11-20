import { useState, useEffect } from 'preact/hooks';
import type {
  CalculatedOrderLine,
  Product,
  ProductCategory,
} from '../../../shared/types/product.types';
import { formatCLP } from '../../../shared/utils/formatCurrency';
import {
  decrementItem,
  incrementItem,
  removeItem,
} from '../store/orderStore';

function getCategoryFallbackSvg(categoria: ProductCategory): string {
  switch (categoria) {
    case 'Artículos aseo personal':
      return '/fallback/personal.svg';
    case 'Artículos escolares':
      return '/fallback/escolar.svg';
    case 'Artículos de aseo':
    default:
      return '/fallback/aseo.svg';
  }
}

export interface OrderItemRowProps {
  line: CalculatedOrderLine;
}

export function OrderItemRow({ line }: OrderItemRowProps) {
  const {
    product,
    cantidad,
    tieneMayorista,
    esMayorista,
    precioUnitarioAplicado,
    subtotal,
    ahorroLinea,
    unidadesFaltantesMayorista,
  } = line;

  const fallbackSrc = getCategoryFallbackSvg(product.categoria);
  const [imgSrc, setImgSrc] = useState<string>(product.imagen || fallbackSrc);

  useEffect(() => {
    setImgSrc(product.imagen || fallbackSrc);
  }, [product.imagen, fallbackSrc]);

  const isAtMaxStock = cantidad >= product.stock;

  const metaText = [
    product.marca,
    product.variante && product.variante.toLowerCase() !== 'sin variante'
      ? product.variante
      : '',
    product.contenido,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="rounded-xl border border-[var(--color-border-subtle)] bg-white p-3 shadow-2xs">
      <div className="flex gap-3">
        {/* Miniatura */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#EFF6FF]/70 p-1">
          <img
            src={imgSrc}
            alt={product.nombre}
            loading="lazy"
            onError={() => {
              if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
            }}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Detalle del producto */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-xs font-bold leading-snug text-[var(--color-text-main)] sm:text-sm">
              {product.nombre}
            </h3>

            <button
              type="button"
              onClick={() => removeItem(product.id)}
              aria-label={`Eliminar ${product.nombre} del pedido`}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-[var(--color-soldout)]"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>

          {metaText && (
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-muted)]">
              {metaText}
            </p>
          )}

          {/* Precio unitario aplicado */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs tabular-nums">
            <span className="font-semibold text-[var(--color-text-main)]">
              {formatCLP(precioUnitarioAplicado)} c/u
            </span>

            {tieneMayorista && esMayorista && (
              <span className="rounded-full bg-[var(--color-wholesale-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-wholesale)]">
                Mayorista aplicado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Aviso condicional de tramo xMayor (SOLO si product.xMayor > 0 && product.precioMayorista > 0) */}
      {tieneMayorista && !esMayorista && unidadesFaltantesMayorista > 0 && (
        <div className="mt-2 rounded-lg border border-emerald-200/80 bg-[var(--color-wholesale-bg)]/70 px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-wholesale)] tabular-nums">
          Agrega{' '}
          <strong>
            {unidadesFaltantesMayorista}{' '}
            {unidadesFaltantesMayorista === 1 ? 'unidad más' : 'unidades más'}
          </strong>{' '}
          para precio mayorista ({formatCLP(product.precioMayorista)} c/u)
        </div>
      )}

      {/* Controles táctiles +/- (44x44px) y Subtotal */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => decrementItem(product.id)}
            aria-label={`Disminuir cantidad de ${product.nombre}`}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)]/70 text-base font-extrabold text-[var(--color-text-main)] transition-colors hover:bg-blue-100 active:scale-95"
          >
            −
          </button>

          <span
            aria-label={`Cantidad: ${cantidad}`}
            className="min-w-[34px] text-center text-sm font-extrabold text-[var(--color-text-main)] tabular-nums"
          >
            {cantidad}
          </span>

          <button
            type="button"
            disabled={isAtMaxStock}
            onClick={() => incrementItem(product.id)}
            aria-label={`Aumentar cantidad de ${product.nombre}`}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border text-base font-extrabold transition-colors ${
              isAtMaxStock
                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                : 'cursor-pointer border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-95'
            }`}
          >
            +
          </button>

          {isAtMaxStock && (
            <span className="ml-1 text-[10px] font-semibold text-amber-700 tabular-nums">
              Máx. stock ({product.stock})
            </span>
          )}
        </div>

        <div className="text-right tabular-nums">
          <p className="text-sm font-extrabold text-[var(--color-text-main)] sm:text-base">
            {formatCLP(subtotal)}
          </p>
          {ahorroLinea > 0 && (
            <p className="text-[11px] font-semibold text-[var(--color-wholesale)]">
              Ahorras {formatCLP(ahorroLinea)}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export interface OutOfStockItemRowProps {
  product: Product;
}

export function OutOfStockItemRow({ product }: OutOfStockItemRowProps) {
  return (
    <li className="rounded-xl border-2 border-[var(--color-soldout)] bg-[var(--color-soldout-bg)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded bg-[var(--color-soldout)] px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
            Sin stock disponible
          </span>
          <p className="mt-1 truncate text-xs font-bold text-red-950 sm:text-sm">
            {product.nombre}
          </p>
          <p className="text-[11px] text-red-800">
            Se agotó en bodega y fue excluido del total.
          </p>
        </div>

        <button
          type="button"
          onClick={() => removeItem(product.id)}
          className="min-h-[44px] shrink-0 cursor-pointer rounded-xl bg-white px-3 text-xs font-bold text-[var(--color-soldout)] shadow-2xs ring-1 ring-red-300 transition-colors hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
