/**
 * Normaliza cadenas de texto para búsqueda insensible a mayúsculas,
 * tildes, diéresis y espacios duplicados.
 */
export function normalizeText(value: string): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Divide una consulta normalizada en términos individuales para permitir
 * coincidencias parciales no contiguas (ej. "cloro color" -> ["cloro", "color"]).
 */
export function tokenizeQuery(query: string): string[] {
  const normalized = normalizeText(query);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
}
