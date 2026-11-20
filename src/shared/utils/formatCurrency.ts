const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function formatCLP(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  return clpFormatter.format(safeValue);
}
