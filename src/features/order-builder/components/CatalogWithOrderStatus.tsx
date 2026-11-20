import { useStore } from '@nanostores/preact';
import { FilteredCatalogIsland } from '../../search-filter';
import { $orderQuantities } from '../store/orderStore';

/**
 * Conecta las cantidades activas del pedido con las tarjetas del catálogo
 * filtrado sin acoplar la lógica interna entre módulos.
 */
export function CatalogWithOrderStatus() {
  const orderQuantities = useStore($orderQuantities);

  return <FilteredCatalogIsland orderQuantities={orderQuantities} />;
}
