/**
 * Entidade de Domínio: Zona eleitoral dentro de um município, com os dois turnos.
 * Cada turno: { aptos, comparecimento, abstencoes, validos, brancos, nulos, lula, flavio, outros } ou null.
 */
export class ZoneElection {
  constructor({ zona, t1 = null, t2 = null }) {
    this.zona = zona;
    this.t1 = t1;
    this.t2 = t2;
  }

  getTurn(turn = 2) {
    return turn === 1 ? this.t1 : this.t2;
  }

  getLulaPct(turn = 2) {
    const t = this.getTurn(turn);
    return t && t.validos > 0 ? (t.lula / t.validos) * 100 : null;
  }

  getFlavioPct(turn = 2) {
    const t = this.getTurn(turn);
    return t && t.validos > 0 ? (t.flavio / t.validos) * 100 : null;
  }

  getComparecimentoPct(turn = 2) {
    const t = this.getTurn(turn);
    return t && t.aptos > 0 ? (t.comparecimento / t.aptos) * 100 : null;
  }

  getNaoNominalPct(turn = 2) {
    const t = this.getTurn(turn);
    return t && t.comparecimento > 0 ? ((t.brancos + t.nulos) / t.comparecimento) * 100 : null;
  }

  getWinner(turn = 2) {
    const t = this.getTurn(turn);
    if (!t) return null;
    return t.lula > t.flavio ? 'PT' : 'PL';
  }
}
