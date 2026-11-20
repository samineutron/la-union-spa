import type {
  Product,
  ProductCategory,
  SortOption,
} from '../../../shared/types/product.types';
import { normalizeText, tokenizeQuery } from './normalizeText';

export const FIXED_CATEGORIES: readonly ProductCategory[] = [
  'Artículos de aseo',
  'Artículos escolares',
  'Artículos aseo personal',
] as const;

export interface ProductFilterCriteria {
  query: string;
  categoria: ProductCategory | 'ALL';
  marca: string;
  producto: string;
  onlyInStock?: boolean;
  sortBy: SortOption;
}

const spanishCollator = new Intl.Collator('es-CL', {
  sensitivity: 'base',
  numeric: true,
});

function buildSearchableText(product: Product): string {
  return normalizeText(
    [
      product.nombre,
      product.marca,
      product.producto,
      product.variante,
      product.contenido,
      product.codigoBarras,
    ].join(' ')
  );
}

export function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const copy = [...products];

  copy.sort((a, b) => {
    switch (sortBy) {
      case 'marca-asc': {
        const byMarca = spanishCollator.compare(a.marca, b.marca);
        if (byMarca !== 0) return byMarca;
        const byProducto = spanishCollator.compare(a.producto, b.producto);
        if (byProducto !== 0) return byProducto;
        return spanishCollator.compare(a.nombre, b.nombre);
      }

      case 'categoria-asc': {
        const byCat = spanishCollator.compare(a.categoria, b.categoria);
        if (byCat !== 0) return byCat;
        const byProducto = spanishCollator.compare(a.producto, b.producto);
        if (byProducto !== 0) return byProducto;
        return spanishCollator.compare(a.nombre, b.nombre);
      }

      case 'precio-asc': {
        const byPrice = a.precioOferta - b.precioOferta;
        if (byPrice !== 0) return byPrice;
        return spanishCollator.compare(a.nombre, b.nombre);
      }

      case 'producto-asc':
      default: {
        const byProducto = spanishCollator.compare(a.producto, b.producto);
        if (byProducto !== 0) return byProducto;
        const byMarca = spanishCollator.compare(a.marca, b.marca);
        if (byMarca !== 0) return byMarca;
        return spanishCollator.compare(a.nombre, b.nombre);
      }
    }
  });

  return copy;
}

export function filterAndSortProducts(
  products: Product[],
  criteria: ProductFilterCriteria
): Product[] {
  const tokens = tokenizeQuery(criteria.query);

  const filtered = products.filter((item) => {
    if (criteria.onlyInStock && item.stock <= 0) {
      return false;
    }

    if (criteria.categoria !== 'ALL' && item.categoria !== criteria.categoria) {
      return false;
    }

    if (criteria.marca !== 'ALL' && item.marca !== criteria.marca) {
      return false;
    }

    if (criteria.producto !== 'ALL' && item.producto !== criteria.producto) {
      return false;
    }

    if (tokens.length > 0) {
      const haystack = buildSearchableText(item);
      for (let i = 0; i < tokens.length; i++) {
        if (!haystack.includes(tokens[i])) {
          return false;
        }
      }
    }

    return true;
  });

  return sortProducts(filtered, criteria.sortBy);
}

export function extractUniqueSortedValues(values: string[]): string[] {
  const unique = new Set<string>();
  for (const val of values) {
    const trimmed = val.trim();
    if (trimmed) {
      unique.add(trimmed);
    }
  }
  return Array.from(unique).sort((a, b) => spanishCollator.compare(a, b));
}
