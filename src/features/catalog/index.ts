// Contrato público del módulo `catalog`
// Ningún módulo externo debe importar archivos internos fuera de este index.ts

export { CatalogIsland } from './components/CatalogIsland';
export { ProductGrid } from './components/ProductGrid';
export type { ProductGridProps } from './components/ProductGrid';
export { ProductCard } from './components/ProductCard';
export type { ProductCardProps } from './components/ProductCard';
export { SkeletonCard } from './components/SkeletonCard';

export {
  $products,
  $isLoading,
  $error,
  $isUsingCache,
  $lastUpdated,
  initCatalog,
  reloadCatalog,
} from './store/catalogStore';
