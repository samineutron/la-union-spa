import type {
  CalculatedOrderLine,
  OrderItem,
  Product,
} from '../../../shared/types/product.types';

export interface OutOfStockOrderLine {
  product: Product;
  requestedCantidad: number;
}

export interface CalculatedOrderSummary {
  lines: CalculatedOrderLine[];
  outOfStockLines: OutOfStockOrderLine[];
  totalUnits: number;
  totalAmount: number;
  totalSavings: number;
  hasWholesaleApplied: boolean;
}

/**
 * Calcula una línea de pedido aplicando estrictamente la regla condicional de xMayor:
 * - Si xMayor <= 0 o precioMayorista <= 0: nunca se aplica ni se muestra mayorista.
 * - Si xMayor > 0 y precioMayorista > 0: se activa solo cuando cantidad >= xMayor del mismo producto.
 */
export function calculateOrderLine(
  product: Product,
  cantidad: number
): CalculatedOrderLine {
  const safeQty = Math.max(1, Math.min(Math.floor(cantidad), Math.max(1, product.stock)));

  const tieneMayorista = product.xMayor > 0 && product.precioMayorista > 0;
  const esMayorista = tieneMayorista && safeQty >= product.xMayor;

  const precioUnitarioAplicado = esMayorista
    ? product.precioMayorista
    : product.precioOferta;

  const subtotal = precioUnitarioAplicado * safeQty;

  const precioReferencia = Math.max(product.precioNormal, product.precioOferta);
  const ahorroLinea = Math.max(0, (precioReferencia - precioUnitarioAplicado) * safeQty);

  const unidadesFaltantesMayorista =
    tieneMayorista && !esMayorista ? Math.max(0, product.xMayor - safeQty) : 0;

  return {
    product,
    cantidad: safeQty,
    tieneMayorista,
    esMayorista,
    precioUnitarioAplicado,
    subtotal,
    ahorroLinea,
    unidadesFaltantesMayorista,
  };
}

export function calculateOrderSummary(
  items: OrderItem[],
  products: Product[]
): CalculatedOrderSummary {
  const productMap = new Map<string, Product>();
  for (const p of products) {
    productMap.set(p.id, p);
  }

  const lines: CalculatedOrderLine[] = [];
  const outOfStockLines: OutOfStockOrderLine[] = [];

  let totalUnits = 0;
  let totalAmount = 0;
  let totalSavings = 0;
  let hasWholesaleApplied = false;

  for (const item of items) {
    if (item.cantidad <= 0) continue;
    const product = productMap.get(item.productId);
    if (!product) continue;

    if (product.stock <= 0) {
      outOfStockLines.push({
        product,
        requestedCantidad: item.cantidad,
      });
      continue;
    }

    const line = calculateOrderLine(product, item.cantidad);
    lines.push(line);

    totalUnits += line.cantidad;
    totalAmount += line.subtotal;
    totalSavings += line.ahorroLinea;
    if (line.esMayorista) {
      hasWholesaleApplied = true;
    }
  }

  return {
    lines,
    outOfStockLines,
    totalUnits,
    totalAmount,
    totalSavings,
    hasWholesaleApplied,
  };
}
