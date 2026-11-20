# PRD — Catálogo Digital Venta de Bodega (Maipú)

## 1. Resumen Ejecutivo
* **Propósito:** Catálogo web digital de exhibición y armador rápido de pedidos para liquidación de inventario de bodega (duración estimada: 3 meses) en **Maipú, Santiago de Chile**.
* **Modelo operativo:** Sin pasarela de pagos ni transacciones automatizadas en la web. El cliente arma su lista de productos, visualiza precios unitarios (y descuentos mayoristas solo en los productos que cuenten con esa modalidad) y envía el detalle por WhatsApp o lo copia al portapapeles para coordinar retiro en local, despacho a domicilio con recargo y pago vía transferencia o link de MercadoPago.
* **Actualización de datos:** Base de datos gestionada en **Google Sheets** (publicado como CSV) para reflejar cambios de stock y precios múltiples veces al día sin recompilar ni redesplegar el sitio en HostGator.
* **Métricas de éxito:**
  * Tiempo de carga inicial menor a 1.5 segundos en redes móviles 4G.
  * Búsqueda y filtrado instantáneo (< 50 ms en cliente).
  * Generación de pedidos estructurados listos para cerrar venta por WhatsApp en menos de 3 pasos.

---

## 2. Roles, Permisos y Alcance
* **Cliente (Usuario Final — Acceso Público):**
  * Visualiza todo el catálogo (incluidos productos agotados).
  * Busca, filtra y ordena productos en tiempo real.
  * Agrega unidades disponibles al armador de pedido (desde 1 unidad).
  * Envía el resumen por WhatsApp o lo copia al portapapeles.
* **Administrador (Dueño del Local — Gestión Externa):**
  * Administra inventario, precios, umbrales `xMayor` y fotos directamente desde Google Sheets (sin interfaz de login dentro de la web).
  * Configura el número de WhatsApp y la URL de Google Sheets en un archivo centralizado de configuración.

---

## 3. Reglas de Negocio Explícitas

1. **Sin mínimo de compra:** Se puede solicitar desde **1 unidad** en adelante.
2. **Categorías fijas (3 exactas):**
   * `Artículos de aseo`
   * `Artículos escolares`
   * `Artículos aseo personal`
3. **Cálculo de Precio Normal, Descuento y Mayorista Condicional (`xMayor`):**
   * **Precios base:** Cada producto muestra su `precioNormal` (tachado, únicamente si `precioNormal > precioOferta`) y su `precioOferta` (precio descuento/bodega vigente desde 1 unidad).
   * **Caso A — Producto SIN precio mayorista (`xMayor <= 0` o `precioMayorista <= 0`):**
     * No existe tramo mayorista para ese artículo.
     * En la tarjeta de producto y en el armador de pedido **se oculta por completo** cualquier mención, etiqueta o cálculo de `precioMayorista`.
     * Sin importar cuántas unidades agregue el cliente (1, 5 o 20), el precio unitario y el subtotal se calculan siempre con `precioOferta`.
   * **Caso B — Producto CON precio mayorista activo (`xMayor > 0` y `precioMayorista > 0`):**
     * El descuento mayorista aplica **exclusivamente por cantidad del mismo producto** (`cantidadSeleccionada >= producto.xMayor`), no por suma de productos distintos.
     * La tarjeta muestra el precio unitario mayorista y la condición para activarlo (ej. *"Precio mayorista: $1.690 c/u llevando 3+ un."*).
     * Si `cantidadSeleccionada < xMayor`: se cobra `precioOferta` por unidad y el armador de pedido muestra cuánto falta para activar el descuento (ej. *"Agrega 1 más para precio mayorista"*).
     * Si `cantidadSeleccionada >= xMayor`: toda la línea pasa automáticamente a `precioMayorista` por unidad y se refleja el ahorro obtenido.
4. **Control de Stock y Productos Agotados (`stock === 0`):**
   * El usuario nunca puede agregar más unidades que el `stock` disponible del producto.
   * Los productos con `stock === 0` **NO se ocultan**; permanecen visibles en el catálogo para evidenciar rotación de inventario.
   * Tratamiento visual obligatorio para `stock === 0`: tarjeta con filtro grisáceo (`grayscale`), borde rojo (`#EF4444`), franja/cinta diagonal roja atravesando la imagen con el texto **`AGOTADO`** en blanco, y botón de acción deshabilitado.
5. **Cierre y Coordinación:**
   * Todo pedido generado incluye una nota aclaratoria indicando que el despacho a domicilio (con recargo según sector en Maipú/Santiago) o retiro en local y el medio de pago (transferencia o link MercadoPago) se confirman directamente por WhatsApp.

---

## 4. Desglose de Módulos Funcionales

1. **`catalog` (Catálogo y Sincronización de Datos):**
   * Obtiene el CSV público de Google Sheets, lo parsea al contrato `Product[]` (tratando `xMayor` vacío o `<= 0` como `0`) y guarda copia en `localStorage` como respaldo offline/fallback.
   * Renderiza la grilla mobile-first de tarjetas de producto con `precioNormal` tachado (si es mayor a `precioOferta`), `precioOferta` destacado y, **solo si `xMayor > 0` y `precioMayorista > 0`**, el bloque informativo del precio unitario mayorista y su umbral de unidades.
2. **`search-filter` (Buscador, Filtros y Ordenamiento):**
   * Barra de búsqueda normalizada (ignora tildes, diéresis y mayúsculas/minúsculas) que busca en simultáneo por `nombre`, `marca`, `producto`, `variante`, `contenido` y `codigoBarras`.
   * Filtros combinables por: **Categoría** (las 3 fijas), **Marca** (dinámica según inventario) y **Producto** (tipo genérico: Cloro, Detergente, Aromatizante, etc.).
   * Selector de ordenamiento `A-Z` por **Producto**, **Marca** o **Categoría** (además de orden por disponibilidad).
3. **`order-builder` (Armador de Pedido Rápido):**
   * Botón flotante inferior en móvil / acceso superior en escritorio con contador de ítems y subtotal acumulado.
   * Panel deslizable (drawer) persistido en `localStorage` con control de cantidades (`+`/`-` validado contra `stock` actual), cálculo condicional de tramos `xMayor` (solo en ítems con `xMayor > 0`), ahorro total acumulado y botones **"Enviar por WhatsApp"** y **"Copiar pedido"**.

---

## 5. Flujo de Usuario Paso a Paso

1. El cliente ingresa a la web desde su celular (ej. enlace de Instagram, TikTok o WhatsApp).
2. Visualiza la cabecera con ubicación (**Maipú, Santiago**), modalidad (*Venta de Bodega — Retiro o Despacho*) y el buscador principal fijo en la parte superior.
3. Filtra por categoría o busca un artículo (ej. `"cloro color"` o `"aromatizante vainilla"`) y ordena resultados de la `A` a la `Z` si lo desea.
4. En las tarjetas con stock, pulsa **"Agregar"**; si el producto tiene `xMayor > 0`, ve el aviso del precio mayorista por volumen y al alcanzar esa cantidad se actualiza automáticamente el valor unitario de la línea. Si `xMayor <= 0`, compra normalmente a su precio descuento sin mensajes adicionales.
5. Abre el panel **"Ver mi pedido"**, revisa el desglose y pulsa **"Enviar por WhatsApp"** (abre `wa.me` con el mensaje prellenado) o **"Copiar pedido"**.

---

## 6. Matriz de los 5 Estados por Vista

| Vista / Módulo | Ideal | Vacío (Empty State) | Carga (Loading) | Error | Permisos / Roles |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Catálogo (`catalog`)** | Grilla responsiva (2 cols en móvil, 4 en escritorio) con precio normal/oferta, etiqueta mayorista visible **solo cuando `xMayor > 0`**, y tarjetas agotadas en gris/rojo. | Mensaje *"Aún no hay productos cargados en la bodega"* con botón de recargar catálogo. | Skeleton cards animados (6 tarjetas fantasma) mientras descarga y parsea el CSV de Google Sheets. | Si falla la red, carga última caché de `localStorage` con aviso discreto; si no hay caché, muestra alerta y botón *"Reintentar"*. Si falta foto de producto, usa SVG fallback según categoría. | Público (solo lectura). |
| **Buscador y Filtros (`search-filter`)** | Input limpio con botón limpiar (`X`), chips de categorías y selectores de marca, producto y orden A-Z activos. | Mensaje *"No encontramos productos para '[búsqueda]'"* + botón destacado **"Limpiar todos los filtros"**. | Controles deshabilitados brevemente mientras hidrata el listado inicial. | Si un filtro combinado queda sin ítems tras actualizar stock, resetea automáticamente el filtro inválido. | Público. |
| **Armador de Pedido (`order-builder`)** | Lista de ítems con imagen miniatura, controles `+`/`-`, indicador de precio mayorista (solo en productos con `xMayor > 0`), ahorro total y botones WhatsApp / Copiar. | Drawer muestra ícono de lista vacía, texto *"Tu lista está vacía. Agrega productos desde 1 unidad"* y botón *"Explorar catálogo"*. | Sincroniza stock en segundo plano al abrir el drawer para ajustar cantidades si algún ítem bajó su stock en Google Sheets. | Si un producto en `localStorage` pasó a `stock: 0`, muestra alerta en rojo *"Sin stock disponible"* y lo excluye del total hasta que el usuario lo elimine. | Público (sin edición de precios). |

---

## 7. Sistema Visual Aprobado (Paleta B: Azul Cobalto Mayorista)

* **Regla 60-30-10:**
  * **60% Superficie:** Blanco puro (`#FFFFFF`) para tarjetas y modales; Celeste ultra suave (`#EFF6FF`) para el fondo general de la página.
  * **30% Estructura y Texto:** Azul cobalto (`#1D4ED8`) para barra superior, encabezados destacados y bordes activos; Gris carbón (`#111827`) para texto principal y `#4B5563` para metadatos (marca, variante, contenido).
  * **10% Acentos y Estados Semánticos:**
    * Azul vibrante (`#2563EB` / hover `#1D4ED8`): Botones principales ("Agregar", "Copiar pedido").
    * Verde esmeralda (`#059669` / fondo `#ECFDF5`): Etiquetas de **Precio Mayorista** (solo visibles cuando `xMayor > 0`), monto ahorrado y botón **Enviar por WhatsApp**.
    * Rojo alerta (`#EF4444` / fondo `#FEF2F2`): Franja diagonal **AGOTADO**, borde de tarjetas sin stock y alertas de límite de inventario.
* **Tipografía y Ergonomía Mobile-First:**
  * Fuente sans-serif moderna (`Inter` o `Plus Jakarta Sans`) con `font-variant-numeric: tabular-nums` para alineación exacta de precios en pesos chilenos (`$1.990`).
  * Objetivos táctiles mínimos de `44x44px` en botones `+`, `-` y filtros.

---

## 8. Requerimientos Técnicos Ocultos, SEO y Seguridad

* **Normalización de CSV:** El parser soporta comas y saltos de línea dentro de celdas entrecomilladas en Google Sheets, sanea valores numéricos (elimina `$`, puntos y espacios) y normaliza cualquier `xMayor` vacío, negativo o `0` a `0` (sin mayorista).
* **Seguridad XSS:** Todo texto proveniente de Google Sheets se renderiza mediante bindings seguros de Preact/Astro (nunca `dangerouslySetInnerHTML`), y la URL de WhatsApp se construye con `encodeURIComponent()`.
* **SEO y Open Graph:** Metaetiquetas configuradas para compartir por WhatsApp/redes sociales (*"Venta de Bodega en Maipú — Artículos de Aseo, Personal y Escolares"*), `robots.txt` y favicon limpio.
* **Despliegue:** Compilación estática (`npm run build`) compatible con **HostGator cPanel** (`public_html/`) sin requerir Node.js en el servidor de producción.