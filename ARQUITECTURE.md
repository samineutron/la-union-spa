# ARQUITECTURE.md — Memoria Maestra de Ingeniería

## 1. Stack Tecnológico y Entorno

* **Framework Principal:** Astro `^5.x` (Template vacío, salida estática `output: 'static'` para alojamiento en HostGator cPanel).
* **Islas Interactivas:** `@astrojs/preact@^6.1.6` + `preact@^11.2.0` con TypeScript estricto (`jsxImportSource: "preact"`).
* **Estilos:** `tailwindcss@^4.3.5` + `@tailwindcss/vite@^4.3.5` con tokens CSS nativos (`@theme`) para la **Paleta B (Azul Cobalto Mayorista)**.
* **Fuente de Datos:** Google Sheets publicado en la web en formato CSV (`fetch` en cliente con caché y respaldo en `localStorage`).
* **Gestión de Estado Desacoplada:** `nanostores` + `@nanostores/preact` para comunicar los módulos `catalog`, `search-filter` y `order-builder` sin acoplamiento directo.

---

## 2. Árbol de Carpetas Modular

```text
/
├── public/
│   ├── fallback/                  # SVGs de respaldo por categoría (aseo, escolar, personal, default)
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── features/                  # Dominios funcionales estrictamente aislados
│   │   ├── catalog/
│   │   │   ├── components/        # CatalogIsland.tsx, ProductCard.tsx, ProductGrid.tsx, SkeletonCard.tsx
│   │   │   ├── services/          # sheetsCsvService.ts (fetch, parser CSV y validación)
│   │   │   ├── store/             # catalogStore.ts (estado de productos, loading, error, caché)
│   │   │   └── index.ts           # Contrato público del módulo
│   │   ├── search-filter/
│   │   │   ├── components/        # SearchFilterIsland.tsx, FilteredCatalogIsland.tsx, SearchBar.tsx, FilterControls.tsx, SortSelect.tsx
│   │   │   ├── utils/             # normalizeText.ts, filterAndSortProducts.ts
│   │   │   ├── store/             # filterStore.ts (query, categoria, marca, producto, onlyInStock, sortBy)
│   │   │   └── index.ts           # Contrato público del módulo
│   │   └── order-builder/
│   │       ├── components/        # OrderBuilderIsland.tsx, CatalogWithOrderStatus.tsx, FloatingOrderBar.tsx, OrderDrawer.tsx, OrderItemRow.tsx
│   │       ├── utils/             # pricingCalculator.ts, whatsappFormatter.ts
│   │       ├── store/             # orderStore.ts (ítems persistidos en localStorage + validación stock)
│   │       └── index.ts           # Contrato público del módulo
│   ├── shared/                    # Utilidades transversales sin lógica de dominio específico
│   │   ├── config/
│   │   │   └── store.config.ts    # Número de WhatsApp, URL CSV de Google Sheets y datos del local
│   │   ├── types/
│   │   │   └── product.types.ts   # Interfaces globales compartidas
│   │   ├── utils/
│   │   │   └── formatCurrency.ts  # Formateador CLP ($1.990)
│   │   └── components/
│   │       └── Header.astro       # Cabecera estática con info de Maipú y reglas de venta
│   ├── styles/
│   │   └── global.css             # Tokens de color Paleta B, utilidades y franja diagonal AGOTADO
│   └── pages/
│       └── index.astro            # Punto de ensamblaje principal (slots de módulos)
├── astro.config.mjs
├── tsconfig.json
├── PRD.md
└── ARQUITECTURE.md
```

---

## 3. Esquema de Google Sheets y Contratos de Datos (`src/shared/types/product.types.ts`)

### Encabezados exactos de Google Sheets (Fila 1 — 14 columnas):
`id` | `codigoBarras` | `categoria` | `producto` | `marca` | `nombre` | `variante` | `contenido` | `stock` | `precioNormal` | `precioOferta` | `precioMayorista` | `xMayor` | `imagen`

### Interfaces TypeScript Compartidas:

```typescript
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
```

---

## 4. Archivo de Configuración Centralizada (`src/shared/config/store.config.ts`)

El administrador solo edita este archivo para conectar su Google Sheet y su número de WhatsApp:

```typescript
export const STORE_CONFIG = {
  storeName: 'La Unión SpA — Bodega Maipú',
  locationLabel: 'Maipú, Santiago · Retiro en local o despacho a domicilio',
  whatsappNumber: '56900000000', // REEMPLAZAR MANUALMENTE (formato: 569 + 8 dígitos, sin + ni espacios)
  googleSheetCsvUrl: 'PEGAR_AQUI_URL_CSV_PUBLICADO_DE_GOOGLE_SHEETS',
  cacheKeyProducts: 'bodega_maipu_products_v1',
  cacheKeyOrder: 'bodega_maipu_order_v1',
  cacheTtlMs: 1000 * 60 * 5, // 5 minutos antes de forzar refresco en segundo plano
} as const;
```

---

## 5. Reglas de Renderizado y Cálculo Condicional (`xMayor`)

1. **En `sheetsCsvService.ts`:**
   * Si la celda `xMayor` viene vacía, `NaN`, `0` o negativa, se parsea como `0`.
2. **En `ProductCard.tsx` (`features/catalog`):**
   * **Precio Normal:** Mostrar tachado únicamente si `product.precioNormal > product.precioOferta`.
   * **Precio Oferta / Descuento:** Mostrar siempre como precio principal unitario.
   * **Bloque Mayorista:** Renderizar **únicamente** cuando `product.xMayor > 0 && product.precioMayorista > 0` (ej. *"Mayorista: $1.690 c/u (3+ un.)"*). Si `product.xMayor <= 0`, no renderizar ningún texto ni badge mayorista.
3. **En `pricingCalculator.ts` y `OrderItemRow.tsx` (`features/order-builder`):**
   * `const tieneMayorista = product.xMayor > 0 && product.precioMayorista > 0;`
   * `const esMayorista = tieneMayorista && cantidad >= product.xMayor;`
   * `const precioUnitarioAplicado = esMayorista ? product.precioMayorista : product.precioOferta;`
   * Si `!tieneMayorista`, `unidadesFaltantesMayorista = 0` y la UI no muestra avisos de descuento por volumen ni etiquetas mayoristas en el mensaje de WhatsApp para esa línea.

---

## 6. Contratos Públicos entre Módulos y Puntos de Anclaje (`src/pages/index.astro`)

### Estructura de Slots en `index.astro`:
1. `<Header />` (Estático Astro): Muestra nombre del local, ubicación Maipú, aviso *"Compra desde 1 unidad · Precios de liquidación"*.
2. `<section id="slot-search-filter">`: Hidrata `<SearchFilterIsland client:load />` (Paso 2 — activo).
3. `<main id="slot-catalog">`: Hidrata `<CatalogWithOrderStatus client:load />` (Paso 1 + Paso 2 + Paso 3 — activo).
4. `<aside id="slot-order-builder">`: Hidrata `<OrderBuilderIsland client:load />` (Paso 3 — activo).

### Contrato Público de `src/features/catalog/index.ts` (Implementado):
* **Stores:** `$products: Atom<Product[]>`, `$isLoading: Atom<boolean>`, `$error: Atom<string | null>`, `$isUsingCache: Atom<boolean>`, `$lastUpdated: Atom<number | null>`.
* **Acciones:** `initCatalog(forceRefresh?: boolean): Promise<void>`, `reloadCatalog(): Promise<void>`.
* **Componentes y Props:**
  * `CatalogIsland` / `ProductGrid` acepta `{ products?: Product[]; hasActiveFilters?: boolean; onClearFilters?: () => void; onAddProduct?: (product: Product) => void; orderQuantities?: Record<string, number> }`.
  * Evento DOM emitido al pulsar agregar en una tarjeta: `window` -> `'launion:add-to-order'` con `detail: { product: Product }`.

### Contrato Público de `src/features/search-filter/index.ts` (Implementado):
* **Stores:** `$query`, `$categoria`, `$marca`, `$producto`, `$onlyInStock`, `$sortBy`, `$availableMarcas`, `$availableProductos`, `$filteredProducts`, `$hasActiveFilters`, `$secondaryFiltersCount`.
* **Acciones:** `setQuery`, `setCategoria`, `setMarca`, `setProducto`, `setOnlyInStock`, `setSortBy`, `clearAllFilters`.

### Contrato Público de `src/features/order-builder/index.ts` (Implementado):
* **Stores:** `$orderItems`, `$isDrawerOpen`, `$stockAdjustmentNotice`, `$orderQuantities`, `$orderSummary`.
* **Acciones:** `initOrderStore`, `addToOrder`, `updateItemQuantity`, `incrementItem`, `decrementItem`, `removeItem`, `clearOrder`, `openDrawer`, `closeDrawer`, `dismissStockNotice`.
* **Componentes:**
  * `OrderBuilderIsland`: Escucha `'launion:add-to-order'`, hidrata `localStorage`, renderiza `FloatingOrderBar` y `OrderDrawer`.
  * `CatalogWithOrderStatus`: Conecta `$orderQuantities` con `FilteredCatalogIsland` para mostrar insignias `"X en lista"` en cada tarjeta.
* **Regla estricta:** Ningún componente dentro de `features/A` puede importar archivos internos de `features/B`; solo importa desde `features/B/index.ts` o `shared/`.

---

## 7. Reglas de Aislamiento y Estilos (`src/styles/global.css`)

* **Tokens de Color (Paleta B):**
  * `--color-bg-page: #EFF6FF`
  * `--color-bg-surface: #FFFFFF`
  * `--color-primary: #1D4ED8`
  * `--color-cta: #2563EB`
  * `--color-wholesale: #059669`
  * `--color-soldout: #EF4444`
  * `--color-text-main: #111827`
  * `--color-text-muted: #4B5563`
* **Encapsulamiento de Tarjeta Agotada (`stock === 0`):**
  * Clase `.card-soldout`: aplica borde rojo (`#EF4444`), fondo gris suave y filtro `grayscale` sobre la imagen y textos secundarios.
  * Cinta diagonal `.ribbon-soldout`: posicionada en esquina superior izquierda (`-rotate-45 bg-[#EF4444] text-white font-bold tracking-wider uppercase text-xs shadow-sm`) con el texto `AGOTADO`.
* **Mobile-First:** Diseño base a 360px (`grid-cols-2 gap-2.5` en catálogo), escalando a `sm:grid-cols-3` y `lg:grid-cols-4 gap-4`.

---

## 8. Checklist de Construcción por Módulos

- [x] **Paso 0 — Esqueleto Base (`shared/` + `styles/` + `index.astro`):** Astro + `@astrojs/preact@^6.1.6` + `preact@^11.2.0` + `tailwindcss@^4.3.5` + `@tailwindcss/vite@^4.3.5`, `tsconfig.json`, `store.config.ts`, `product.types.ts`, `formatCurrency.ts`, `global.css` con Paleta B, SVGs fallback, `Header.astro` e `index.astro`.
- [x] **Paso 1 — Módulo `catalog`:** `sheetsCsvService.ts` (parser CSV RFC-4180 + `xMayor <= 0` normalizado a `0`), `catalogStore.ts` (caché TTL + fallback offline en `localStorage`), `SkeletonCard.tsx`, `ProductCard.tsx` (estado `AGOTADO`, fallback SVG por categoría y bloque `xMayor` condicional solo cuando `xMayor > 0`), `ProductGrid.tsx`, `CatalogIsland.tsx` e `index.ts`.
- [x] **Paso 2 — Módulo `search-filter`:** `normalizeText.ts`, `filterAndSortProducts.ts`, `filterStore.ts`, `SearchBar.tsx`, `FilterControls.tsx` (Categoría, Marca, Producto, Solo con stock), `SortSelect.tsx` (A-Z / Precio), `SearchFilterIsland.tsx`, `FilteredCatalogIsland.tsx` e `index.ts`.
- [x] **Paso 3 — Módulo `order-builder`:** `pricingCalculator.ts` (lógica condicional `xMayor > 0`), `whatsappFormatter.ts`, `orderStore.ts` (persistencia `localStorage` + validación de stock), `FloatingOrderBar.tsx`, `OrderDrawer.tsx`, `OrderItemRow.tsx`, `OrderBuilderIsland.tsx`, `CatalogWithOrderStatus.tsx` e `index.ts`.
- [ ] **Paso 4 — Build y Despliegue HostGator:** Validar `npm run build`, verificar carpeta `dist/` y subir a `public_html` en cPanel.
