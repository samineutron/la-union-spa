import { atom, computed } from 'nanostores';
import type {
  Product,
  ProductCategory,
  SortOption,
} from '../../../shared/types/product.types';
import { $products } from '../../catalog';
import {
  extractUniqueSortedValues,
  filterAndSortProducts,
} from '../utils/filterAndSortProducts';

export const $query = atom<string>('');
export const $categoria = atom<ProductCategory | 'ALL'>('ALL');
export const $marca = atom<string>('ALL');
export const $producto = atom<string>('ALL');
export const $onlyInStock = atom<boolean>(false);
export const $sortBy = atom<SortOption>('producto-asc');

/**
 * Opciones dinámicas de Marca según la categoría seleccionada
 */
export const $availableMarcas = computed([$products, $categoria], (products, categoria) => {
  const scoped =
    categoria === 'ALL'
      ? products
      : products.filter((p) => p.categoria === categoria);

  return extractUniqueSortedValues(scoped.map((p) => p.marca));
});

/**
 * Opciones dinámicas de tipo de Producto según categoría y marca seleccionadas
 */
export const $availableProductos = computed(
  [$products, $categoria, $marca],
  (products, categoria, marca) => {
    const scoped = products.filter((p) => {
      if (categoria !== 'ALL' && p.categoria !== categoria) return false;
      if (marca !== 'ALL' && p.marca !== marca) return false;
      return true;
    });

    return extractUniqueSortedValues(scoped.map((p) => p.producto));
  }
);

/**
 * Sincronización defensiva: si al cambiar categoría o recargar inventario
 * un filtro combinado queda inválido (sin coincidencias posibles), se resetea.
 */
$availableMarcas.subscribe((marcas) => {
  const currentMarca = $marca.get();
  if (currentMarca !== 'ALL' && marcas.length > 0 && !marcas.includes(currentMarca)) {
    $marca.set('ALL');
  }
});

$availableProductos.subscribe((productos) => {
  const currentProducto = $producto.get();
  if (
    currentProducto !== 'ALL' &&
    productos.length > 0 &&
    !productos.includes(currentProducto)
  ) {
    $producto.set('ALL');
  }
});

/**
 * Lista final filtrada y ordenada en < 50ms en memoria
 */
export const $filteredProducts = computed(
  [$products, $query, $categoria, $marca, $producto, $onlyInStock, $sortBy],
  (products, query, categoria, marca, producto, onlyInStock, sortBy): Product[] => {
    return filterAndSortProducts(products, {
      query,
      categoria,
      marca,
      producto,
      onlyInStock,
      sortBy,
    });
  }
);

/**
 * Indica si existe algún filtro o término de búsqueda activo
 */
export const $hasActiveFilters = computed(
  [$query, $categoria, $marca, $producto, $onlyInStock],
  (query, categoria, marca, producto, onlyInStock): boolean => {
    return (
      query.trim().length > 0 ||
      categoria !== 'ALL' ||
      marca !== 'ALL' ||
      producto !== 'ALL' ||
      onlyInStock
    );
  }
);

/**
 * Cantidad de filtros secundarios activos (para badge en móvil)
 */
export const $secondaryFiltersCount = computed(
  [$marca, $producto, $onlyInStock],
  (marca, producto, onlyInStock): number => {
    let count = 0;
    if (marca !== 'ALL') count++;
    if (producto !== 'ALL') count++;
    if (onlyInStock) count++;
    return count;
  }
);

export function setQuery(value: string): void {
  $query.set(value);
}

export function setCategoria(value: ProductCategory | 'ALL'): void {
  $categoria.set(value);
}

export function setMarca(value: string): void {
  $marca.set(value);
}

export function setProducto(value: string): void {
  $producto.set(value);
}

export function setOnlyInStock(value: boolean): void {
  $onlyInStock.set(value);
}

export function setSortBy(value: SortOption): void {
  $sortBy.set(value);
}

export function clearAllFilters(): void {
  $query.set('');
  $categoria.set('ALL');
  $marca.set('ALL');
  $producto.set('ALL');
  $onlyInStock.set(false);
}
