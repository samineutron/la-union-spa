// Contrato público del módulo `search-filter`
// Ningún módulo externo debe importar archivos internos fuera de este index.ts

export { SearchFilterIsland } from './components/SearchFilterIsland';
export { FilteredCatalogIsland } from './components/FilteredCatalogIsland';
export type { FilteredCatalogIslandProps } from './components/FilteredCatalogIsland';
export { SearchBar } from './components/SearchBar';
export { FilterControls, CategoryChips } from './components/FilterControls';
export { SortSelect } from './components/SortSelect';
export { CustomSelect } from './components/CustomSelect';
export type { CustomSelectOption, CustomSelectProps } from './components/CustomSelect';

export {
  $query,
  $categoria,
  $marca,
  $producto,
  $onlyInStock,
  $sortBy,
  $availableMarcas,
  $availableProductos,
  $filteredProducts,
  $hasActiveFilters,
  $secondaryFiltersCount,
  setQuery,
  setCategoria,
  setMarca,
  setProducto,
  setOnlyInStock,
  setSortBy,
  clearAllFilters,
} from './store/filterStore';
