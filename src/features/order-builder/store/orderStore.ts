import { atom, computed } from 'nanostores';
import { STORE_CONFIG } from '../../../shared/config/store.config';
import type { OrderItem, Product } from '../../../shared/types/product.types';
import { $products } from '../../catalog';
import {
  calculateOrderSummary,
  type CalculatedOrderSummary,
} from '../utils/pricingCalculator';

export const $orderItems = atom<OrderItem[]>([]);
export const $isDrawerOpen = atom<boolean>(false);
export const $stockAdjustmentNotice = atom<string | null>(null);

let isHydrated = false;

function readOrderFromStorage(): OrderItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORE_CONFIG.cacheKeyOrder);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is OrderItem =>
        entry &&
        typeof entry.productId === 'string' &&
        typeof entry.cantidad === 'number' &&
        Number.isFinite(entry.cantidad) &&
        entry.cantidad > 0
    );
  } catch {
    return [];
  }
}

function writeOrderToStorage(items: OrderItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_CONFIG.cacheKeyOrder, JSON.stringify(items));
  } catch {
    // Ignorar errores de almacenamiento privado
  }
}

export function initOrderStore(): void {
  if (isHydrated || typeof window === 'undefined') return;
  isHydrated = true;

  const saved = readOrderFromStorage();
  if (saved.length > 0) {
    $orderItems.set(saved);
  }

  $orderItems.subscribe((items) => {
    writeOrderToStorage(items);
  });
}

/**
 * Sincroniza cantidades guardadas en localStorage contra el stock actualizado
 * de Google Sheets. Si un producto bajó su stock (pero sigue > 0), recorta la
 * cantidad al máximo disponible. Si pasó a 0, lo mantiene para mostrar alerta roja.
 */
$products.subscribe((products) => {
  if (!products || products.length === 0) return;
  const currentItems = $orderItems.get();
  if (currentItems.length === 0) return;

  const productMap = new Map<string, Product>();
  for (const p of products) {
    productMap.set(p.id, p);
  }

  let changed = false;
  let adjustedCount = 0;

  const nextItems = currentItems.map((item) => {
    const prod = productMap.get(item.productId);
    if (!prod) return item;

    if (prod.stock > 0 && item.cantidad > prod.stock) {
      changed = true;
      adjustedCount++;
      return { ...item, cantidad: prod.stock };
    }
    return item;
  });

  if (changed) {
    $orderItems.set(nextItems);
    $stockAdjustmentNotice.set(
      adjustedCount === 1
        ? 'Se ajustó la cantidad de 1 producto según el stock actual disponible.'
        : `Se ajustaron las cantidades de ${adjustedCount} productos según el stock actual disponible.`
    );
  }
});

/**
 * Mapa rápido { [productId]: cantidad } para mostrar insignias en las tarjetas
 */
export const $orderQuantities = computed([$orderItems], (items): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const item of items) {
    if (item.cantidad > 0) {
      map[item.productId] = item.cantidad;
    }
  }
  return map;
});

/**
 * Resumen completo del pedido con precios condicionales xMayor y detección de agotados
 */
export const $orderSummary = computed(
  [$orderItems, $products],
  (items, products): CalculatedOrderSummary => {
    return calculateOrderSummary(items, products);
  }
);

export function addToOrder(product: Product, delta = 1): void {
  if (product.stock <= 0 || delta <= 0) return;

  const current = $orderItems.get();
  const idx = current.findIndex((i) => i.productId === product.id);

  if (idx === -1) {
    const initialQty = Math.min(delta, product.stock);
    $orderItems.set([...current, { productId: product.id, cantidad: initialQty }]);
    return;
  }

  const existing = current[idx];
  const nextQty = Math.min(existing.cantidad + delta, product.stock);
  if (nextQty === existing.cantidad) return;

  const copy = [...current];
  copy[idx] = { ...existing, cantidad: nextQty };
  $orderItems.set(copy);
}

export function updateItemQuantity(productId: string, nextCantidad: number): void {
  const current = $orderItems.get();
  if (nextCantidad <= 0) {
    removeItem(productId);
    return;
  }

  const product = $products.get().find((p) => p.id === productId);
  const maxAllowed = product && product.stock > 0 ? product.stock : nextCantidad;
  const clamped = Math.max(1, Math.min(Math.floor(nextCantidad), maxAllowed));

  const copy = current.map((item) =>
    item.productId === productId ? { ...item, cantidad: clamped } : item
  );
  $orderItems.set(copy);
}

export function incrementItem(productId: string): void {
  const current = $orderItems.get().find((i) => i.productId === productId);
  if (!current) return;
  updateItemQuantity(productId, current.cantidad + 1);
}

export function decrementItem(productId: string): void {
  const current = $orderItems.get().find((i) => i.productId === productId);
  if (!current) return;
  updateItemQuantity(productId, current.cantidad - 1);
}

export function removeItem(productId: string): void {
  $orderItems.set($orderItems.get().filter((i) => i.productId !== productId));
}

export function clearOrder(): void {
  $orderItems.set([]);
  $stockAdjustmentNotice.set(null);
}

export function openDrawer(): void {
  $isDrawerOpen.set(true);
}

export function closeDrawer(): void {
  $isDrawerOpen.set(false);
}

export function dismissStockNotice(): void {
  $stockAdjustmentNotice.set(null);
}
