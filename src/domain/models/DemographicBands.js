/**
 * Faixas da razão eleitores/habitantes (%): fonte única para filtros, selos, gráficos e rótulos.
 * TIPICA = [low, high); ALTA = >= high; JOVEM = < low.
 */
export const UF_RATIO_BANDS = Object.freeze({ low: 68, high: 78 });
export const MUNI_RATIO_BANDS = Object.freeze({ low: 70, high: 80 });

/** 'ALTA' | 'TIPICA' | 'JOVEM', ou null quando não há razão (sem dado do Censo) */
export function ratioBand(ratio, bands) {
  if (ratio === null || ratio === undefined) return null;
  if (ratio >= bands.high) return 'ALTA';
  if (ratio < bands.low) return 'JOVEM';
  return 'TIPICA';
}
