import { useStore } from '@nanostores/preact';
import type { ProductCategory } from '../../../shared/types/product.types';
import { $isLoading } from '../../catalog';
import {
  $availableMarcas,
  $availableProductos,
  $categoria,
  $hasActiveFilters,
  $marca,
  $onlyInStock,
  $producto,
  clearAllFilters,
  setCategoria,
  setMarca,
  setOnlyInStock,
  setProducto,
} from '../store/filterStore';
import { FIXED_CATEGORIES } from '../utils/filterAndSortProducts';
import { SortSelect } from './SortSelect';

export function CategoryChips() {
  const categoria = useStore($categoria);
  const isLoading = useStore($isLoading);

  const options: Array<{ label: string; value: ProductCategory | 'ALL' }> = [
    { label: 'Todos', value: 'ALL' },
    ...FIXED_CATEGORIES.map((cat) => ({ label: cat, value: cat })),
  ];

  return (
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5"
    >
      {options.map((opt) => {
        const isActive = categoria === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={isLoading}
            aria-pressed={isActive}
            onClick={() => setCategoria(opt.value)}
            className={`min-h-[40px] shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors sm:text-xs ${
              isActive
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-xs'
                : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-page)]/80 text-[var(--color-text-main)] hover:bg-blue-100/70'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterControls() {
  const marca = useStore($marca);
  const producto = useStore($producto);
  const onlyInStock = useStore($onlyInStock);
  const availableMarcas = useStore($availableMarcas);
  const availableProductos = useStore($availableProductos);
  const hasActiveFilters = useStore($hasActiveFilters);
  const isLoading = useStore($isLoading);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
      {/* Filtro por Tipo de Producto */}
      <div className="lg:min-w-[185px] lg:flex-1">
        <label htmlFor="filter-producto-select" className="sr-only">
          Filtrar por tipo de producto
        </label>
        <select
          id="filter-producto-select"
          disabled={isLoading}
          value={producto}
          onChange={(e) => setProducto((e.currentTarget as HTMLSelectElement).value)}
          className="min-h-[44px] w-full cursor-pointer rounded-xl border border-[var(--color-border-subtle)] bg-white px-3 text-xs font-semibold text-[var(--color-text-main)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          <option value="ALL">Producto: Todos ({availableProductos.length})</option>
          {availableProductos.map((prod) => (
            <option key={prod} value={prod}>
              {prod}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por Marca */}
      <div className="lg:min-w-[185px] lg:flex-1">
        <label htmlFor="filter-marca-select" className="sr-only">
          Filtrar por marca
        </label>
        <select
          id="filter-marca-select"
          disabled={isLoading}
          value={marca}
          onChange={(e) => setMarca((e.currentTarget as HTMLSelectElement).value)}
          className="min-h-[44px] w-full cursor-pointer rounded-xl border border-[var(--color-border-subtle)] bg-white px-3 text-xs font-semibold text-[var(--color-text-main)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          <option value="ALL">Marca: Todas ({availableMarcas.length})</option>
          {availableMarcas.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Ordenamiento A-Z / Precio */}
      <div className="lg:min-w-[205px] lg:flex-1">
        <SortSelect />
      </div>

      {/* Toggle rápido: Solo disponibles con stock */}
      <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)]/60 px-3 text-xs font-semibold text-[var(--color-text-main)] select-none hover:bg-blue-100/60 sm:text-sm">
        <input
          type="checkbox"
          disabled={isLoading}
          checked={onlyInStock}
          onChange={(e) => setOnlyInStock((e.currentTarget as HTMLInputElement).checked)}
          className="h-4 w-4 accent-[var(--color-primary)]"
        />
        <span>Solo con stock</span>
      </label>

      {/* Botón Limpiar Filtros */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => clearAllFilters()}
          className="flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-[var(--color-soldout-bg)] px-3.5 text-xs font-bold text-[var(--color-soldout)] transition-colors hover:bg-red-100 sm:text-sm"
        >
          <span aria-hidden="true">✕</span>
          <span>Limpiar filtros</span>
        </button>
      )}
    </div>
  );
}
