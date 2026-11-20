import { useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $secondaryFiltersCount } from '../store/filterStore';
import { SearchBar } from './SearchBar';
import { CategoryChips, FilterControls } from './FilterControls';

export function SearchFilterIsland() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const secondaryCount = useStore($secondaryFiltersCount);

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-2.5">
      {/* Fila superior: Buscador + botón desplegable en móvil */}
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar />
        </div>

        <button
          type="button"
          aria-expanded={mobileFiltersOpen}
          aria-controls="advanced-filter-panel"
          onClick={() => setMobileFiltersOpen((prev) => !prev)}
          className={`flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors sm:hidden ${
            mobileFiltersOpen || secondaryCount > 0
              ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]'
              : 'border-[var(--color-border-subtle)] bg-white text-[var(--color-text-main)]'
          }`}
        >
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
            <line x1="4" x2="20" y1="21" y2="21" />
            <line x1="4" x2="20" y1="14" y2="14" />
            <line x1="4" x2="20" y1="7" y2="7" />
            <circle cx="9" cy="7" r="2" />
            <circle cx="15" cy="14" r="2" />
            <circle cx="11" cy="21" r="2" />
          </svg>
          <span>Filtros</span>
          {secondaryCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[11px] font-extrabold text-white tabular-nums">
              {secondaryCount}
            </span>
          )}
          <svg
            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${
              mobileFiltersOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Chips horizontales de las 3 categorías fijas */}
      <CategoryChips />

      {/* Panel de filtros combinables (Producto, Marca, Orden A-Z, Stock) */}
      <div
        id="advanced-filter-panel"
        className={`${
          mobileFiltersOpen
            ? 'block rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)]/55 p-2.5'
            : 'hidden'
        } w-full min-w-0 max-w-full sm:block sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0`}
      >
        <FilterControls />
      </div>
    </div>
  );
}
