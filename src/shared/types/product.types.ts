export type ProductCategory =
  | 'Artículos de aseo'
  | 'Artículos escolares'
  | 'Artículos aseo personal';

export interface Product {
  id: string;
  codigoBarras: string;
  categoria: ProductCategory;
  producto: string;        // Ej: "Cloro", "Detergente", "Aromatizante"
  marca: string;           // Ej: "Clorinda", "Arom"
  nombre: string;          // Ej: "Cloro Gel Ropa Color"
  variante: string;        // Ej: "Ropa Color", "Vainilla"
  contenido: string;       // Ej: "1000 ml", "50 mts"
  stock: number;           // Entero >= 0 (0 = AGOTADO)
  precioNormal: number;    // Entero CLP (se muestra tachado solo si > precioOferta)
  precioOferta: number;    // Entero CLP (precio descuento/bodega desde 1 unidad)
  precioMayorista: number; // Entero CLP (solo activo si xMayor > 0 y precioMayorista > 0)
  xMayor: number;          // <= 0: sin precio mayorista | > 0: umbral de unidades para activarlo
  imagen: string;          // URL directa o vacío ""
}

export interface OrderItem {
  productId: string;
  cantidad: number;
}

export interface CalculatedOrderLine {
  product: Product;
  cantidad: number;
  tieneMayorista: boolean;            // true solo si product.xMayor > 0 && product.precioMayorista > 0
  esMayorista: boolean;               // true solo si tieneMayorista && cantidad >= product.xMayor
  precioUnitarioAplicado: number;
  subtotal: number;
  ahorroLinea: number;
  unidadesFaltantesMayorista: number; // 0 si !tieneMayorista o si ya alcanzó xMayor
}

export type SortOption =
  | 'producto-asc'
  | 'marca-asc'
  | 'categoria-asc'
  | 'precio-asc';
