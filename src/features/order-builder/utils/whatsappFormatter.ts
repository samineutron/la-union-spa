import { STORE_CONFIG } from '../../../shared/config/store.config';
import { formatCLP } from '../../../shared/utils/formatCurrency';
import type { CalculatedOrderSummary } from './pricingCalculator';

function formatLineDetails(
  marca: string,
  variante: string,
  contenido: string
): string {
  const parts = [
    marca && marca.toLowerCase() !== 'genérico' ? marca : '',
    variante && variante.toLowerCase() !== 'sin variante' ? variante : '',
    contenido,
  ].filter(Boolean);

  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

/**
 * Construye el texto estructurado del pedido listo para enviar por WhatsApp
 * o copiar al portapapeles. Incluye la etiqueta "Mayorista" exclusivamente en
 * líneas donde se activó el tramo xMayor > 0.
 */
export function buildOrderTextMessage(summary: CalculatedOrderSummary): string {
  const headerLines = [
    `Hola *${STORE_CONFIG.storeName}*, quiero hacer el siguiente pedido:`,
    '',
  ];

  const itemLines = summary.lines.map((line) => {
    const details = formatLineDetails(
      line.product.marca,
      line.product.variante,
      line.product.contenido
    );
    const wholesaleTag = line.esMayorista ? ' · Mayorista' : '';
    const unitInfo = `${formatCLP(line.precioUnitarioAplicado)} c/u${wholesaleTag}`;

    return `• ${line.cantidad}x ${line.product.nombre}${details} — ${formatCLP(line.subtotal)} (${unitInfo})`;
  });

  const footerLines: string[] = [
    '',
    `*Total estimado: ${formatCLP(summary.totalAmount)}*`,
  ];

  if (summary.totalSavings > 0) {
    footerLines.push(`Ahorro aplicado: ${formatCLP(summary.totalSavings)}`);
  }

  footerLines.push(
    '',
    'Entrega: Por coordinar (Retiro en local Maipú o despacho a domicilio con recargo según sector)',
    'Medio de pago: Por coordinar (Transferencia o link MercadoPago)'
  );

  return [...headerLines, ...itemLines, ...footerLines].join('\n');
}

/**
 * Genera el enlace oficial wa.me con codificación segura encodeURIComponent().
 */
export function buildWhatsAppUrl(
  summary: CalculatedOrderSummary,
  phoneNumber: string = STORE_CONFIG.whatsappNumber
): string {
  const sanitizedPhone = phoneNumber.replace(/\D/g, '');
  const message = buildOrderTextMessage(summary);
  const encodedText = encodeURIComponent(message);

  if (!sanitizedPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }

  return `https://wa.me/${sanitizedPhone}?text=${encodedText}`;
}
