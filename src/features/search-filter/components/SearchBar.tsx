import { useStore } from '@nanostores/preact';
import { $isLoading } from '../../catalog';
import { $query, setQuery } from '../store/filterStore';

export function SearchBar() {
  const query = useStore($query);
  const isLoading = useStore($isLoading);

  return (
    <div className="relative flex-1">
      <label htmlFor="catalog-search-input" className="sr-only">
        Buscar productos por nombre, marca, variante, contenido o código de barras
      </label>

      <span
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>

      <input
        id="catalog-search-input"
        type="search"
        inputMode="search"
        autoComplete="off"
        spellcheck={false}
        disabled={isLoading}
        value={query}
        onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
        placeholder="Buscar cloro, detergente, marca, aroma, código..."
        className="min-h-[44px] w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)]/65 pr-11 pl-10 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />

      {query.length > 0 && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="Limpiar texto de búsqueda"
          className="absolute inset-y-0 right-1 my-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-blue-100/70 hover:text-[var(--color-text-main)]"
        >
          <svg
            className="h-4 w-4"
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
      )}
    </div>
  );
}
