import { useState, useEffect } from 'preact/hooks';
import type { Product, ProductCategory } from '../../../shared/types/product.types';
import { formatCLP } from '../../../shared/utils/formatCurrency';

export interface ProductCardProps {
  product: Product;
  onAddProduct?: (product: Product) => void;
  quantityInOrder?: number;
}

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

export function ProductCard({
  product,
  onAddProduct,
  quantityInOrder = 0,
}: ProductCardProps) {
  const fallbackSrc = getCategoryFallbackSvg(product.categoria);
  const [imgSrc, setImgSrc] = useState<string>(product.imagen || fallbackSrc);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(product.imagen || fallbackSrc);
  }, [product.imagen, fallbackSrc]);

  const isSoldOut = product.stock <= 0;
  const showNormalPrice = product.precioNormal > product.precioOferta;
  // Regla estricta: mostrar precio mayorista SOLO cuando xMayor > 0 y precioMayorista > 0
  const tieneMayorista = product.xMayor > 0 && product.precioMayorista > 0;

  const metaParts = [
    product.variante && product.variante.toLowerCase() !== 'sin variante'
      ? product.variante
      : '',
    product.contenido,
  ].filter(Boolean);

  const handleAdd = () => {
    if (isSoldOut) return;

    onAddProduct?.(product);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('launion:add-to-order', {
          detail: { product },
        })
      );
    }

    setJustAdded(true);
    window.setTimeout(() => {
      setJustAdded(false);
    }, 850);
  };

  return (
    <article
      className={`flex flex-col justify-between rounded-xl bg-[var(--color-bg-surface)] p-2.5 shadow-xs transition-shadow sm:p-3.5 ${
        isSoldOut
          ? 'card-soldout'
          : 'border border-[var(--color-border-subtle)] hover:shadow-md'
      }`}
    >
      {isSoldOut && (
        <div className="ribbon-soldout" aria-hidden="true">
          AGOTADO
        </div>
      )}

      <div>
        {/* Imagen del producto */}
        <div className="card-media relative aspect-square w-full overflow-hidden rounded-lg bg-[#EFF6FF]/60">
          <img
            src={imgSrc}
            alt={product.nombre}
            loading="lazy"
            decoding="async"
            onError={() => {
              if (imgSrc !== fallbackSrc) {
                setImgSrc(fallbackSrc);
              }
            }}
            className="h-full w-full object-contain p-1.5"
          />

          {quantityInOrder > 0 && !isSoldOut && (
            <span className="absolute top-1.5 right-1.5 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs tabular-nums">
              {quantityInOrder} en lista
            </span>
          )}
        </div>

        {/* Cuerpo de metadatos */}
        <div className="card-body mt-2.5">
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px]">
            <span className="truncate rounded-full bg-blue-50 px-2 py-0.5 font-medium text-[var(--color-primary)]">
              {product.categoria}
            </span>
            <span
              className={`shrink-0 font-semibold tabular-nums ${
                isSoldOut
                  ? 'text-[var(--color-soldout)]'
                  : product.stock <= 3
                    ? 'text-amber-700'
                    : 'text-[var(--color-text-muted)]'
              }`}
            >
              {isSoldOut ? 'Sin stock' : `Stock: ${product.stock}`}
            </span>
          </div>

          <p className="mt-1.5 truncate text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {product.marca}
          </p>

          <h2 className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-[var(--color-text-main)] sm:text-sm">
            {product.nombre}
          </h2>

          {metaParts.length > 0 && (
            <p className="mt-1 truncate text-[11px] text-[var(--color-text-muted)] sm:text-xs">
              {metaParts.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Precios y botón de acción */}
      <div className="mt-3 border-t border-slate-100 pt-2">
        <div className="card-body">
          {showNormalPrice && (
            <p className="text-[11px] text-[var(--color-text-muted)] line-through tabular-nums sm:text-xs">
              Normal: {formatCLP(product.precioNormal)}
            </p>
          )}

          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-[var(--color-text-main)] tabular-nums sm:text-lg">
              {formatCLP(product.precioOferta)}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">c/u</span>
          </div>

          {tieneMayorista && (
            <div className="mt-1.5 rounded-lg border border-emerald-200 bg-[var(--color-wholesale-bg)] px-2 py-1 text-[11px] font-semibold leading-tight text-[var(--color-wholesale)] tabular-nums">
              Mayorista: {formatCLP(product.precioMayorista)} c/u ({product.xMayor}+ un.)
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={isSoldOut}
          onClick={handleAdd}
          aria-label={
            isSoldOut
              ? `${product.nombre} agotado`
              : `Agregar ${product.nombre} al pedido`
          }
          className={`mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors sm:text-sm ${
            isSoldOut
              ? 'cursor-not-allowed bg-slate-200 text-slate-500'
              : justAdded
                ? 'bg-[var(--color-wholesale)] text-white'
                : 'cursor-pointer bg-[var(--color-cta)] text-white hover:bg-[var(--color-cta-hover)] active:scale-[0.99]'
          }`}
        >
          {isSoldOut ? (
            'Agotado'
          ) : justAdded ? (
            <>
              <span aria-hidden="true">✓</span> Agregado
            </>
          ) : (
            <>
              <span aria-hidden="true">+</span> Agregar
            </>
          )}
        </button>
      </div>
    </article>
  );
}
