export const STORE_CONFIG = {
  storeName: 'La Unión SpA — Bodega Maipú',
  locationLabel: 'Maipú, Santiago · Retiro en local o despacho a domicilio',
  whatsappNumber: '56900000000', // REEMPLAZAR MANUALMENTE (formato: 569 + 8 dígitos, sin + ni espacios)
  googleSheetCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZxSnjGH6UQxbyCxHdgjNRO0v0S4vyMNnNSIgJoqX2-cXn-Y4pm9wLcXdoTjjl9BMZgXE6MP7AUMrX/pub?output=csv',
  cacheKeyProducts: 'bodega_maipu_products_v1',
  cacheKeyOrder: 'bodega_maipu_order_v1',
  cacheTtlMs: 1000 * 60 * 5, // 5 minutos antes de forzar refresco en segundo plano
} as const;
