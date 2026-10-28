import { IExportService } from '../../domain/ports/IExportService.js';

/**
 * Serviço de Exportação de Dados e Compartilhamento Institucional
 * Em conformidade estrita com a política anti-emoji e padrão corporativo.
 * A montagem do CSV é pura (testável); só download() toca no DOM.
 */

const BAND_LABELS = { ALTA: 'Alta', TIPICA: 'Media', JOVEM: 'Jovem' };
const pct = (n, d) => (d > 0 ? ((n / d) * 100).toFixed(2) : '');

/**
 * Célula CSV: aspas quando necessário e neutralização de fórmulas de planilha
 * (texto iniciado por = + - @ vira texto literal com apóstrofo).
 */
export function csvCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean') return value ? 'sim' : 'nao';
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv(headers, rows) {
  return [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\n') + '\n';
}

const TURN_HEADERS = t => [`${t}_Aptos`, `${t}_Comparecimento`, `${t}_Abstencoes`, `${t}_Validos`, `${t}_Lula`, `${t}_Flavio`,
  `${t}_Outros`, `${t}_Brancos`, `${t}_Nulos`, `${t}_Lula_pct_validos`, `${t}_Flavio_pct_validos`, `${t}_Vencedor`];

export class ExportService extends IExportService {
  /**
   * CSV das 27 UFs com os dois turnos completos; a última linha é o exterior (ZZ),
   * de modo que a soma das colunas de votos bate com o total nacional do TSE.
   * @param {Array<import('../../domain/models/StateElection.js').StateElection>} states
   * @param {{ t1: object, t2: object }} [exterior]
   */
  buildStatesCsv(states, exterior = null) {
    const headers = ['UF', 'Estado', 'Regiao', 'Municipios', 'Populacao_IBGE_2022', 'Razao_Eleitor_Habitante_pct', 'Faixa_Demografica',
      ...TURN_HEADERS('T1'), ...TURN_HEADERS('T2'), 'Saldo_T2', 'Virada'];
    const rows = states.map(s => [
      s.uf, s.name, s.region, s.municipalities, s.pop, s.ratioElecPop.toFixed(2), BAND_LABELS[s.band],
      s.t1Aptos, s.t1Comparecimento, s.t1Abstencoes, s.t1Validos, s.t1Lula, s.t1Flavio, s.t1Outros, s.t1Brancos, s.t1Nulos,
      pct(s.t1Lula, s.t1Validos), pct(s.t1Flavio, s.t1Validos), s.winT1,
      s.elec, s.t2Comparecimento, s.t2Abstencoes, s.t2Validos, s.t2Lula, s.t2Flavio, 0, s.t2Brancos, s.t2Nulos,
      pct(s.t2Lula, s.t2Validos), pct(s.t2Flavio, s.t2Validos), s.winT2,
      s.diffT2, s.virada
    ]);
    if (exterior) {
      const turn = t => [t.aptos, t.comparecimento, t.abstencoes, t.validos, t.lula, t.flavio, t.outros, t.brancos, t.nulos,
        pct(t.lula, t.validos), pct(t.flavio, t.validos), t.lula > t.flavio ? 'PT' : 'PL'];
      rows.push(['ZZ', 'Exterior', '', '', '', '', '', ...turn(exterior.t1), ...turn(exterior.t2),
        exterior.t2.lula - exterior.t2.flavio, (exterior.t1.lula > exterior.t1.flavio) !== (exterior.t2.lula > exterior.t2.flavio)]);
    }
    return buildCsv(headers, rows);
  }

  /**
   * CSV dos municípios (por exemplo, a tabela municipal já filtrada), com os dois turnos
   * @param {Array<import('../../domain/models/MunicipalityElection.js').MunicipalityElection>} munis
   */
  buildMunicipalitiesCsv(munis) {
    const headers = ['Codigo_IBGE', 'Municipio', 'UF', 'Capital', 'Populacao_IBGE_2022', 'Razao_Eleitor_Habitante_pct', 'Faixa_Demografica',
      ...TURN_HEADERS('T1'), ...TURN_HEADERS('T2'), 'Virada'];
    const rows = munis.map(m => [
      m.ibge, m.name, m.uf, m.capital, m.pop, m.ratioElecPop === null ? '' : m.ratioElecPop.toFixed(2), BAND_LABELS[m.band] ?? 'Sem dado do Censo',
      m.t1Aptos, m.t1Comparecimento, m.t1Abstencoes, m.t1Validos, m.t1Lula, m.t1Flavio, m.t1Outros, m.t1Brancos, m.t1Nulos,
      pct(m.t1Lula, m.t1Validos), pct(m.t1Flavio, m.t1Validos), m.winT1,
      m.elec, m.t2Comparecimento, m.t2Abstencoes, m.t2Validos, m.t2Lula, m.t2Flavio, 0, m.t2Brancos, m.t2Nulos,
      pct(m.t2Lula, m.t2Validos), pct(m.t2Flavio, m.t2Validos), m.winner,
      m.virada
    ]);
    return buildCsv(headers, rows);
  }

  /** Baixa o CSV com BOM UTF-8 (acentos corretos no Excel) */
  download(csv, filename) {
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportToCsv(states, exterior = null) {
    this.download(this.buildStatesCsv(states, exterior), 'auditoria_eleitoral_2026_ufs_tse_ibge.csv');
  }

  exportMunicipalitiesCsv(munis, filename = 'auditoria_eleitoral_2026_municipios_tse_ibge.csv') {
    this.download(this.buildMunicipalitiesCsv(munis), filename);
  }

  /**
   * Gera o texto institucional para cópia e compartilhamento (zero emojis)
   * @param {object} summary resumo nacional do turno
   * @param {Array<{uf: string, name: string, winT1: string, winT2: string, saldoT2: number}>} [viradas]
   */
  generateShareText(summary, viradas = []) {
    const fmtPct = n => n.toFixed(2).replace('.', ',');
    const lula = `Lula (PT): ${fmtPct(summary.ptPct)}% (${summary.ptVotes.toLocaleString('pt-BR')} votos) | ${summary.ptUFs} UFs`;
    const flavio = `Flávio (PL): ${fmtPct(summary.plPct)}% (${summary.plVotes.toLocaleString('pt-BR')} votos) | ${summary.plUFs} UFs`;
    const [first, second] = summary.leader === 'PT' ? [lula, flavio] : [flavio, lula];

    const viradaText = viradas.length
      ? viradas.map(v => `${v.name} (${v.uf}) virou de ${v.winT1} no 1ºT para ${v.winT2} no 2ºT por +${v.saldoT2.toLocaleString('pt-BR')} votos`).join('; ')
      : 'nenhuma UF trocou de vencedor entre os turnos';

    return `[PAINEL ANALÍTICO ELEIÇÕES 2026 (TSE & IBGE)]
Resultado Oficial (${summary.turn}º Turno, percentuais sobre votos válidos, inclui exterior):
- ${first}
- ${second}
- Diferença Líquida: +${summary.diffVotes.toLocaleString('pt-BR')} votos (${summary.leader})
- Viradas entre turnos: ${viradaText}
- Demografia: ${(summary.totalElec / 1000000).toFixed(1).replace('.', ',')}M eleitores aptos para ${(summary.totalPop / 1000000).toFixed(1).replace('.', ',')}M habitantes (${summary.nationalRatio.toFixed(1).replace('.', ',')}% de representação)
- Base Completa das 27 UFs auditada via TSE e Censo IBGE.`;
  }
}
