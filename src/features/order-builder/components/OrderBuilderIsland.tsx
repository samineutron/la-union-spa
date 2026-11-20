import { useEffect } from 'preact/hooks';
import type { Product } from '../../../shared/types/product.types';
import { addToOrder, initOrderStore } from '../store/orderStore';
import { FloatingOrderBar } from './FloatingOrderBar';
import { OrderDrawer } from './OrderDrawer';

export function OrderBuilderIsland() {
  useEffect(() => {
    initOrderStore();

    const handleAddEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ product?: Product }>;
      const product = customEvent.detail?.product;
      if (product) {
        addToOrder(product, 1);
      }
    };

    window.addEventListener('launion:add-to-order', handleAddEvent);
    return () => {
      window.removeEventListener('launion:add-to-order', handleAddEvent);
    };
  }, []);

  return (
    <>
      <FloatingOrderBar />
      <OrderDrawer />
    </>
  );
}
