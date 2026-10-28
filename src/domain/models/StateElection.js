import { UF_RATIO_BANDS, ratioBand } from './DemographicBands.js';

/**
 * Entidade de Domínio: Estado / Unidade Federativa (UF)
 */
export class StateElection {
  constructor(data) {
    this.uf = data.uf;
    this.name = data.name;
    this.region = data.region;
    this.pop = data.pop;
    this.elec = data.elec;
    this.municipalities = data.municipalities;
    this.t1Lula = data.t1Lula;
    this.t1Flavio = data.t1Flavio;
    this.t2Lula = data.t2Lula;
    this.t2Flavio = data.t2Flavio;
    this.winT1 = data.winT1;
    this.winT2 = data.winT2;
    this.virada = Boolean(data.virada);
    // Detalhamento oficial TSE (opcional; 0 quando ausente)
    this.t1Outros = data.t1Outros ?? 0;
    this.t1Brancos = data.t1Brancos ?? 0;
    this.t1Nulos = data.t1Nulos ?? 0;
    this.t1Abstencoes = data.t1Abstencoes ?? 0;
    this.t2Brancos = data.t2Brancos ?? 0;
    this.t2Nulos = data.t2Nulos ?? 0;
    this.t2Abstencoes = data.t2Abstencoes ?? 0;
    // Totais oficiais TSE por turno (elec = aptos do 2º turno)
    this.t1Aptos = data.t1Aptos ?? this.elec;
    this.t1Comparecimento = data.t1Comparecimento ?? (this.t1Aptos - this.t1Abstencoes);
    this.t2Comparecimento = data.t2Comparecimento ?? (this.elec - this.t2Abstencoes);
    this.t1Validos = data.t1Validos ?? (this.t1Lula + this.t1Flavio + this.t1Outros);
    this.t2Validos = data.t2Validos ?? (this.t2Lula + this.t2Flavio);
  }

  /** Votos válidos oficiais do TSE: base dos percentuais, como na apuração oficial */
  get t1Total() {
    return this.t1Validos;
  }

  get t2Total() {
    return this.t2Validos;
  }

  get t1LulaPct() {
    return (this.t1Lula / this.t1Total) * 100;
  }

  get t1FlavioPct() {
    return (this.t1Flavio / this.t1Total) * 100;
  }

  get t1OutrosPct() {
    return (this.t1Outros / this.t1Total) * 100;
  }

  get t2LulaPct() {
    return (this.t2Lula / this.t2Total) * 100;
  }

  get t2FlavioPct() {
    return (this.t2Flavio / this.t2Total) * 100;
  }

  get diffT1() {
    return this.t1Lula - this.t1Flavio;
  }

  get diffT2() {
    return this.t2Lula - this.t2Flavio;
  }

  get ratioElecPop() {
    return (this.elec / this.pop) * 100;
  }

  /** Faixa demográfica: 'ALTA' | 'TIPICA' | 'JOVEM' */
  get band() {
    return ratioBand(this.ratioElecPop, UF_RATIO_BANDS);
  }

  get nonVoters() {
    return this.pop - this.elec;
  }

  get nonVotersPct() {
    return (this.nonVoters / this.pop) * 100;
  }

  getWinningMargin(turn = 2) {
    return Math.abs(turn === 1 ? this.diffT1 : this.diffT2);
  }

  getWinningMarginPct(turn = 2) {
    return Math.abs(turn === 1 ? (this.t1LulaPct - this.t1FlavioPct) : (this.t2LulaPct - this.t2FlavioPct));
  }

  getWinner(turn = 2) {
    return turn === 1 ? this.winT1 : this.winT2;
  }

  getVotesForParty(party, turn = 2) {
    if (party === 'PT') return turn === 1 ? this.t1Lula : this.t2Lula;
    if (party === 'PL') return turn === 1 ? this.t1Flavio : this.t2Flavio;
    return 0;
  }
}
