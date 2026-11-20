import { useStore } from '@nanostores/preact';
import type { SortOption } from '../../../shared/types/product.types';
import { $isLoading } from '../../catalog';
import { $sortBy, setSortBy } from '../store/filterStore';

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'producto-asc', label: 'Ordenar: Producto (A - Z)' },
  { value: 'marca-asc', label: 'Ordenar: Marca (A - Z)' },
  { value: 'categoria-asc', label: 'Ordenar: Categoría (A - Z)' },
  { value: 'precio-asc', label: 'Ordenar: Menor precio' },
];

export function SortSelect() {
  const sortBy = useStore($sortBy);
  const isLoading = useStore($isLoading);

  return (
    <div>
      <label htmlFor="sort-products-select" className="sr-only">
        Ordenar productos
      </label>
      <select
        id="sort-products-select"
        disabled={isLoading}
        value={sortBy}
        onChange={(e) => setSortBy((e.currentTarget as HTMLSelectElement).value as SortOption)}
        className="min-h-[44px] w-full cursor-pointer rounded-xl border border-[var(--color-border-subtle)] bg-white px-3 text-xs font-semibold text-[var(--color-text-main)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
