import { useMemo } from 'preact/hooks';
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
import { CustomSelect, type CustomSelectOption } from './CustomSelect';
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
      className="no-scrollbar flex w-full max-w-full items-center gap-1.5 overflow-x-auto py-0.5"
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
            className={`min-h-[40px] shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
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

  const productoOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: 'ALL', label: `Todos (${availableProductos.length})` },
      ...availableProductos.map((prod) => ({ value: prod, label: prod })),
    ],
    [availableProductos]
  );

  const marcaOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: 'ALL', label: `Todas (${availableMarcas.length})` },
      ...availableMarcas.map((brand) => ({ value: brand, label: brand })),
    ],
    [availableMarcas]
  );

  return (
    <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
      {/* Filtro por Tipo de Producto */}
      <div className="min-w-0 w-full lg:min-w-[185px] lg:flex-1">
        <CustomSelect
          id="filter-producto-select"
          ariaLabel="Filtrar por tipo de producto"
          sheetTitle="Filtrar por tipo de producto"
          prefixLabel="Producto"
          disabled={isLoading}
          value={producto}
          options={productoOptions}
          onChange={setProducto}
          isActiveFilter={producto !== 'ALL'}
        />
      </div>

      {/* Filtro por Marca */}
      <div className="min-w-0 w-full lg:min-w-[185px] lg:flex-1">
        <CustomSelect
          id="filter-marca-select"
          ariaLabel="Filtrar por marca"
          sheetTitle="Filtrar por marca"
          prefixLabel="Marca"
          disabled={isLoading}
          value={marca}
          options={marcaOptions}
          onChange={setMarca}
          isActiveFilter={marca !== 'ALL'}
        />
      </div>

      {/* Selector de Ordenamiento A-Z / Precio */}
      <div className="min-w-0 w-full lg:min-w-[205px] lg:flex-1">
        <SortSelect />
      </div>

      {/* Toggle rápido: Solo disponibles con stock */}
      <label className="flex min-h-[44px] w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-white px-3.5 text-xs font-semibold text-[var(--color-text-main)] select-none transition-colors hover:bg-blue-50/70 sm:w-auto sm:justify-center sm:bg-[var(--color-bg-page)]/60 sm:text-sm">
        <span className="truncate">Solo disponibles con stock</span>
        <input
          type="checkbox"
          disabled={isLoading}
          checked={onlyInStock}
          onChange={(e) => setOnlyInStock((e.currentTarget as HTMLInputElement).checked)}
          className="h-4 w-4 shrink-0 accent-[var(--color-primary)]"
        />
      </label>

      {/* Botón Limpiar Filtros */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => clearAllFilters()}
          className="flex min-h-[44px] w-full min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-[var(--color-soldout-bg)] px-3.5 text-xs font-bold text-[var(--color-soldout)] transition-colors hover:bg-red-100 sm:w-auto sm:text-sm"
        >
          <span aria-hidden="true">✕</span>
          <span>Limpiar filtros</span>
        </button>
      )}
    </div>
  );
}
