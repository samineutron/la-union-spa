import { useStore } from '@nanostores/preact';
import type { Product } from '../../../shared/types/product.types';
import {
  $products,
  $isLoading,
  $error,
  $isUsingCache,
  reloadCatalog,
} from '../store/catalogStore';
import { SkeletonCard } from './SkeletonCard';
import { ProductCard } from './ProductCard';

export interface ProductGridProps {
  /** Lista opcional filtrada (inyectada por el módulo search-filter en el Paso 2) */
  products?: Product[];
  /** Indica si hay filtros de búsqueda activos para personalizar el estado vacío */
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onAddProduct?: (product: Product) => void;
  orderQuantities?: Record<string, number>;
}

export function ProductGrid({
  products: externalProducts,
  hasActiveFilters = false,
  onClearFilters,
  onAddProduct,
  orderQuantities = {},
}: ProductGridProps) {
  const storeProducts = useStore($products);
  const isLoading = useStore($isLoading);
  const error = useStore($error);
  const isUsingCache = useStore($isUsingCache);

  const items = externalProducts ?? storeProducts;

  // Estado 3: Carga inicial (Skeleton cards)
  if (isLoading && storeProducts.length === 0) {
    return (
      <section aria-busy="true" aria-label="Cargando catálogo de productos">
        <div className="mb-3 h-4 w-44 animate-pulse rounded bg-blue-100" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  // Estado 4: Error sin caché disponible
  if (error && storeProducts.length === 0) {
    return (
      <div
        role="alert"
        className="mx-auto my-8 max-w-md rounded-2xl border border-red-200 bg-[var(--color-soldout-bg)] p-6 text-center shadow-xs"
      >
        <p className="text-base font-bold text-red-900">
          No pudimos cargar el catálogo
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-red-700 sm:text-sm">
          {error}
        </p>
        <button
          type="button"
          onClick={() => reloadCatalog()}
          className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-[var(--color-cta)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-cta-hover)]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Estado 2: Vacío (sin productos en bodega o sin coincidencias de búsqueda)
  if (!isLoading && items.length === 0) {
    return (
      <div className="mx-auto my-8 max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 text-center shadow-xs">
        <p className="text-base font-bold text-[var(--color-text-main)]">
          {hasActiveFilters
            ? 'No encontramos productos con esos filtros'
            : 'Aún no hay productos cargados en la bodega'}
        </p>
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)] sm:text-sm">
          {hasActiveFilters
            ? 'Prueba limpiando los filtros o buscando por otra palabra clave.'
            : 'Actualiza el listado para consultar los últimos artículos disponibles.'}
        </p>
        {hasActiveFilters && onClearFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-[var(--color-cta)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-cta-hover)]"
          >
            Limpiar todos los filtros
          </button>
        ) : (
          <button
            type="button"
            onClick={() => reloadCatalog()}
            className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-[var(--color-cta)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-cta-hover)]"
          >
            Recargar catálogo
          </button>
        )}
      </div>
    );
  }

  // Estado 1: Ideal (con aviso discreto si se está mostrando respaldo offline)
  return (
    <section aria-label="Listado de productos">
      {isUsingCache && (
        <div
          role="status"
          className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-900"
        >
          <span>Mostrando última copia guardada del catálogo (sin conexión).</span>
          <button
            type="button"
            onClick={() => reloadCatalog()}
            className="cursor-pointer font-bold text-[var(--color-primary)] underline"
          >
            Actualizar ahora
          </button>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between text-xs text-[var(--color-text-muted)] sm:text-sm">
        <p>
          Mostrando <strong className="font-bold text-[var(--color-text-main)] tabular-nums">{items.length}</strong>{' '}
          {items.length === 1 ? 'producto' : 'productos'}
        </p>
        <button
          type="button"
          onClick={() => reloadCatalog()}
          className="cursor-pointer font-medium text-[var(--color-primary)] hover:underline"
        >
          ↻ Actualizar stock
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddProduct={onAddProduct}
            quantityInOrder={orderQuantities[product.id] ?? 0}
          />
        ))}
      </div>
    </section>
  );
}
