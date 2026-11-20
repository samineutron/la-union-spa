import { useEffect } from 'preact/hooks';
import { initCatalog } from '../store/catalogStore';
import { ProductGrid, type ProductGridProps } from './ProductGrid';

export function CatalogIsland(props: ProductGridProps) {
  useEffect(() => {
    void initCatalog();
  }, []);

  return <ProductGrid {...props} />;
}
