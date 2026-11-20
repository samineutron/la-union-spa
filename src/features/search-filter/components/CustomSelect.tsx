import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  id: string;
  ariaLabel: string;
  sheetTitle: string;
  prefixLabel?: string;
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  isActiveFilter?: boolean;
  searchableThreshold?: number;
}

export function CustomSelect({
  id,
  ariaLabel,
  sheetTitle,
  prefixLabel,
  value,
  options,
  onChange,
  disabled = false,
  isActiveFilter = false,
  searchableThreshold = 9,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 639px)');
    const updateMatch = () => setIsMobileViewport(media.matches);
    updateMatch();

    media.addEventListener('change', updateMatch);
    return () => media.removeEventListener('change', updateMatch);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setLocalSearch('');
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    if (isMobileViewport) {
      document.body.style.overflow = 'hidden';
    } else {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobileViewport]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) ?? options[0],
    [options, value]
  );

  const showSearchInput = options.length >= searchableThreshold;

  const visibleOptions = useMemo(() => {
    const term = localSearch.trim().toLowerCase();
    if (!term) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, localSearch]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  const renderOptionsList = () => {
    if (visibleOptions.length === 0) {
      return (
        <div className="px-4 py-6 text-center text-xs text-[var(--color-text-muted)]">
          Sin coincidencias para &ldquo;{localSearch.trim()}&rdquo;
        </div>
      );
    }

    return (
      <ul
        id={listboxId}
        role="listbox"
        aria-label={ariaLabel}
        className="divide-y divide-slate-100"
      >
        {visibleOptions.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <li key={opt.value} role="option" aria-selected={isSelected}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  isSelected
                    ? 'bg-blue-50 font-bold text-[var(--color-primary)]'
                    : 'font-medium text-[var(--color-text-main)] hover:bg-slate-50 active:bg-blue-50/60'
                }`}
              >
                <span className="min-w-0 flex-1 break-words leading-snug">
                  {opt.label}
                </span>
                {isSelected && (
                  <svg
                    className="h-4 w-4 shrink-0 text-[var(--color-primary)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex min-h-[44px] w-full min-w-0 max-w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 text-left text-xs font-semibold transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${
          isActiveFilter
            ? 'border-[var(--color-primary)] bg-blue-50/75 text-[var(--color-primary-dark)]'
            : 'border-[var(--color-border-subtle)] bg-white text-[var(--color-text-main)] hover:border-blue-300'
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {prefixLabel ? (
            <>
              <span className="text-[var(--color-text-muted)] font-medium">
                {prefixLabel}:{' '}
              </span>
              <span>{selectedOption?.label ?? ''}</span>
            </>
          ) : (
            selectedOption?.label ?? ''
          )}
        </span>

        <svg
          className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[var(--color-primary)]' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Móvil (< 640px): Bottom Sheet modal portaled al body para nunca desbordar la pantalla */}
      {isOpen &&
        isMobileViewport &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 backdrop-blur-[1px]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={sheetTitle}
              className="flex max-h-[78dvh] w-full max-w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl"
            >
              {/* Indicador visual superior */}
              <div className="flex justify-center pt-2 pb-1" aria-hidden="true">
                <span className="h-1 w-10 rounded-full bg-slate-300" />
              </div>

              {/* Cabecera del selector */}
              <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border-subtle)] px-4 py-2.5">
                <h3 className="min-w-0 flex-1 truncate text-sm font-extrabold text-[var(--color-text-main)]">
                  {sheetTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar opciones"
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)]/60 text-[var(--color-text-main)] active:bg-blue-100"
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
              </div>

              {/* Buscador rápido interno si hay muchas opciones */}
              {showSearchInput && (
                <div className="border-b border-slate-100 bg-[var(--color-bg-page)]/40 px-4 py-2.5">
                  <input
                    ref={searchInputRef}
                    type="search"
                    inputMode="search"
                    value={localSearch}
                    onInput={(e) =>
                      setLocalSearch((e.currentTarget as HTMLInputElement).value)
                    }
                    placeholder="Filtrar opciones..."
                    className="min-h-[40px] w-full rounded-xl border border-[var(--color-border-subtle)] bg-white px-3 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </div>
              )}

              {/* Lista scrolleable contenida dentro del ancho de pantalla */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
                {renderOptionsList()}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Escritorio / Tablet (>= 640px): Popover anclado al botón */}
      {isOpen && !isMobileViewport && (
        <div className="absolute top-full left-0 z-40 mt-1.5 w-full min-w-[210px] max-w-full overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-white shadow-xl">
          {showSearchInput && (
            <div className="border-b border-slate-100 bg-[var(--color-bg-page)]/40 p-2">
              <input
                type="search"
                value={localSearch}
                onInput={(e) =>
                  setLocalSearch((e.currentTarget as HTMLInputElement).value)
                }
                placeholder="Buscar opción..."
                className="min-h-[36px] w-full rounded-lg border border-[var(--color-border-subtle)] bg-white px-2.5 text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          )}
          <div className="max-h-72 overflow-y-auto overscroll-contain">
            {renderOptionsList()}
          </div>
        </div>
      )}
    </div>
  );
}
