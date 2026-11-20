// Contrato público del módulo `order-builder`
// Ningún módulo externo debe importar archivos internos fuera de este index.ts

export { OrderBuilderIsland } from './components/OrderBuilderIsland';
export { CatalogWithOrderStatus } from './components/CatalogWithOrderStatus';
export { FloatingOrderBar } from './components/FloatingOrderBar';
export { OrderDrawer } from './components/OrderDrawer';
export { OrderItemRow, OutOfStockItemRow } from './components/OrderItemRow';

export {
  $orderItems,
  $isDrawerOpen,
  $stockAdjustmentNotice,
  $orderQuantities,
  $orderSummary,
  initOrderStore,
  addToOrder,
  updateItemQuantity,
  incrementItem,
  decrementItem,
  removeItem,
  clearOrder,
  openDrawer,
  closeDrawer,
  dismissStockNotice,
} from './store/orderStore';

export {
  calculateOrderLine,
  calculateOrderSummary,
} from './utils/pricingCalculator';
export type {
  OutOfStockOrderLine,
  CalculatedOrderSummary,
} from './utils/pricingCalculator';

export {
  buildOrderTextMessage,
  buildWhatsAppUrl,
} from './utils/whatsappFormatter';
