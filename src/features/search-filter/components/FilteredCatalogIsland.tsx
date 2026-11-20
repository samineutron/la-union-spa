import { useStore } from '@nanostores/preact';
import { CatalogIsland, type ProductGridProps } from '../../catalog';
import {
  $filteredProducts,
  $hasActiveFilters,
  $query,
  clearAllFilters,
} from '../store/filterStore';

export type FilteredCatalogIslandProps = Omit<
  ProductGridProps,
  'products' | 'hasActiveFilters' | 'onClearFilters'
>;

export function FilteredCatalogIsland(props: FilteredCatalogIslandProps) {
  const filteredProducts = useStore($filteredProducts);
  const hasActiveFilters = useStore($hasActiveFilters);
  const query = useStore($query);

  const trimmedQuery = query.trim();

  return (
    <div>
      {hasActiveFilters && filteredProducts.length === 0 && trimmedQuery.length > 0 && (
        <div
          role="status"
          className="mb-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-center text-xs text-[var(--color-text-muted)] sm:text-sm"
        >
          No encontramos productos para{' '}
          <strong className="font-bold text-[var(--color-text-main)]">
            &ldquo;{trimmedQuery}&rdquo;
          </strong>
        </div>
      )}

      <CatalogIsland
        {...props}
        products={filteredProducts}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />
    </div>
  );
}
