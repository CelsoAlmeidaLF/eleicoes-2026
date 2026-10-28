import { Enumerable } from '../../infrastructure/lib/stk-pkt-linq.js';

/**
 * Caso de Uso e Lógica Analítica Eleitoral
 */
export class ElectionAnalysisService {
  /**
   * @param {import('../../domain/ports/IElectionRepository.js').IElectionRepository} repository
   */
  constructor(repository) {
    this._repo = repository;
  }

  /**
   * Obtém os totais nacionais consolidados para o turno informado
   * @param {number} turn 1 ou 2
   */
  getNationalSummary(turn = 2) {
    const states = this._repo.getAllStates();
    // Totais nacionais = 27 UFs + exterior, como na totalização oficial do TSE
    const ext = this._repo.getExterior()[turn === 1 ? 't1' : 't2'];

    const ptVotes = states.sum(s => s.getVotesForParty('PT', turn)) + ext.lula;
    const plVotes = states.sum(s => s.getVotesForParty('PL', turn)) + ext.flavio;
    // Votos válidos oficiais: no 1º turno incluem os demais candidatos
    const othersVotes = turn === 1 ? states.sum(s => s.t1Outros) + ext.outros : 0;
    const totalValid = states.sum(s => (turn === 1 ? s.t1Validos : s.t2Validos)) + ext.validos;

    const ptPct = totalValid > 0 ? (ptVotes / totalValid) * 100 : 0;
    const plPct = totalValid > 0 ? (plVotes / totalValid) * 100 : 0;
    const othersPct = totalValid > 0 ? (othersVotes / totalValid) * 100 : 0;

    const ptUFs = states.count(s => s.getWinner(turn) === 'PT');
    const plUFs = states.count(s => s.getWinner(turn) === 'PL');

    const totalPop = states.sum(s => s.pop);
    const totalElec = states.sum(s => s.elec);
    const nationalRatio = totalPop > 0 ? (totalElec / totalPop) * 100 : 0;

    let sumAdvantagePT = 0;
    let sumAdvantagePL = 0;

    states.forEach(s => {
      const winner = s.getWinner(turn);
      const margin = s.getWinningMargin(turn);
      if (winner === 'PT') {
        sumAdvantagePT += margin;
      } else if (winner === 'PL') {
        sumAdvantagePL += margin;
      }
    });

    const diffVotes = Math.abs(ptVotes - plVotes);
    const diffPct = Math.abs(ptPct - plPct);
    const leader = ptVotes >= plVotes ? 'PT' : 'PL';

    const netAdvantage = sumAdvantagePT - sumAdvantagePL;
    const netLeader = netAdvantage >= 0 ? 'PT' : 'PL';

    const totalBrancos = states.sum(s => (turn === 1 ? s.t1Brancos : s.t2Brancos)) + ext.brancos;
    const totalNulos = states.sum(s => (turn === 1 ? s.t1Nulos : s.t2Nulos)) + ext.nulos;
    const totalInvalidos = totalBrancos + totalNulos;

    // Eleitorado apto nacional (com exterior); totalElec segue só UFs para a razão com a população
    const totalAptos = states.sum(s => (turn === 1 ? s.t1Aptos : s.elec)) + ext.aptos;
    const totalAbstencoes = states.sum(s => (turn === 1 ? s.t1Abstencoes : s.t2Abstencoes)) + ext.abstencoes;
    const totalComparecimento = states.sum(s => (turn === 1 ? s.t1Comparecimento : s.t2Comparecimento)) + ext.comparecimento;

    const turnoutPct = totalAptos > 0 ? (totalComparecimento / totalAptos) * 100 : 0;
    const abstencaoPct = totalAptos > 0 ? (totalAbstencoes / totalAptos) * 100 : 0;
    const invalidosPct = totalComparecimento > 0 ? (totalInvalidos / totalComparecimento) * 100 : 0;

    return {
      turn,
      ptVotes,
      plVotes,
      othersVotes,
      othersPct,
      totalValid,
      ptPct,
      plPct,
      ptUFs,
      plUFs,
      diffVotes,
      diffPct,
      leader,
      totalPop,
      totalElec,
      totalAptos,
      exteriorVotes: ext.lula + ext.flavio + ext.outros,
      nationalRatio,
      sumAdvantagePT,
      sumAdvantagePL,
      netAdvantage: Math.abs(netAdvantage),
      netLeader,
      totalBrancos,
      totalNulos,
      totalInvalidos,
      invalidosPct,
      totalAbstencoes,
      abstencaoPct,
      totalComparecimento,
      turnoutPct,
      spoiledVotes: totalInvalidos
    };
  }

  /**
   * Filtra e ordena estados para a tabela federativa com suporte a qualquer coluna
   */
  filterAndSortStates({ filter = 'ALL', search = '', sortBy = 'elec-desc', sortColumn = null, sortDirection = 'desc', turn = 2 }) {
    let query = this._repo.getAllStates();

    // Filtro por partido vencedor / virada
    if (filter === 'PT') {
      query = query.where(s => s.getWinner(turn) === 'PT');
    } else if (filter === 'PL') {
      query = query.where(s => s.getWinner(turn) === 'PL');
    } else if (filter === 'VIRADA') {
      query = query.where(s => s.virada);
    }

    // Busca textual
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      query = query.where(s =>
        s.uf.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q)
      );
    }

    // Normalização de coluna e direção
    let col = sortColumn;
    let dir = sortDirection;

    if (!col && sortBy) {
      const parts = sortBy.split('-');
      col = parts[0];
      dir = parts[1] || 'desc';
    }

    // Mapeamento de seletores de ordenação
    const selectors = {
      uf: s => s.uf,
      name: s => s.name,
      region: s => s.region,
      t1: s => s.t1LulaPct,
      t2: s => s.t2LulaPct,
      margin: s => s.getWinningMargin(turn),
      diff: s => s.getWinningMargin(turn),
      elec: s => s.elec,
      pop: s => s.pop,
      nonVoters: s => s.nonVoters,
      ratio: s => s.ratioElecPop
    };

    const selector = selectors[col] || selectors.elec;

    if (dir === 'asc') {
      query = query.orderBy(selector);
    } else {
      query = query.orderByDescending(selector);
    }

    return query.toArray();
  }

  /**
   * Filtra e ordena amostra municipal por qualquer coluna e categoria
   */
  filterMunicipalities({ search = '', filter = 'ALL', sortColumn = 'elec', sortDirection = 'desc', turn = 2 } = {}) {
    let query = this._repo.getMunicipalities();

    // Filtros por categoria / partido (vencedor do turno informado)
    if (filter === 'PT' || filter === 'PL') {
      query = query.where(m => m.getWinner(turn) === filter);
    } else if (filter === 'VIRADA') {
      query = query.where(m => m.virada);
    } else if (filter === 'CAPITAIS') {
      query = query.where(m => m.capital);
    } else if (filter === 'ALTA' || filter === 'JOVEM') {
      query = query.where(m => m.band === filter);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      query = query.where(m =>
        m.name.toLowerCase().includes(q) ||
        m.uf.toLowerCase().includes(q) ||
        (m.ibge !== null && m.ibge.startsWith(q)) ||
        (m.getWinner(turn) ?? '').toLowerCase().includes(q) ||
        m.profileType.toLowerCase().includes(q)
      );
    }

    const selectors = {
      name: m => m.name,
      uf: m => m.uf,
      voteT2: m => m.getLulaPct(turn),
      winner: m => m.getWinner(turn),
      elec: m => m.elec,
      pop: m => m.pop ?? -1,
      ratio: m => m.ratioElecPop ?? -1,
      profile: m => m.profileType
    };

    const selector = selectors[sortColumn] || selectors.elec;

    if (sortDirection === 'asc') {
      query = query.orderBy(selector);
    } else {
      query = query.orderByDescending(selector);
    }

    return query.toArray();
  }

  loadMunicipalities() {
    return this._repo.loadMunicipalities();
  }

  getProvenance() {
    return this._repo.getProvenance();
  }

  getAllStates() {
    return this._repo.getAllStates().toArray();
  }

  getExterior() {
    return this._repo.getExterior();
  }

  getStateByUf(uf) {
    return this._repo.getStateByUf(uf);
  }

  /**
   * Ranking de participação por município: abstenção (% dos aptos) ou brancos+nulos (% do comparecimento).
   * Médias por faixa demográfica são ponderadas (soma das partes / soma das bases), não média de percentuais.
   * @param {{ metric?: 'ABSTENCAO'|'NAO_NOMINAL', band?: 'ALL'|'ALTA'|'TIPICA'|'JOVEM', minElec?: number, turn?: number, limit?: number }} opts
   */
  getParticipationRanking({ metric = 'ABSTENCAO', band = 'ALL', minElec = 0, turn = 2, limit = 20 } = {}) {
    const t = turn === 1 ? 't1' : 't2';
    const parts = m => (metric === 'ABSTENCAO'
      ? { num: m[`${t}Abstencoes`], den: turn === 1 ? m.t1Aptos : m.elec }
      : { num: m[`${t}Brancos`] + m[`${t}Nulos`], den: m[`${t}Comparecimento`] });
    const pct = m => (metric === 'ABSTENCAO' ? m.getAbstencaoPct(turn) : m.getNaoNominalPct(turn));

    const all = this._repo.getMunicipalities().toArray();
    const weighted = list => {
      const acc = list.reduce((o, m) => { const p = parts(m); o.num += p.num; o.den += p.den; return o; }, { num: 0, den: 0 });
      return { count: list.length, pct: acc.den > 0 ? (acc.num / acc.den) * 100 : 0 };
    };

    const bands = {
      BRASIL: weighted(all),
      ALTA: weighted(all.filter(m => m.band === 'ALTA')),
      TIPICA: weighted(all.filter(m => m.band === 'TIPICA')),
      JOVEM: weighted(all.filter(m => m.band === 'JOVEM'))
    };

    const eligible = all.filter(m => m.elec >= minElec && (band === 'ALL' || m.band === band));
    const top = eligible
      .map(m => ({ municipality: m, pct: pct(m), ...parts(m) }))
      .sort((x, y) => y.pct - x.pct || y.municipality.elec - x.municipality.elec)
      .slice(0, limit);

    return { metric, turn, eligible: eligible.length, bands, top };
  }

  /**
   * Detalhe de um município com as zonas eleitorais (carrega as zonas sob demanda)
   */
  async getMunicipalityDetail(tseKey) {
    const municipality = this._repo.getMunicipalities().firstOrDefault(m => m.tse === tseKey, null);
    if (!municipality) return null;
    await this._repo.loadZones();
    const zones = this._repo.getZones(tseKey).sort((a, b) => a.zona - b.zona);
    return { municipality, zones };
  }

  isMunicipalitiesLoaded() {
    return this._repo.isMunicipalitiesLoaded();
  }

  /**
   * Contagens dos chips de filtro da tabela federativa (vitórias dependem do turno)
   */
  getStateFilterCounts(turn = 2) {
    const states = this._repo.getAllStates().toArray();
    return {
      ALL: states.length,
      PT: states.filter(s => s.getWinner(turn) === 'PT').length,
      PL: states.filter(s => s.getWinner(turn) === 'PL').length,
      viradaUFs: states.filter(s => s.virada).map(s => s.uf).sort()
    };
  }

  /**
   * Contagens dos chips de filtro municipais (vencedor do 2º turno); exige a base municipal carregada
   */
  getMunicipalityFilterCounts(turn = 2) {
    const munis = this._repo.getMunicipalities().toArray();
    return {
      ALL: munis.length,
      PT: munis.filter(m => m.getWinner(turn) === 'PT').length,
      PL: munis.filter(m => m.getWinner(turn) === 'PL').length,
      VIRADA: munis.filter(m => m.virada).length,
      CAPITAIS: munis.filter(m => m.capital).length,
      ALTA: munis.filter(m => m.band === 'ALTA').length,
      JOVEM: munis.filter(m => m.band === 'JOVEM').length
    };
  }

  /**
   * Resumo das viradas municipais: quantos municípios trocaram de vencedor e para qual lado
   */
  getMunicipalityViradaSummary() {
    const viradas = this._repo.getMunicipalities().toArray().filter(m => m.virada);
    return {
      total: viradas.length,
      paraPT: viradas.filter(m => m.winner === 'PT').length,
      paraPL: viradas.filter(m => m.winner === 'PL').length,
      maiores: viradas.sort((a, b) => b.elec - a.elec).slice(0, 5).map(m => ({ name: m.name, uf: m.uf, winner: m.winner }))
    };
  }

  /**
   * Onde cada partido venceu no turno: regiões inteiras conquistadas + UFs avulsas
   */
  getPartyGeography(turn = 2) {
    const regions = this.getRegionSummary(turn);
    const build = party => {
      const key = party === 'PT' ? 'ptUFs' : 'plUFs';
      const fullRegions = regions.filter(r => r.total > 0 && r[key].length === r.total).map(r => r.region);
      const otherUFs = regions.filter(r => r[key].length < r.total).flatMap(r => r[key]).sort();
      return { fullRegions, otherUFs };
    };
    return { PT: build('PT'), PL: build('PL') };
  }

  /**
   * UFs que inverteram o vencedor entre o 1º e o 2º turno, com os números de cada turno
   */
  getViradas() {
    return this._repo.getAllStates()
      .where(s => s.virada)
      .orderByDescending(s => s.elec)
      .toArray()
      .map(s => ({
        uf: s.uf,
        name: s.name,
        winT1: s.winT1,
        winT2: s.winT2,
        t1: { lula: s.t1Lula, flavio: s.t1Flavio, lulaPct: s.t1LulaPct, flavioPct: s.t1FlavioPct },
        t2: { lula: s.t2Lula, flavio: s.t2Flavio, lulaPct: s.t2LulaPct, flavioPct: s.t2FlavioPct },
        saldoT2: s.getWinningMargin(2)
      }));
  }

  /**
   * Placar por macrorregião no turno informado
   */
  getRegionSummary(turn = 2) {
    const order = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
    const states = this._repo.getAllStates().toArray();
    return order.map(region => {
      const list = states.filter(s => s.region === region).sort((a, b) => a.uf.localeCompare(b.uf));
      return {
        region,
        total: list.length,
        ptUFs: list.filter(s => s.getWinner(turn) === 'PT').map(s => s.uf),
        plUFs: list.filter(s => s.getWinner(turn) === 'PL').map(s => s.uf),
        viradas: list.filter(s => s.virada).map(s => s.uf)
      };
    });
  }

  /**
   * UFs de cada faixa demográfica (mesmos limites de filterDemographics)
   */
  getDemographicBands() {
    const sorted = this._repo.getAllStates().orderByDescending(s => s.ratioElecPop).toArray();
    return {
      TIPICA: sorted.filter(s => s.band === 'TIPICA'),
      ALTA: sorted.filter(s => s.band === 'ALTA'),
      JOVEM: sorted.filter(s => s.band === 'JOVEM')
    };
  }

  /**
   * Prepara os dados para o gráfico de Maiores Colégios Eleitorais
   */
  getTopCollegesChartData(turn = 2) {
    const topStates = this._repo.getAllStates()
      .orderByDescending(s => s.elec)
      .take(8)
      .toArray();

    return {
      labels: topStates.map(s => `${s.uf} (${s.name})`),
      ptVotes: topStates.map(s => s.getVotesForParty('PT', turn)),
      plVotes: topStates.map(s => s.getVotesForParty('PL', turn))
    };
  }

  /**
   * Prepara os dados para o gráfico de Divisão dos 27 Estados (Doughnut)
   */
  getUfDivisionChartData(turn = 2) {
    const states = this._repo.getAllStates();
    const ptCount = states.count(s => s.getWinner(turn) === 'PT');
    const plCount = states.count(s => s.getWinner(turn) === 'PL');

    return {
      ptCount,
      plCount
    };
  }

  /**
   * Filtra e ordena estados para a aba demográfica
   */
  filterDemographics({ filter = 'ALL', region = 'ALL', search = '', sortColumn = 'ratio', sortDirection = 'desc' } = {}) {
    let query = this._repo.getAllStates();

    // Filtro por faixa demográfica
    if (filter === 'TIPICA' || filter === 'ALTA' || filter === 'JOVEM') {
      query = query.where(s => s.band === filter);
    }

    // Filtro por região
    if (region && region !== 'ALL') {
      query = query.where(s => s.region === region);
    }

    // Busca textual
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      query = query.where(s =>
        s.uf.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q)
      );
    }

    const selectors = {
      uf: s => s.uf,
      name: s => s.name,
      region: s => s.region,
      elec: s => s.elec,
      pop: s => s.pop,
      nonVoters: s => s.nonVoters,
      ratio: s => s.ratioElecPop
    };

    const selector = selectors[sortColumn] || selectors.ratio;

    if (sortDirection === 'asc') {
      query = query.orderBy(selector);
    } else {
      query = query.orderByDescending(selector);
    }

    return query.toArray();
  }

  /**
   * Retorna os dados para o gráfico de Razão Demográfica das UFs (suporta conjunto filtrado)
   */
  getDemographicRatioChartData(customStates = null) {
    let list = customStates;
    if (!list) {
      list = this._repo.getAllStates()
        .orderByDescending(s => s.ratioElecPop)
        .toArray();
    }

    return {
      labels: list.map(s => s.uf),
      ratios: list.map(s => Number(s.ratioElecPop.toFixed(2)))
    };
  }
}
