import { MUNI_RATIO_BANDS, ratioBand } from './DemographicBands.js';

/**
 * Entidade de Domínio: Município / Zona Urbana
 * Guarda os dois turnos; winT1 = vencedor do 1º turno, winner = vencedor do 2º turno.
 */
export class MunicipalityElection {
  constructor(data) {
    this.ibge = data.ibge ?? null;
    this.tse = data.tse ?? null; // chave "UF-codigoTSE", liga o município às zonas eleitorais
    this.capital = Boolean(data.capital);
    this.name = data.name;
    this.uf = data.uf;
    this.pop = data.pop;
    this.elec = data.elec;
    this.t2Lula = data.t2Lula;
    this.t2Flavio = data.t2Flavio;
    this.winner = data.winner;
    // Detalhamento oficial TSE (opcional; 0 quando ausente)
    this.t2Brancos = data.t2Brancos ?? 0;
    this.t2Nulos = data.t2Nulos ?? 0;
    this.t2Abstencoes = data.t2Abstencoes ?? 0;
    this.t2Validos = data.t2Validos ?? (this.t2Lula + this.t2Flavio);
    this.t2Comparecimento = data.t2Comparecimento ?? (this.elec - this.t2Abstencoes);
    // 1º turno (votos válidos oficiais incluem os demais candidatos)
    this.t1Lula = data.t1Lula ?? 0;
    this.t1Flavio = data.t1Flavio ?? 0;
    this.t1Outros = data.t1Outros ?? 0;
    this.t1Validos = data.t1Validos ?? (this.t1Lula + this.t1Flavio + this.t1Outros);
    this.t1Brancos = data.t1Brancos ?? 0;
    this.t1Nulos = data.t1Nulos ?? 0;
    this.t1Abstencoes = data.t1Abstencoes ?? 0;
    this.t1Aptos = data.t1Aptos ?? this.elec;
    this.t1Comparecimento = data.t1Comparecimento ?? (this.t1Aptos - this.t1Abstencoes);
    this.winT1 = data.winT1 ?? null;
  }

  get t2Total() {
    return this.t2Validos;
  }

  get t2LulaPct() {
    return (this.t2Lula / this.t2Total) * 100;
  }

  get t2FlavioPct() {
    return (this.t2Flavio / this.t2Total) * 100;
  }

  get t1LulaPct() {
    return (this.t1Lula / this.t1Validos) * 100;
  }

  get t1FlavioPct() {
    return (this.t1Flavio / this.t1Validos) * 100;
  }

  /** Inverteu o vencedor entre o 1º e o 2º turno */
  get virada() {
    return this.winT1 !== null && this.winT1 !== this.winner;
  }

  getWinner(turn = 2) {
    return turn === 1 ? this.winT1 : this.winner;
  }

  getLulaPct(turn = 2) {
    return turn === 1 ? this.t1LulaPct : this.t2LulaPct;
  }

  getFlavioPct(turn = 2) {
    return turn === 1 ? this.t1FlavioPct : this.t2FlavioPct;
  }

  /** Abstenção sobre o eleitorado apto do turno (%) */
  getAbstencaoPct(turn = 2) {
    const aptos = turn === 1 ? this.t1Aptos : this.elec;
    const abst = turn === 1 ? this.t1Abstencoes : this.t2Abstencoes;
    return aptos > 0 ? (abst / aptos) * 100 : 0;
  }

  /** Brancos + nulos sobre o comparecimento do turno (%) */
  getNaoNominalPct(turn = 2) {
    const comp = turn === 1 ? this.t1Comparecimento : this.t2Comparecimento;
    const bn = turn === 1 ? this.t1Brancos + this.t1Nulos : this.t2Brancos + this.t2Nulos;
    return comp > 0 ? (bn / comp) * 100 : 0;
  }

  /** null quando o município não existe no Censo 2022 (instalado depois) */
  get ratioElecPop() {
    return this.pop ? (this.elec / this.pop) * 100 : null;
  }

  /** Faixa demográfica: 'ALTA' | 'TIPICA' | 'JOVEM', ou null sem dado do Censo */
  get band() {
    return ratioBand(this.ratioElecPop, MUNI_RATIO_BANDS);
  }

  get profileType() {
    const labels = { ALTA: 'Alta Densidade Adulta', JOVEM: 'Base Jovem Elevada', TIPICA: 'Perfil Demográfico Médio' };
    return labels[this.band] ?? 'Sem dado do Censo';
  }
}
