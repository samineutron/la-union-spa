import { useStore } from '@nanostores/preact';
import type { SortOption } from '../../../shared/types/product.types';
import { $isLoading } from '../../catalog';
import { $sortBy, setSortBy } from '../store/filterStore';
import { CustomSelect, type CustomSelectOption } from './CustomSelect';

const SORT_OPTIONS: CustomSelectOption[] = [
  { value: 'producto-asc', label: 'Producto (A - Z)' },
  { value: 'marca-asc', label: 'Marca (A - Z)' },
  { value: 'categoria-asc', label: 'Categoría (A - Z)' },
  { value: 'precio-asc', label: 'Menor precio' },
];

export function SortSelect() {
  const sortBy = useStore($sortBy);
  const isLoading = useStore($isLoading);

  return (
    <CustomSelect
      id="sort-products-select"
      ariaLabel="Ordenar productos"
      sheetTitle="Ordenar productos por"
      prefixLabel="Ordenar"
      disabled={isLoading}
      value={sortBy}
      options={SORT_OPTIONS}
      onChange={(val) => setSortBy(val as SortOption)}
      isActiveFilter={sortBy !== 'producto-asc'}
      searchableThreshold={99}
    />
  );
}
