import { atom } from 'nanostores';
import { STORE_CONFIG } from '../../../shared/config/store.config';
import type { Product } from '../../../shared/types/product.types';
import { fetchProductsFromGoogleSheet } from '../services/sheetsCsvService';

interface CachedCatalogPayload {
  timestamp: number;
  products: Product[];
}

export const $products = atom<Product[]>([]);
export const $isLoading = atom<boolean>(true);
export const $error = atom<string | null>(null);
export const $isUsingCache = atom<boolean>(false);
export const $lastUpdated = atom<number | null>(null);

let inFlightRequest: Promise<void> | null = null;

function readProductsCache(): CachedCatalogPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORE_CONFIG.cacheKeyProducts);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCatalogPayload;
    if (!Array.isArray(parsed.products) || typeof parsed.timestamp !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeProductsCache(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CachedCatalogPayload = {
      timestamp: Date.now(),
      products,
    };
    window.localStorage.setItem(STORE_CONFIG.cacheKeyProducts, JSON.stringify(payload));
  } catch {
    // Ignorar errores de cuota o modo privado
  }
}

export async function initCatalog(forceRefresh = false): Promise<void> {
  if (inFlightRequest) {
    return inFlightRequest;
  }

  const cached = readProductsCache();
  const hasCachedProducts = Boolean(cached && cached.products.length > 0);
  const isCacheFresh = Boolean(
    cached && Date.now() - cached.timestamp < STORE_CONFIG.cacheTtlMs
  );

  if (hasCachedProducts && cached) {
    $products.set(cached.products);
    $lastUpdated.set(cached.timestamp);
    $isLoading.set(false);
    $error.set(null);

    if (isCacheFresh && !forceRefresh) {
      $isUsingCache.set(false);
      return;
    }
  } else {
    $isLoading.set(true);
    $error.set(null);
  }

  inFlightRequest = (async () => {
    try {
      const freshProducts = await fetchProductsFromGoogleSheet(STORE_CONFIG.googleSheetCsvUrl);
      $products.set(freshProducts);
      $lastUpdated.set(Date.now());
      $error.set(null);
      $isUsingCache.set(false);
      writeProductsCache(freshProducts);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido al cargar el catálogo.';

      if (hasCachedProducts) {
        // Fallback silencioso a caché local si falló la red
        $isUsingCache.set(true);
        $error.set(null);
      } else {
        $error.set(message);
        $isUsingCache.set(false);
      }
    } finally {
      $isLoading.set(false);
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
}

export function reloadCatalog(): Promise<void> {
  return initCatalog(true);
}
