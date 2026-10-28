import { getIcon } from '../infrastructure/icons/Icons.js';
import { escapeHtml as esc } from '../infrastructure/lib/escapeHtml.js';
import { UF_RATIO_BANDS, MUNI_RATIO_BANDS } from '../domain/models/DemographicBands.js';
import { parseUrlState, serializeUrlState } from './UrlState.js';

const MUNI_ROW_LIMIT = 300;
const fmtInt = n => n.toLocaleString('pt-BR');
const fmtPct = (n, d = 2) => `${n.toFixed(d).replace('.', ',')}%`;
const listUFs = ufs => (ufs.length ? ufs.join(', ') : 'nenhuma');
const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
const withCount = (label, n) => `${label} (${fmtInt(n)})`;
// Intervalo legível de cada faixa demográfica, a partir dos limites do domínio
const bandRanges = b => ({ ALTA: `≥${b.high}%`, JOVEM: `<${b.low}%`, TIPICA: `${b.low}% a <${b.high}%` });
const UF_RANGES = bandRanges(UF_RATIO_BANDS);
const MUNI_RANGES = bandRanges(MUNI_RATIO_BANDS);
const TAB_ORDER = ['tabUFs', 'tabMunicipios', 'tabDemografia', 'tabMapa'];
const TAB_BUTTONS = { tabUFs: 'tabBtnUFs', tabMunicipios: 'tabBtnMunicipios', tabDemografia: 'tabBtnDemografia', tabMapa: 'tabBtnMapa' };

/**
 * Controller de Apresentação e Interação com a UI
 */
export class ElectionUIController {
  /**
   * @param {import('../application/services/ElectionAnalysisService.js').ElectionAnalysisService} analysisService
   * @param {import('../application/services/ExportService.js').ExportService} exportService
   * @param {import('../infrastructure/charts/ElectionChartAdapter.js').ElectionChartAdapter} chartAdapter
   */
  constructor(analysisService, exportService, chartAdapter, mapAdapter = null, pwaAdapter = null) {
    this._service = analysisService;
    this._pwa = pwaAdapter;
    this._export = exportService;
    this._charts = chartAdapter;
    this._map = mapAdapter;
    this._mapExpanded = null;
    this._mapRendered = false;
    this._mapExpandedContainerReady = false;
    this._viewMode = 'map';

    this._currentTurn = 2;
    this._activeFilter = 'ALL';
    this._currentTab = 'tabUFs';

    this._stateSort = { column: 'elec', direction: 'desc' };
    this._muniSort = { column: 'elec', direction: 'desc' };

    this._activeMuniFilter = 'ALL';
    this._munisLoading = false;
    this._participation = { metric: 'ABSTENCAO', band: 'ALL', minElec: 10000 };
    this._lastFocus = null;
    this._openUf = null;
    this._openMuni = null;
    this._applyingUrl = false;
    this._activeDemogFilter = 'ALL';
    this._activeDemogRegion = 'ALL';
    this._demogSort = { column: 'ratio', direction: 'desc' };
  }

  /**
   * Inicializa o controller e vincula eventos ao DOM
   */
  init() {
    this._injectStaticIcons();
    this._bindEvents();
    this._updateSortHeaderIcons();
    this._updateMuniSortHeaderIcons();
    this._updateDemogSortHeaderIcons();
    this.renderMap(2);
    this.updateTurn(2);
    this.renderDemogSection();
    this._renderViradaHighlight();
    this._renderDemogBands();
    this._renderMuniFilterLabels();
    this._renderProvenance();
    this._syncPressed();

    // Estado vindo do endereço (link compartilhado) e Voltar/Avançar do navegador
    this._applyUrlState(parseUrlState(window.location.hash), { initial: true });
    window.addEventListener('popstate', () => this._applyUrlState(parseUrlState(window.location.hash)));
  }

  /**
   * Botões de filtro e de turno anunciam o estado ativo para leitores de tela
   */
  _syncPressed() {
    document.querySelectorAll('.filter-chip, .chart-mini-filter, .segmented-control-btn').forEach(b => {
      b.setAttribute('aria-pressed', String(/\bactive/.test(b.className)));
    });
  }

  _collectUrlState() {
    const val = id => document.getElementById(id)?.value || '';
    return {
      tab: this._currentTab,
      turn: this._currentTurn,
      filter: this._activeFilter,
      muniFilter: this._activeMuniFilter,
      demogFilter: this._activeDemogFilter,
      demogRegion: this._activeDemogRegion,
      ufSearch: val('stateSearchInput'),
      muniSearch: val('muniSearchInput'),
      demogSearch: val('demogSearchInput'),
      uf: this._openUf,
      municipio: this._openMuni
    };
  }

  /**
   * Grava o estado no endereço: troca de aba cria entrada no histórico (Voltar funciona);
   * filtros, busca e janelas só substituem a entrada atual
   */
  _writeUrl(mode = 'replace') {
    if (this._applyingUrl) return;
    const hash = serializeUrlState(this._collectUrlState());
    if (hash === (window.location.hash === '#' ? '' : window.location.hash)) return;
    const url = window.location.pathname + window.location.search + hash;
    if (mode === 'push') window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
  }

  async _applyUrlState(state, { initial = false } = {}) {
    this._applyingUrl = true;
    try {
      if (state.turn !== this._currentTurn) this.updateTurn(state.turn);

      const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      setVal('stateSearchInput', state.ufSearch);
      setVal('muniSearchInput', state.muniSearch);
      setVal('demogSearchInput', state.demogSearch);
      setVal('demogRegionSelect', state.demogRegion);
      this._activeDemogRegion = state.demogRegion;

      this.setFilter(state.filter);
      this.setDemogFilter(state.demogFilter);
      this.setMuniFilter(state.muniFilter);
      // Na abertura em UFs fica no topo; vindo de um link ou do Voltar, rola até a aba
      this.switchTab(state.tab, { scroll: !(initial && state.tab === 'tabUFs') });

      if (state.uf) this.openStateModal(state.uf);
      else this.closeModal();

      if (state.municipio) {
        if (!this._service.isMunicipalitiesLoaded()) await this._service.loadMunicipalities();
        this._applyingUrl = true;
        await this.openMuniModal(state.municipio);
      } else {
        this.closeMuniModal();
      }
    } catch (err) {
      console.error('[STK-GOVERNO-BRAZIL] Estado do endereço não aplicado:', err);
    } finally {
      this._applyingUrl = false;
    }
    // Normaliza o endereço (remove valores inválidos ou padrão)
    this._writeUrl('replace');
  }

  /**
   * Rodapé: hashes das fontes. Montado com textContent (dados nunca viram HTML)
   */
  _renderProvenance() {
    const prov = this._service.getProvenance();
    const list = document.getElementById('provenanceList');
    if (!prov || !list) return;

    const fmtDate = iso => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });
    setText('provenanceGeneratedAt', `base gerada em ${fmtDate(prov.geradoEm)}`);

    const item = (title, href, linkText, details, hash) => {
      const li = document.createElement('li');
      const head = document.createElement('div');
      head.className = 'footer-provenance-item-head';
      const strong = document.createElement('strong');
      strong.textContent = title;
      head.appendChild(strong);
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = linkText;
        head.appendChild(a);
      }
      const meta = document.createElement('span');
      meta.className = 'footer-provenance-meta';
      meta.textContent = details;
      const code = document.createElement('code');
      code.className = 'footer-provenance-hash';
      code.textContent = hash;
      li.append(head, meta, code);
      return li;
    };

    list.replaceChildren(
      ...prov.tse.map(f => item(`TSE · ${f.arquivo}`, f.pacote, 'pacote oficial (.zip)',
        `${fmtInt(f.bytes)} bytes · obtido em ${fmtDate(f.obtidoEm)}`, f.sha256)),
      item('IBGE · População residente (Censo 2022)', prov.ibge.api, 'API do IBGE',
        `${prov.ibge.tabela} · ${fmtInt(prov.ibge.municipios)} municípios · hash da tabela "codigo_ibge;populacao" ordenada`, prov.ibge.sha256Tabela)
    );

    const div = prov.divergencias?.t1ValidosAcimaDaSomaDosCandidatos ?? 0;
    setText('provenanceDivergence', div
      ? `Divergência conhecida entre arquivos do TSE: no 1º turno, os votos válidos do detalhe por seção somam ${fmtInt(div)} a mais que a soma dos candidatos. O painel usa os válidos oficiais nos percentuais.`
      : '');
  }

  /**
   * Chips da tabela federativa: contagens do turno atual e UFs que viraram
   */
  _renderStateFilterLabels(turn) {
    const c = this._service.getStateFilterCounts(turn);
    const v = c.viradaUFs;
    setText('fltALL', withCount('Todas', c.ALL));
    setText('fltPT', withCount('Vitória PT', c.PT));
    setText('fltPL', withCount('Vitória PL', c.PL));
    setText('fltVIRADA', v.length === 0 ? 'Virada (nenhuma)' : v.length <= 3 ? `Virada (${v.join(', ')})` : withCount('Virada', v.length));
  }

  /**
   * Chips municipais: faixas sempre; contagens só depois que a base municipal carregar
   */
  _renderMuniFilterLabels() {
    const loaded = this._service.isMunicipalitiesLoaded();
    const c = loaded ? this._service.getMunicipalityFilterCounts(this._currentTurn) : null;
    const label = (text, key) => (c ? withCount(text, c[key]) : text);
    setText('fltMuniALL', label('Todos', 'ALL'));
    setText('fltMuniPT', label('Vitória PT', 'PT'));
    setText('fltMuniPL', label('Vitória PL', 'PL'));
    setText('fltMuniVirada', label('Virada 1º→2º', 'VIRADA'));

    const t = this._currentTurn;
    setText('thMuniVoteLabel', `Votação ${t}ºT (PT × PL)`);
    setText('thMuniWinnerLabel', `Vencedor ${t}ºT`);

    if (loaded) {
      const v = this._service.getMunicipalityViradaSummary();
      setText('muniViradaSummary', v.total
        ? `${fmtInt(v.total)} municípios trocaram de vencedor entre os turnos: ${fmtInt(v.paraPT)} para o PT e ${fmtInt(v.paraPL)} para o PL. ` +
          `Maiores: ${v.maiores.map(m => `${m.name}/${m.uf} (${m.winner})`).join(', ')}.`
        : 'Nenhum município trocou de vencedor entre os turnos.');
    }
    setText('fltMuniCapitais', label('Capitais', 'CAPITAIS'));
    setText('fltMuniAlta', label(`Alta Densidade ${MUNI_RANGES.ALTA}`, 'ALTA'));
    setText('fltMuniJovem', label(`Base Jovem ${MUNI_RANGES.JOVEM}`, 'JOVEM'));
  }

  /**
   * Resumo abaixo do gráfico de rosca: regiões inteiras conquistadas + UFs avulsas
   */
  _renderPartyGeography(turn) {
    const geo = this._service.getPartyGeography(turn);
    const describe = g => {
      const parts = [...g.fullRegions];
      if (g.otherUFs.length) parts.push(g.otherUFs.length <= 4 ? g.otherUFs.join(', ') : `${g.otherUFs.length} UFs`);
      return parts.length ? parts.join(' + ') : '—';
    };
    setText('donutPTRegions', describe(geo.PT));
    setText('donutPLRegions', describe(geo.PL));
  }

  /**
   * Destaque de virada gerado a partir dos dados (UFs com vencedor diferente entre os turnos)
   */
  _renderViradaHighlight() {
    const viradas = this._service.getViradas();
    const title = document.getElementById('viradaTitle');
    const text = document.getElementById('viradaText');
    const badge = document.getElementById('mapViradaBadge');
    const names = { PT: 'Lula (PT)', PL: 'Flávio Bolsonaro (PL)' };

    if (badge) {
      badge.textContent = viradas.length
        ? `Virada no 2º turno: ${viradas.map(v => v.uf).join(', ')}`
        : 'Nenhuma virada no 2º turno';
    }
    if (!title || !text) return;

    if (viradas.length === 0) {
      title.textContent = 'Nenhuma UF virou entre os turnos';
      text.textContent = 'Todas as 27 UFs mantiveram o mesmo vencedor no 1º e no 2º turno.';
      return;
    }

    if (viradas.length > 1) {
      title.textContent = `Destaque de Virada Eleitoral: ${viradas.length} UFs`;
      text.innerHTML = viradas.map(v =>
        `<strong>${esc(v.name)} (${esc(v.uf)})</strong>: ${esc(v.winT1)} no 1º turno, ${esc(v.winT2)} no 2º (saldo de <strong>+${fmtInt(v.saldoT2)}</strong>)`
      ).join('<br>');
      return;
    }

    const v = viradas[0];
    const t1Win = v.winT1 === 'PT' ? { votes: v.t1.lula, pct: v.t1.lulaPct } : { votes: v.t1.flavio, pct: v.t1.flavioPct };
    const t1Lose = v.winT1 === 'PT' ? { votes: v.t1.flavio, pct: v.t1.flavioPct } : { votes: v.t1.lula, pct: v.t1.lulaPct };
    const t2Win = v.winT2 === 'PT' ? { votes: v.t2.lula, pct: v.t2.lulaPct } : { votes: v.t2.flavio, pct: v.t2.flavioPct };
    const t2Lose = v.winT2 === 'PT' ? { votes: v.t2.flavio, pct: v.t2.flavioPct } : { votes: v.t2.lula, pct: v.t2.lulaPct };

    title.textContent = `Destaque de Virada Eleitoral: ${v.name} (${v.uf})`;
    text.innerHTML =
      `No <strong>1º Turno</strong>, ${names[v.winT1]} liderou com <strong>${fmtInt(t1Win.votes)} (${fmtPct(t1Win.pct)})</strong> ` +
      `contra <strong>${fmtInt(t1Lose.votes)} (${fmtPct(t1Lose.pct)})</strong> dos votos válidos. ` +
      `No <strong>2º Turno</strong>, ${names[v.winT2]} virou com <strong>${fmtInt(t2Win.votes)} (${fmtPct(t2Win.pct)})</strong> ` +
      `a <strong>${fmtInt(t2Lose.votes)} (${fmtPct(t2Lose.pct)})</strong>, saldo de <strong>+${fmtInt(v.saldoT2)} votos</strong>.`;
  }

  /**
   * Cards de faixa demográfica listam as UFs que realmente estão em cada faixa
   */
  _renderDemogBands() {
    const bands = this._service.getDemographicBands();
    const describe = list => list.length
      ? `${list.length} UF${list.length > 1 ? 's' : ''}: ${list.map(s => `${s.uf} (${fmtPct(s.ratioElecPop, 1)})`).join(', ')}.`
      : 'Nenhuma UF nesta faixa.';
    setText('demogTipicaDesc', describe(bands.TIPICA));
    setText('demogAltaDesc', describe(bands.ALTA));
    setText('demogJovemDesc', describe(bands.JOVEM));

    setText('demogTipicaTitle', `Faixa Típica Nacional (${UF_RANGES.TIPICA})`);
    setText('demogAltaTitle', `Alta Densidade (${UF_RANGES.ALTA})`);
    setText('demogJovemTitle', `Base Jovem / Menor Razão (${UF_RANGES.JOVEM})`);

    const total = bands.TIPICA.length + bands.ALTA.length + bands.JOVEM.length;
    setText('fltDemogALL', withCount('Todas', total));
    setText('fltDemogTipica', withCount(`Média ${UF_RANGES.TIPICA}`, bands.TIPICA.length));
    setText('fltDemogAlta', withCount(`Alta Densidade ${UF_RANGES.ALTA}`, bands.ALTA.length));
    setText('fltDemogJovem', withCount(`Base Jovem ${UF_RANGES.JOVEM}`, bands.JOVEM.length));
  }

  /**
   * Placar e composição de cada macrorregião no turno atual
   */
  _renderRegionCards(turn) {
    const ids = { 'Norte': 'Norte', 'Nordeste': 'Nordeste', 'Centro-Oeste': 'CentroOeste', 'Sudeste': 'Sudeste', 'Sul': 'Sul' };
    this._service.getRegionSummary(turn).forEach(r => {
      const key = ids[r.region];
      const score = document.getElementById(`reg${key}Score`);
      const desc = document.getElementById(`reg${key}Desc`);
      setText(`reg${key}Title`, `Região ${r.region} (${r.total} UF${r.total > 1 ? 's' : ''})`);
      const pt = r.ptUFs.length;
      const pl = r.plUFs.length;

      if (score) {
        const lead = pt >= pl ? `PT ${pt} × ${pl} PL` : `PL ${pl} × ${pt} PT`;
        score.textContent = (pt === 0 || pl === 0) ? `${lead} (100%)` : lead;
      }
      if (desc) {
        let txt;
        if (pl === 0) txt = `PT venceu em todas as ${r.total} UFs (${listUFs(r.ptUFs)}).`;
        else if (pt === 0) txt = `PL venceu em todas as ${r.total} UFs (${listUFs(r.plUFs)}).`;
        else txt = `PT: ${listUFs(r.ptUFs)}. PL: ${listUFs(r.plUFs)}.`;
        if (r.viradas.length) txt += ` Virada entre turnos: ${listUFs(r.viradas)}.`;
        desc.textContent = txt;
      }
    });
  }

  _injectStaticIcons() {
    const iconBindings = [
      { id: 'iconMenu', name: 'menu' },
      { id: 'iconCloseSidebar', name: 'close' },
      { id: 'iconExportCsv', name: 'fileCsv' },
      { id: 'iconShare', name: 'share' },
      { id: 'iconDiffCard', name: 'scale' },
      { id: 'iconDemogCard', name: 'users' },
      { id: 'iconViradaHighlight', name: 'refresh' },
      { id: 'iconCollegesHeader', name: 'chartColumn' },
      { id: 'iconUfPieHeader', name: 'chartPie' },
      { id: 'iconTabUFs', name: 'tableList' },
      { id: 'iconTabMunis', name: 'city' },
      { id: 'iconTabDemog', name: 'scaleUnbalanced' },
      { id: 'iconTabMapa', name: 'map' },
      { id: 'iconBottomUFs', name: 'tableList' },
      { id: 'iconBottomMunis', name: 'city' },
      { id: 'iconBottomDemog', name: 'scaleUnbalanced' },
      { id: 'iconBottomMapa', name: 'map' },
      { id: 'iconInstallApp', name: 'download' },
      { id: 'iconProvenance', name: 'checkCircle' },
      { id: 'iconExportMuniCsv', name: 'fileCsv' },
      { id: 'iconParticipation', name: 'userX' },
      { id: 'iconMuniModalClose', name: 'close' },
      { id: 'iconTabMapHeader', name: 'map' },
      { id: 'iconMapHeader', name: 'map' },
      { id: 'iconViewMap', name: 'map' },
      { id: 'iconViewBar', name: 'chartColumn' },
      { id: 'iconSearchState', name: 'search' },
      { id: 'iconSearchMuni', name: 'search' },
      { id: 'iconSearchDemog', name: 'search' },
      { id: 'iconModalClose', name: 'close' },
      { id: 'iconViradaModal', name: 'refresh' },
      { id: 'iconAdvantageHeader', name: 'scale' },
      { id: 'iconCardAdvPT', name: 'trendingUp' },
      { id: 'iconCardAdvPL', name: 'trendingUp' },
      { id: 'iconCardTurnout', name: 'userCheck' },
      { id: 'iconCardInvalidos', name: 'userX' },
      { id: 'iconFooterDb', name: 'database' },
      { id: 'iconTseExt', name: 'externalLink' },
      { id: 'iconIbgeExt', name: 'externalLink' },
      { id: 'iconToggleSidebar', name: 'panelLeft' }
    ];

    iconBindings.forEach(({ id, name }) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = getIcon(name);
    });
  }

  _bindEvents() {
    // Controle Unificado da Barra Lateral (Mobile Drawer & Desktop Collapse)
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const btnClose = document.getElementById('btnCloseSidebar');
    const btnToggle = document.getElementById('btnToggleSidebar');

    const toggleSidebar = () => {
      if (window.innerWidth < 1024) {
        // Mobile / Tablet (<1024px): Abre e fecha a gaveta lateral com backdrop
        const isOpen = sidebar?.classList.toggle('sidebar-open');
        if (isOpen) {
          backdrop?.classList.remove('hidden');
        } else {
          backdrop?.classList.add('hidden');
        }
      } else {
        // Desktop (>=1024px): Diminui e aumenta a barra lateral
        sidebar?.classList.remove('sidebar-open');
        backdrop?.classList.add('hidden');
        const isCollapsed = sidebar?.classList.toggle('sidebar-collapsed');
        localStorage.setItem('stk_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      }
    };

    const closeSidebar = () => {
      sidebar?.classList.remove('sidebar-open');
      backdrop?.classList.add('hidden');
    };

    btnToggle?.addEventListener('click', toggleSidebar);
    btnClose?.addEventListener('click', closeSidebar);
    backdrop?.addEventListener('click', closeSidebar);

    // Restaurar estado salvo de diminuir/aumentar no desktop
    if (window.innerWidth >= 1024 && localStorage.getItem('stk_sidebar_collapsed') === 'true') {
      sidebar?.classList.add('sidebar-collapsed');
    }

    // Alternância de Turnos
    document.getElementById('btnTurn1')?.addEventListener('click', () => { this.updateTurn(1); this._writeUrl(); });
    document.getElementById('btnTurn2')?.addEventListener('click', () => { this.updateTurn(2); this._writeUrl(); });

    // Abas de Navegação
    document.getElementById('tabBtnUFs')?.addEventListener('click', () => this.switchTab('tabUFs'));
    document.getElementById('tabBtnMunicipios')?.addEventListener('click', () => this.switchTab('tabMunicipios'));
    document.getElementById('tabBtnDemografia')?.addEventListener('click', () => this.switchTab('tabDemografia'));
    document.getElementById('tabBtnMapa')?.addEventListener('click', () => this.switchTab('tabMapa'));

    // Barra de abas inferior (celular)
    document.querySelectorAll('#appBottomNav [data-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Botão "Instalar" só aparece quando o navegador oferece a instalação do PWA
    const btnInstall = document.getElementById('btnInstallApp');
    if (btnInstall && this._pwa) {
      this._pwa.onInstallAvailabilityChange(can => { btnInstall.hidden = !can; });
      btnInstall.addEventListener('click', () => this._pwa.install());
    }

    // Alternância de Visão (Mapa do Brasil vs Gráfico de Barras)
    document.getElementById('btnViewMap')?.addEventListener('click', () => this.setViewMode('map'));
    document.getElementById('btnViewBar')?.addEventListener('click', () => this.setViewMode('bar'));

    // Filtros Rápidos do Mapa (Todas, PT, PL)
    document.getElementById('mapFltAll')?.addEventListener('click', () => {
      this._setMapPartyFilter('ALL');
      this._map?.filterParty('ALL');
      this._mapExpanded?.filterParty('ALL');
    });
    document.getElementById('mapFltPT')?.addEventListener('click', () => {
      this._setMapPartyFilter('PT');
      this._map?.filterParty('PT');
      this._mapExpanded?.filterParty('PT');
    });
    document.getElementById('mapFltPL')?.addEventListener('click', () => {
      this._setMapPartyFilter('PL');
      this._map?.filterParty('PL');
      this._mapExpanded?.filterParty('PL');
    });

    // Interações com Cards de Macrorregiões da Aba do Mapa
    ['Norte', 'Nordeste', 'CentroOeste', 'Sudeste', 'Sul'].forEach(reg => {
      const el = document.getElementById(`regionCard${reg}`);
      if (el) {
        const regionName = reg === 'CentroOeste' ? 'Centro-Oeste' : reg;
        el.addEventListener('mouseenter', () => {
          this._mapExpanded?.filterRegion(regionName);
          this._map?.filterRegion(regionName);
        });
        el.addEventListener('mouseleave', () => {
          this._mapExpanded?.filterRegion('ALL');
          this._map?.filterRegion('ALL');
        });
        el.addEventListener('click', () => {
          this.openStateModal(reg === 'Sudeste' ? 'SP' : reg === 'Nordeste' ? 'BA' : reg === 'Norte' ? 'PA' : reg === 'Sul' ? 'RS' : 'DF');
        });
      }
    });

    // Filtros de UF (Aba 1)
    ['ALL', 'PT', 'PL', 'VIRADA'].forEach(flt => {
      document.getElementById(`flt${flt}`)?.addEventListener('click', () => this.setFilter(flt));
    });

    // Filtros de Municípios (Aba 2)
    ['MuniALL', 'MuniPT', 'MuniPL', 'MuniVirada', 'MuniCapitais', 'MuniAlta', 'MuniJovem'].forEach(flt => {
      const code = flt.replace('Muni', '').toUpperCase();
      document.getElementById(`flt${flt}`)?.addEventListener('click', () => this.setMuniFilter(code));
    });

    // Filtros Demográficos (Aba 3)
    ['DemogALL', 'DemogTipica', 'DemogAlta', 'DemogJovem'].forEach(flt => {
      const code = flt.replace('Demog', '').toUpperCase();
      document.getElementById(`flt${flt}`)?.addEventListener('click', () => this.setDemogFilter(code));
    });

    // Select e Busca da Demografia (Aba 3)
    document.getElementById('demogRegionSelect')?.addEventListener('change', (e) => {
      this._activeDemogRegion = e.target.value;
      this.renderDemogSection();
      this._writeUrl();
    });
    document.getElementById('demogSearchInput')?.addEventListener('input', () => { this.renderDemogSection(); this._writeUrl(); });

    // Cards Conceituais Clicáveis como Filtro (Aba 3)
    document.getElementById('cardDemogTipica')?.addEventListener('click', () => this.setDemogFilter('TIPICA'));
    document.getElementById('cardDemogAlta')?.addEventListener('click', () => this.setDemogFilter('ALTA'));
    document.getElementById('cardDemogJovem')?.addEventListener('click', () => this.setDemogFilter('JOVEM'));

    // Inputs de Busca
    document.getElementById('stateSearchInput')?.addEventListener('input', () => { this.renderUFTable(); this._writeUrl(); });
    document.getElementById('muniSearchInput')?.addEventListener('input', () => { this.renderMuniTable(); this._writeUrl(); });

    // Abas do menu lateral: setas, Home e End (padrão WAI-ARIA de abas, ativação automática)
    document.querySelector('.sidebar-nav-list[role="tablist"]')?.addEventListener('keydown', e => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      const idx = TAB_ORDER.indexOf(this._currentTab);
      let next = null;
      if (e.key in keys) next = TAB_ORDER[(idx + keys[e.key] + TAB_ORDER.length) % TAB_ORDER.length];
      else if (e.key === 'Home') next = TAB_ORDER[0];
      else if (e.key === 'End') next = TAB_ORDER[TAB_ORDER.length - 1];
      if (!next) return;
      e.preventDefault();
      this.switchTab(next);
      document.getElementById(TAB_BUTTONS[next])?.focus();
    });

    // Dropdown Legado de Ordenação (Sincronizado com os cabeçalhos)
    document.getElementById('stateSortSelect')?.addEventListener('change', (e) => {
      const val = e.target.value;
      const parts = val.split('-');
      this._stateSort = { column: parts[0], direction: parts[1] || 'desc' };
      this._updateSortHeaderIcons();
      this.renderUFTable();
    });

    // Ordenação Interativa Multicoluna - Tabela Federativa
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (col) this.handleStateSort(col);
      });
    });

    // Ordenação Interativa Multicoluna - Tabela Municipal
    document.querySelectorAll('th[data-sort-muni]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sortMuni;
        if (col) this.handleMuniSort(col);
      });
    });

    // Ordenação Interativa Multicoluna - Tabela Demográfica
    document.querySelectorAll('th[data-sort-demog]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sortDemog;
        if (col) this.handleDemogSort(col);
      });
    });

    // Exportações
    document.getElementById('btnExportCsv')?.addEventListener('click', () => this.exportCsv());
    document.getElementById('btnShare')?.addEventListener('click', () => this.shareData());

    // Modal
    // Detalhe do município (zonas): delegação no corpo da tabela municipal
    document.getElementById('muniTableBody')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-tse]');
      if (btn) this.openMuniModal(btn.dataset.tse);
    });
    document.getElementById('muniModalClose')?.addEventListener('click', () => this.closeMuniModal());
    document.getElementById('muniModal')?.addEventListener('click', e => {
      if (e.target.id === 'muniModal') this.closeMuniModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      this.closeMuniModal();
      this.closeModal();
    });
    document.getElementById('btnExportMuniCsv')?.addEventListener('click', () => this.exportMuniCsv());

    // Ranking de participação
    ['ABSTENCAO', 'NAO_NOMINAL'].forEach(metric => {
      document.getElementById(`fltPart${metric}`)?.addEventListener('click', () => this.setParticipation({ metric }));
    });
    ['ALL', 'ALTA', 'TIPICA', 'JOVEM'].forEach(band => {
      document.getElementById(`fltPartBand${band}`)?.addEventListener('click', () => this.setParticipation({ band }));
    });
    document.getElementById('partMinElec')?.addEventListener('change', e => this.setParticipation({ minElec: Number(e.target.value) }));

    document.getElementById('modalCloseBtn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modalCloseBtnBottom')?.addEventListener('click', () => this.closeModal());
    document.getElementById('stateModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'stateModal') this.closeModal();
    });

    // Atalho: tabela federativa filtrada pelas UFs que viraram
    document.getElementById('btnFilterVirada')?.addEventListener('click', () => {
      const input = document.getElementById('stateSearchInput');
      if (input) input.value = '';
      this.switchTab('tabUFs');
      this.setFilter('VIRADA');
    });
  }

  updateTurn(turn) {
    this._currentTurn = turn;

    const b1 = document.getElementById('btnTurn1');
    const b2 = document.getElementById('btnTurn2');

    if (turn === 1) {
      if (b1) b1.className = 'segmented-control-btn active';
      if (b2) b2.className = 'segmented-control-btn';
    } else {
      if (b1) b1.className = 'segmented-control-btn';
      if (b2) b2.className = 'segmented-control-btn active';
    }
    this._syncPressed();

    const summary = this._service.getNationalSummary(turn);

    // Atualiza cards de métricas
    this._updateMetricCards(summary);

    // Atualiza tabela federativa
    this.renderUFTable();

    // Atualiza gráficos
    const topCollegesData = this._service.getTopCollegesChartData(turn);
    this._charts.renderTopCollegesChart('barChartCollegios', topCollegesData);

    const ufDivisionData = this._service.getUfDivisionChartData(turn);
    this._charts.renderUfDivisionChart('doughnutUFs', ufDivisionData);

    const chartTurnLabel = document.getElementById('chartTurnLabel');
    if (chartTurnLabel) {
      chartTurnLabel.textContent = `Exibindo: ${turn}º Turno`;
    }

    const donutPT = document.getElementById('donutPTText');
    if (donutPT) donutPT.textContent = `PT: ${summary.ptUFs} UFs`;
    const donutPL = document.getElementById('donutPLText');
    if (donutPL) donutPL.textContent = `PL: ${summary.plUFs} UFs`;

    // Atualiza Mapa Geopolítico do Brasil
    this.renderMap(turn);
    this._renderRegionCards(turn);
    this._renderStateFilterLabels(turn);
    // A aba Municipal segue o turno do topo
    this._renderMuniFilterLabels();
    if (this._service.isMunicipalitiesLoaded()) {
      this.renderMuniTable();
      this.renderParticipation();
    }
    this._renderPartyGeography(turn);
  }

  _updateMetricCards(summary) {
    const isT2 = summary.turn === 2;

    // Card Lula
    document.getElementById('cardLulaPct').textContent = `${summary.ptPct.toFixed(2).replace('.', ',')}%`;
    document.getElementById('cardLulaVotes').textContent = `${summary.ptVotes.toLocaleString('pt-BR')} votos`;
    document.getElementById('cardLulaUFs').textContent = `${summary.ptUFs} UFs`;

    const badgeLula = document.getElementById('badgeLulaStatus');
    if (badgeLula) {
      badgeLula.textContent = isT2 ? 'Reeleito' : '2º Colocado';
      badgeLula.className = isT2
        ? 'badge-status badge-pt'
        : 'badge-status bg-slate-800 text-slate-300 border border-slate-700';
    }

    // Card Flávio
    document.getElementById('cardFlavioPct').textContent = `${summary.plPct.toFixed(2).replace('.', ',')}%`;
    document.getElementById('cardFlavioVotes').textContent = `${summary.plVotes.toLocaleString('pt-BR')} votos`;
    document.getElementById('cardFlavioUFs').textContent = `${summary.plUFs} UFs`;

    const badgeFlavio = document.getElementById('badgeFlavioStatus');
    if (badgeFlavio) {
      badgeFlavio.textContent = isT2 ? '2º Colocado' : 'Líder do 1ºT';
      badgeFlavio.className = 'badge-status badge-pl';
    }

    // Card Saldo
    const diffEl = document.getElementById('cardDiffVotes');
    const diffPctEl = document.getElementById('cardDiffPct');
    if (diffEl) {
      diffEl.textContent = `+${summary.diffVotes.toLocaleString('pt-BR')}`;
    }
    if (diffPctEl) {
      diffPctEl.textContent = `Margem: +${summary.diffPct.toFixed(2).replace('.', ',')} pp (${summary.leader})`;
      diffPctEl.className = summary.leader === 'PT' ? 'text-xs text-emerald-400 font-mono mt-0.5' : 'text-xs text-plBlue-400 font-mono mt-0.5';
    }

    const spoiledEl = document.getElementById('cardSpoiled');
    if (spoiledEl) spoiledEl.textContent = summary.spoiledVotes.toLocaleString('pt-BR');

    // Card Demografia
    const elecRatioEl = document.getElementById('cardElecRatio');
    if (elecRatioEl) elecRatioEl.textContent = `${summary.nationalRatio.toFixed(2).replace('.', ',')}%`;

    const elecPopDetail = document.getElementById('cardElecPopDetail');
    if (elecPopDetail) {
      elecPopDetail.textContent = `${(summary.totalElec / 1000000).toFixed(1).replace('.', ',')}M / ${(summary.totalPop / 1000000).toFixed(1).replace('.', ',')}M`;
    }

    // Seção Estratégica: Soma das Vantagens & Indicadores Globais
    const labelTurnBadge = document.getElementById('labelTurnBadge');
    if (labelTurnBadge) labelTurnBadge.textContent = `${summary.turn}º Turno Consolidado`;

    // Card 1 & 2: Vantagens PT e PL
    const cardAdvPT = document.getElementById('cardAdvantagePT');
    if (cardAdvPT) cardAdvPT.textContent = `+${summary.sumAdvantagePT.toLocaleString('pt-BR')}`;

    const cardAdvPTSub = document.getElementById('cardAdvantagePTSub');
    if (cardAdvPTSub) cardAdvPTSub.textContent = `Soma dos saldos nas ${summary.ptUFs} UFs vencidas`;

    const cardAdvPL = document.getElementById('cardAdvantagePL');
    if (cardAdvPL) cardAdvPL.textContent = `+${summary.sumAdvantagePL.toLocaleString('pt-BR')}`;

    const cardAdvPLSub = document.getElementById('cardAdvantagePLSub');
    if (cardAdvPLSub) cardAdvPLSub.textContent = `Soma dos saldos nas ${summary.plUFs} UFs vencidas`;

    const totalAdv = summary.sumAdvantagePT + summary.sumAdvantagePL;
    const ptAdvPct = totalAdv > 0 ? (summary.sumAdvantagePT / totalAdv) * 100 : 50;
    const plAdvPct = 100 - ptAdvPct;

    const barAdvPT = document.getElementById('barAdvPT');
    if (barAdvPT) barAdvPT.style.width = `${ptAdvPct.toFixed(1)}%`;

    const barAdvPL = document.getElementById('barAdvPL');
    if (barAdvPL) barAdvPL.style.width = `${plAdvPct.toFixed(1)}%`;

    const barAdvPLSecond = document.getElementById('barAdvPLSecond');
    if (barAdvPLSecond) barAdvPLSecond.style.width = `${plAdvPct.toFixed(1)}%`;

    const pctAdvPT = document.getElementById('pctAdvPT');
    if (pctAdvPT) pctAdvPT.textContent = `${ptAdvPct.toFixed(2).replace('.', ',')}% da margem bruta`;

    const pctAdvPL = document.getElementById('pctAdvPL');
    if (pctAdvPL) pctAdvPL.textContent = `${plAdvPct.toFixed(2).replace('.', ',')}% da margem bruta`;

    const netLeaderLabel = document.getElementById('cardNetLeaderLabel');
    if (netLeaderLabel) {
      netLeaderLabel.textContent = `Saldo: +${(summary.netAdvantage / 1000000).toFixed(1).replace('.', ',')}M (${summary.netLeader})`;
      netLeaderLabel.className = summary.netLeader === 'PT' ? 'text-ptRed-400 font-bold' : 'text-plBlue-400 font-bold';
    }

    // Card 3: Comparecimento vs Abstenção Oficial
    const cardTurnoutPct = document.getElementById('cardTurnoutPct');
    if (cardTurnoutPct) cardTurnoutPct.textContent = `${summary.turnoutPct.toFixed(2).replace('.', ',')}%`;

    const cardTurnoutVotes = document.getElementById('cardTurnoutVotes');
    if (cardTurnoutVotes) cardTurnoutVotes.textContent = summary.totalComparecimento.toLocaleString('pt-BR');

    const barTurnout = document.getElementById('barTurnout');
    if (barTurnout) barTurnout.style.width = `${summary.turnoutPct.toFixed(1)}%`;

    const barAbstencao = document.getElementById('barAbstencao');
    if (barAbstencao) barAbstencao.style.width = `${summary.abstencaoPct.toFixed(1)}%`;

    const cardAbstencaoDetail = document.getElementById('cardAbstencaoDetail');
    if (cardAbstencaoDetail) {
      cardAbstencaoDetail.textContent = `${summary.totalAbstencoes.toLocaleString('pt-BR')} (${summary.abstencaoPct.toFixed(2).replace('.', ',')}%)`;
    }

    // Card 4: Votos Não-Nominais (Brancos & Nulos)
    const cardInvalidosPct = document.getElementById('cardInvalidosPct');
    if (cardInvalidosPct) cardInvalidosPct.textContent = `${summary.invalidosPct.toFixed(2).replace('.', ',')}%`;

    const cardInvalidosVotes = document.getElementById('cardInvalidosVotes');
    if (cardInvalidosVotes) cardInvalidosVotes.textContent = summary.totalInvalidos.toLocaleString('pt-BR');

    const cardBrancosDetail = document.getElementById('cardBrancosDetail');
    if (cardBrancosDetail) cardBrancosDetail.textContent = summary.totalBrancos.toLocaleString('pt-BR');

    const cardNulosDetail = document.getElementById('cardNulosDetail');
    if (cardNulosDetail) cardNulosDetail.textContent = summary.totalNulos.toLocaleString('pt-BR');
  }

  _setMapPartyFilter(party) {
    const btnAll = document.getElementById('mapFltAll');
    const btnPT = document.getElementById('mapFltPT');
    const btnPL = document.getElementById('mapFltPL');
    if (btnAll) btnAll.className = party === 'ALL' ? 'chart-mini-filter active-all' : 'chart-mini-filter';
    if (btnPT) btnPT.className = party === 'PT' ? 'chart-mini-filter active-pt' : 'chart-mini-filter';
    if (btnPL) btnPL.className = party === 'PL' ? 'chart-mini-filter active-pl' : 'chart-mini-filter';
    this._syncPressed();
  }

  setFilter(flt) {
    this._activeFilter = flt;
    ['ALL', 'PT', 'PL', 'VIRADA'].forEach(f => {
      const b = document.getElementById(`flt${f}`);
      if (b) {
        if (f === flt) {
          b.className = f === 'VIRADA'
            ? 'filter-chip active-gold'
            : (f === 'PT' ? 'filter-chip active-pt' : (f === 'PL' ? 'filter-chip active-pl' : 'filter-chip active-primary'));
        } else {
          b.className = 'filter-chip';
        }
      }
    });
    this.renderUFTable();
    this._syncPressed();
    this._writeUrl();
  }

  setMuniFilter(flt) {
    this._activeMuniFilter = flt;
    const filterIds = {
      ALL: 'fltMuniALL',
      PT: 'fltMuniPT',
      PL: 'fltMuniPL',
      VIRADA: 'fltMuniVirada',
      CAPITAIS: 'fltMuniCapitais',
      ALTA: 'fltMuniAlta',
      JOVEM: 'fltMuniJovem'
    };

    Object.entries(filterIds).forEach(([code, id]) => {
      const btn = document.getElementById(id);
      if (btn) {
        if (code === flt) {
          btn.className = code === 'PT'
            ? 'filter-chip active-pt'
            : (code === 'PL' ? 'filter-chip active-pl' : (code === 'VIRADA' ? 'filter-chip active-gold' : 'filter-chip active-primary'));
        } else {
          btn.className = 'filter-chip';
        }
      }
    });

    if (this._currentTab === 'tabMunicipios') this.renderMuniTable();
    this._syncPressed();
    this._writeUrl();
  }

  setDemogFilter(flt) {
    this._activeDemogFilter = flt;
    const filterIds = {
      ALL: 'fltDemogALL',
      TIPICA: 'fltDemogTipica',
      ALTA: 'fltDemogAlta',
      JOVEM: 'fltDemogJovem'
    };

    Object.entries(filterIds).forEach(([code, id]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.className = code === flt ? 'filter-chip active-primary' : 'filter-chip';
      }
    });

    this.renderDemogSection();
    this._syncPressed();
    this._writeUrl();
  }

  renderMap(turn = this._currentTurn) {
    const states = this._service.getAllStates();
    if (this._map) {
      if (!this._mapRendered) {
        this._map.render('brazilMapContainer', states, turn, (uf) => this.openStateModal(uf));
        this._mapRendered = true;
      } else {
        this._map.update(states, turn);
      }
    }

    if (this._mapExpanded) {
      this._mapExpanded.update(states, turn);
    }
  }

  setViewMode(mode) {
    this._viewMode = mode;
    const viewMapWrapper = document.getElementById('viewMapWrapper');
    const viewBarWrapper = document.getElementById('viewBarWrapper');
    const btnMap = document.getElementById('btnViewMap');
    const btnBar = document.getElementById('btnViewBar');
    const title = document.getElementById('mapSectionTitle');
    const subtitle = document.getElementById('mapSectionSubtitle');

    if (mode === 'map') {
      if (viewMapWrapper) viewMapWrapper.classList.remove('hidden');
      if (viewBarWrapper) viewBarWrapper.classList.add('hidden');
      if (btnMap) btnMap.className = 'segmented-control-btn active';
      if (btnBar) btnBar.className = 'segmented-control-btn';
      if (title) title.textContent = 'Mapa Geopolítico das 27 UFs';
      if (subtitle) subtitle.textContent = 'Divisão territorial de votos no turno selecionado (Passe o mouse ou clique na UF)';
    } else {
      if (viewMapWrapper) viewMapWrapper.classList.add('hidden');
      if (viewBarWrapper) viewBarWrapper.classList.remove('hidden');
      if (btnMap) btnMap.className = 'segmented-control-btn';
      if (btnBar) btnBar.className = 'segmented-control-btn active';
      if (title) title.textContent = 'Disputa nos 8 Maiores Colégios Eleitorais';
      if (subtitle) subtitle.textContent = 'Votos nominais apurados no turno selecionado';
    }
  }

  renderExpandedMap() {
    if (!this._mapExpanded) {
      import('../infrastructure/maps/BrazilMapAdapter.js').then(({ BrazilMapAdapter }) => {
        this._mapExpanded = new BrazilMapAdapter();
        const states = this._service.getAllStates();
        this._mapExpanded.render('brazilMapExpandedContainer', states, this._currentTurn, (uf) => this.openStateModal(uf));
      });
    } else {
      const states = this._service.getAllStates();
      this._mapExpanded.update(states, this._currentTurn);
    }
  }

  switchTab(tabId, { scroll = true } = {}) {
    if (!TAB_ORDER.includes(tabId)) tabId = 'tabUFs';
    const changed = tabId !== this._currentTab;
    this._currentTab = tabId;
    ['tabUFs', 'tabMunicipios', 'tabDemografia', 'tabMapa'].forEach(t => {
      const el = document.getElementById(t);
      if (el) el.classList.toggle('hidden', t !== tabId);
    });

    // Fecha a barra lateral no mobile se estiver aberta
    document.getElementById('appSidebar')?.classList.remove('sidebar-open');
    document.getElementById('sidebarBackdrop')?.classList.add('hidden');

    const btnMap = {
      tabUFs: 'tabBtnUFs',
      tabMunicipios: 'tabBtnMunicipios',
      tabDemografia: 'tabBtnDemografia',
      tabMapa: 'tabBtnMapa'
    };

    Object.entries(btnMap).forEach(([t, btnId]) => {
      const b = document.getElementById(btnId);
      if (b) {
        if (t === tabId) {
          b.className = 'sidebar-nav-item active-top-tab';
        } else {
          b.className = 'sidebar-nav-item';
        }
        b.setAttribute('aria-selected', String(t === tabId));
        b.tabIndex = t === tabId ? 0 : -1;
      }
    });

    document.querySelectorAll('#appBottomNav [data-tab]').forEach(btn => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle('active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    if (tabId === 'tabMunicipios') {
      this.renderMuniTable();
    } else if (tabId === 'tabDemografia') {
      this.renderDemogSection();
    } else if (tabId === 'tabMapa') {
      this.renderExpandedMap();
    }

    // Scroll suave até o módulo selecionado para feedback visual imediato
    const targetSection = document.getElementById(tabId);
    if (targetSection && scroll) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (changed) this._writeUrl('push');
  }

  handleStateSort(column) {
    if (this._stateSort.column === column) {
      this._stateSort.direction = this._stateSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this._stateSort.column = column;
      const isText = ['uf', 'name', 'region'].includes(column);
      this._stateSort.direction = isText ? 'asc' : 'desc';
    }

    // Sincroniza select legado se houver opção equivalente
    const select = document.getElementById('stateSortSelect');
    if (select) {
      const matchVal = `${column}-${this._stateSort.direction}`;
      const opt = select.querySelector(`option[value="${matchVal}"]`);
      if (opt) select.value = matchVal;
    }

    this._updateSortHeaderIcons();
    this.renderUFTable();
  }

  handleMuniSort(column) {
    if (this._muniSort.column === column) {
      this._muniSort.direction = this._muniSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this._muniSort.column = column;
      const isText = ['name', 'uf', 'winner', 'profile'].includes(column);
      this._muniSort.direction = isText ? 'asc' : 'desc';
    }

    this._updateMuniSortHeaderIcons();
    this.renderMuniTable();
  }

  handleDemogSort(column) {
    if (this._demogSort.column === column) {
      this._demogSort.direction = this._demogSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this._demogSort.column = column;
      const isText = ['uf', 'name', 'region'].includes(column);
      this._demogSort.direction = isText ? 'asc' : 'desc';
    }

    this._updateDemogSortHeaderIcons();
    this.renderDemogSection();
  }

  _updateSortHeaderIcons() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
      const col = th.dataset.sort;
      const iconSpan = th.querySelector('.sort-indicator');
      if (!iconSpan) return;

      if (col === this._stateSort.column) {
        th.classList.add('active-sort');
        iconSpan.innerHTML = getIcon(this._stateSort.direction === 'asc' ? 'chevronUp' : 'chevronDown', 'stk-icon-sm');
      } else {
        th.classList.remove('active-sort');
        iconSpan.innerHTML = getIcon('chevronsUpDown', 'stk-icon-sm');
      }
    });
  }

  _updateMuniSortHeaderIcons() {
    document.querySelectorAll('th[data-sort-muni]').forEach(th => {
      const col = th.dataset.sortMuni;
      const iconSpan = th.querySelector('.sort-indicator');
      if (!iconSpan) return;

      if (col === this._muniSort.column) {
        th.classList.add('active-sort');
        iconSpan.innerHTML = getIcon(this._muniSort.direction === 'asc' ? 'chevronUp' : 'chevronDown', 'stk-icon-sm');
      } else {
        th.classList.remove('active-sort');
        iconSpan.innerHTML = getIcon('chevronsUpDown', 'stk-icon-sm');
      }
    });
  }

  _updateDemogSortHeaderIcons() {
    document.querySelectorAll('th[data-sort-demog]').forEach(th => {
      const col = th.dataset.sortDemog;
      const iconSpan = th.querySelector('.sort-indicator');
      if (!iconSpan) return;

      if (col === this._demogSort.column) {
        th.classList.add('active-sort');
        iconSpan.innerHTML = getIcon(this._demogSort.direction === 'asc' ? 'chevronUp' : 'chevronDown', 'stk-icon-sm');
      } else {
        th.classList.remove('active-sort');
        iconSpan.innerHTML = getIcon('chevronsUpDown', 'stk-icon-sm');
      }
    });
  }

  renderUFTable() {
    const tbody = document.getElementById('ufTableBody');
    if (!tbody) return;

    // Atualiza cabeçalho de saldo/vantagem dinamicamente com o turno
    const thMargin = document.getElementById('thUfMargin');
    if (thMargin) {
      const span = thMargin.querySelector('span');
      if (span) span.textContent = `Vantagem (${this._currentTurn}ºT)`;
    }

    const search = document.getElementById('stateSearchInput')?.value || '';

    const states = this._service.filterAndSortStates({
      filter: this._activeFilter,
      search,
      sortColumn: this._stateSort.column,
      sortDirection: this._stateSort.direction,
      turn: this._currentTurn
    });

    tbody.innerHTML = '';

    states.forEach(st => {
      const p1Lula = st.t1LulaPct.toFixed(1);
      const p1Flavio = st.t1FlavioPct.toFixed(1);
      const p2Lula = st.t2LulaPct.toFixed(1);
      const p2Flavio = st.t2FlavioPct.toFixed(1);

      const winner = st.getWinner(this._currentTurn);
      const margin = st.getWinningMargin(this._currentTurn);
      const isPT = winner === 'PT';
      const ratio = st.ratioElecPop.toFixed(2).replace('.', ',');

      const tr = document.createElement('tr');
      tr.className = 'table-row-hover';
      tr.innerHTML = `
        <td class="col-sticky-uf px-2 sm:px-3 py-2 sm:py-2.5 font-bold text-amber-400">${esc(st.uf)}</td>
        <td class="col-sticky-name px-2.5 sm:px-4 py-2 sm:py-2.5 text-white font-medium font-sans">
          <span class="cell-inline">${esc(st.name)}${st.virada ? '<span class="badge-status badge-virada">Virou 2ºT</span>' : ''}</span>
        </td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-slate-400 text-[11px]">${esc(st.region)}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-center">
          <span class="${st.winT1 === 'PT' ? 'text-ptRed-400 font-bold' : 'text-slate-400'}">${p1Lula}%</span>
          <span class="text-slate-600 mx-1">×</span>
          <span class="${st.winT1 === 'PL' ? 'text-plBlue-400 font-bold' : 'text-slate-400'}">${p1Flavio}%</span>
        </td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-center">
          <span class="${st.winT2 === 'PT' ? 'text-ptRed-400 font-bold' : 'text-slate-400'}">${p2Lula}%</span>
          <span class="text-slate-600 mx-1">×</span>
          <span class="${st.winT2 === 'PL' ? 'text-plBlue-400 font-bold' : 'text-slate-400'}">${p2Flavio}%</span>
        </td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right font-bold ${isPT ? 'text-ptRed-400' : 'text-plBlue-400'}">
          +${margin.toLocaleString('pt-BR')} (${winner})
        </td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right text-slate-300">${st.elec.toLocaleString('pt-BR')}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right text-slate-400">${st.pop.toLocaleString('pt-BR')}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right text-blue-300 font-mono">
          <span>${st.nonVoters.toLocaleString('pt-BR')}</span>
          <span class="text-[10px] text-slate-500 ml-1">(${st.nonVotersPct.toFixed(1).replace('.', ',')}%)</span>
        </td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right font-mono text-purple-300">${ratio}%</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-center">
          <button data-uf="${esc(st.uf)}" class="btn-open-modal px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-sans font-medium transition">
            Detalhes
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-open-modal').forEach(btn => {
      btn.addEventListener('click', () => this.openStateModal(btn.dataset.uf));
    });
  }

  renderMuniTable() {
    const tbody = document.getElementById('muniTableBody');
    if (!tbody) return;

    if (!this._service.isMunicipalitiesLoaded()) {
      this._loadMunicipalities();
      return;
    }

    const search = document.getElementById('muniSearchInput')?.value || '';
    const turn = this._currentTurn;
    const munis = this._service.filterMunicipalities({
      filter: this._activeMuniFilter,
      search,
      sortColumn: this._muniSort.column,
      sortDirection: this._muniSort.direction,
      turn
    });

    tbody.innerHTML = '';

    const counter = document.getElementById('muniTableCounter');
    if (counter) {
      counter.textContent = munis.length > MUNI_ROW_LIMIT
        ? `Exibindo ${MUNI_ROW_LIMIT} de ${fmtInt(munis.length)} municípios. Use a busca ou os filtros para refinar.`
        : `${fmtInt(munis.length)} município${munis.length === 1 ? '' : 's'}`;
    }

    munis.slice(0, MUNI_ROW_LIMIT).forEach(m => {
      const winner = m.getWinner(turn);
      const isPT = winner === 'PT';
      const ratio = m.ratioElecPop === null ? '—' : fmtPct(m.ratioElecPop);
      const pop = m.pop === null ? '—' : fmtInt(m.pop);

      const tr = document.createElement('tr');
      tr.className = 'table-row-hover';
      tr.innerHTML = `
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 font-bold text-white">
          <span class="cell-inline">${esc(m.name)}${m.virada ? '<span class="badge-status badge-virada">Virou 2ºT</span>' : ''}</span>
        </td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-amber-400 font-bold">${esc(m.uf)}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-center">
          <span class="${isPT ? 'text-ptRed-400 font-bold' : 'text-slate-400'}">${m.getLulaPct(turn).toFixed(1)}%</span>
          <span class="text-slate-600 mx-1">×</span>
          <span class="${!isPT ? 'text-plBlue-400 font-bold' : 'text-slate-400'}">${m.getFlavioPct(turn).toFixed(1)}%</span>
        </td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-center">
          <span class="badge-status ${isPT ? 'badge-pt' : 'badge-pl'}">${esc(winner)}</span>
        </td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right text-slate-300">${m.elec.toLocaleString('pt-BR')}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right text-slate-400">${pop}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right font-mono text-purple-300">${ratio}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-center text-slate-400 text-[11px]">${esc(m.profileType)}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-center">
          <button type="button" data-tse="${esc(m.tse)}" class="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-sans font-medium transition" aria-label="Ver zonas eleitorais de ${esc(m.name)}">
            Ver zonas
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /**
   * Baixa a base municipal uma única vez e redesenha a tabela quando chegar
   */
  _loadMunicipalities() {
    if (this._munisLoading) return;
    this._munisLoading = true;

    const counter = document.getElementById('muniTableCounter');
    if (counter) counter.textContent = 'Carregando municípios...';

    this._service.loadMunicipalities()
      .then(() => {
        this._renderMuniFilterLabels();
        this.renderMuniTable();
        this.renderParticipation();
      })
      .catch(err => {
        console.error('[STK-GOVERNO-BRAZIL] Falha ao carregar a base municipal:', err);
        if (counter) counter.textContent = 'Não foi possível carregar os municípios. Abra a aba novamente para tentar outra vez.';
      })
      .finally(() => {
        this._munisLoading = false;
      });
  }

  renderDemogSection() {
    const search = document.getElementById('demogSearchInput')?.value || '';
    const states = this._service.filterDemographics({
      filter: this._activeDemogFilter,
      region: this._activeDemogRegion,
      search,
      sortColumn: this._demogSort.column,
      sortDirection: this._demogSort.direction
    });

    // Atualiza badges de contagem
    const countBadge = document.getElementById('demogCountBadge');
    if (countBadge) countBadge.textContent = `${states.length} UFs analisadas`;

    const tableCounter = document.getElementById('demogTableCounter');
    if (tableCounter) tableCounter.textContent = `${states.length} UFs`;

    // Atualiza gráfico de dispersão/barras demográfico
    const chartData = this._service.getDemographicRatioChartData(states);
    this._charts.renderDemographicRatioChart('ratioBarChart', chartData);

    // Renderiza a tabela demográfica
    const tbody = document.getElementById('demogTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    states.forEach(st => {
      const ratio = st.ratioElecPop.toFixed(2).replace('.', ',');

      const badgeStyles = {
        ALTA: ['bg-amber-950/40 text-amber-300 border border-amber-500/30', `Alta Densidade (${UF_RANGES.ALTA})`],
        JOVEM: ['bg-blue-950/40 text-blue-300 border border-blue-500/30', `Base Jovem (${UF_RANGES.JOVEM})`],
        TIPICA: ['bg-emerald-950/40 text-emerald-300 border border-emerald-500/30', `Faixa Média (${UF_RANGES.TIPICA})`]
      };
      const [badgeCls, badgeLabel] = badgeStyles[st.band];
      const badgeHtml = `<span class="badge-status ${badgeCls}">${esc(badgeLabel)}</span>`;

      const tr = document.createElement('tr');
      tr.className = 'table-row-hover';
      tr.innerHTML = `
        <td class="col-sticky-uf px-2 sm:px-3 py-2 sm:py-2.5 font-bold text-amber-400">${esc(st.uf)}</td>
        <td class="col-sticky-name px-2.5 sm:px-4 py-2 sm:py-2.5 text-white font-medium font-sans">${esc(st.name)}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-slate-400 text-[11px]">${esc(st.region)}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right text-slate-300">${st.elec.toLocaleString('pt-BR')}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right text-slate-400">${st.pop.toLocaleString('pt-BR')}</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right text-blue-300 font-mono">
          <span>${st.nonVoters.toLocaleString('pt-BR')}</span>
          <span class="text-[10px] text-slate-500 ml-1">(${st.nonVotersPct.toFixed(1).replace('.', ',')}%)</span>
        </td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-right font-mono text-purple-300 font-bold">${ratio}%</td>
        <td class="px-2.5 sm:px-4 py-2 sm:py-2.5 text-center">${badgeHtml}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  openStateModal(uf) {
    const st = this._service.getStateByUf(uf);
    if (!st) return;

    document.getElementById('mUfCode').textContent = st.uf;
    document.getElementById('mStateName').textContent = st.name;
    document.getElementById('mRegion').textContent = `Região ${st.region} • ${st.municipalities} Municípios`;

    document.getElementById('mTurn1Result').textContent = `PT ${st.t1LulaPct.toFixed(1)}% × PL ${st.t1FlavioPct.toFixed(1)}% · Outros ${st.t1OutrosPct.toFixed(1)}%`;
    const mTurn1Winner = document.getElementById('mTurn1Winner');
    mTurn1Winner.textContent = `Venceu ${st.winT1}`;
    mTurn1Winner.className = st.winT1 === 'PT' ? 'text-[10px] text-ptRed-400' : 'text-[10px] text-plBlue-400';

    document.getElementById('mTurn2Result').textContent = `PT ${st.t2LulaPct.toFixed(1)}% × PL ${st.t2FlavioPct.toFixed(1)}%`;
    const mTurn2Winner = document.getElementById('mTurn2Winner');
    mTurn2Winner.textContent = `Venceu ${st.winT2}`;
    mTurn2Winner.className = st.winT2 === 'PT' ? 'text-[10px] text-ptRed-400' : 'text-[10px] text-plBlue-400';

    const winnerT2 = st.getWinner(2);
    const marginT2 = st.getWinningMargin(2);
    const isPT = winnerT2 === 'PT';
    const mSaldo = document.getElementById('mSaldoVotes');
    mSaldo.textContent = `+${marginT2.toLocaleString('pt-BR')} (${winnerT2})`;
    mSaldo.className = `font-bold ${isPT ? 'text-ptRed-400' : 'text-plBlue-400'}`;

    document.getElementById('mPopVal').textContent = st.pop.toLocaleString('pt-BR');
    document.getElementById('mElecVal').textContent = st.elec.toLocaleString('pt-BR');
    const mNonVoters = document.getElementById('mNonVotersVal');
    if (mNonVoters) {
      mNonVoters.textContent = `${st.nonVoters.toLocaleString('pt-BR')} (${st.nonVotersPct.toFixed(2).replace('.', ',')}%)`;
    }
    document.getElementById('mRatioVal').textContent = `${st.ratioElecPop.toFixed(2).replace('.', ',')}%`;

    const vBox = document.getElementById('mViradaBox');
    if (vBox) {
      vBox.classList.toggle('hidden', !st.virada);
    }

    const modal = document.getElementById('stateModal');
    if (modal) {
      if (modal.classList.contains('hidden')) this._lastFocus = document.activeElement;
      modal.classList.remove('hidden');
      document.getElementById('modalCloseBtn')?.focus();
    }
    this._openUf = st.uf;
    this._writeUrl();
  }

  closeModal() {
    const modal = document.getElementById('stateModal');
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    this._openUf = null;
    this._lastFocus?.focus?.();
    this._writeUrl();
  }

  exportCsv() {
    this._export.exportToCsv(this._service.getAllStates(), this._service.getExterior());
  }

  /**
   * CSV da tabela municipal com o filtro, a busca e a ordenação atuais (todas as linhas, não só as 300 exibidas)
   */
  async exportMuniCsv() {
    if (!this._service.isMunicipalitiesLoaded()) await this._service.loadMunicipalities();
    const munis = this._service.filterMunicipalities({
      filter: this._activeMuniFilter,
      search: document.getElementById('muniSearchInput')?.value || '',
      sortColumn: this._muniSort.column,
      sortDirection: this._muniSort.direction,
      turn: this._currentTurn
    });
    const suffix = this._activeMuniFilter === 'ALL' ? 'todos' : this._activeMuniFilter.toLowerCase();
    this._export.exportMunicipalitiesCsv(munis, `auditoria_eleitoral_2026_municipios_${suffix}.csv`);
  }

  setParticipation(changes) {
    Object.assign(this._participation, changes);
    const { metric, band } = this._participation;
    ['ABSTENCAO', 'NAO_NOMINAL'].forEach(m => {
      const b = document.getElementById(`fltPart${m}`);
      if (b) b.className = m === metric ? 'filter-chip active-primary' : 'filter-chip';
    });
    ['ALL', 'ALTA', 'TIPICA', 'JOVEM'].forEach(x => {
      const b = document.getElementById(`fltPartBand${x}`);
      if (b) b.className = x === band ? 'filter-chip active-primary' : 'filter-chip';
    });
    this._syncPressed();
    this.renderParticipation();
  }

  /**
   * Ranking de abstenção ou brancos+nulos (turno do topo), com médias ponderadas por faixa demográfica
   */
  renderParticipation() {
    const tbody = document.getElementById('participationTableBody');
    if (!tbody || !this._service.isMunicipalitiesLoaded()) return;

    const r = this._service.getParticipationRanking({ ...this._participation, turn: this._currentTurn, limit: 20 });
    const metricLabel = r.metric === 'ABSTENCAO' ? 'Abstenção' : 'Brancos + nulos';
    setText('thParticipationMetric', `${metricLabel} ${r.turn}ºT`);

    const bandsBox = document.getElementById('participationBands');
    if (bandsBox) {
      const card = (label, b) => {
        const div = document.createElement('div');
        div.className = 'participation-band-card';
        const l = document.createElement('span');
        l.textContent = `${label} (${fmtInt(b.count)})`;
        const v = document.createElement('strong');
        v.textContent = fmtPct(b.pct);
        div.append(l, v);
        return div;
      };
      bandsBox.replaceChildren(
        card('Todos os municípios', r.bands.BRASIL),
        card(`Alta ${MUNI_RANGES.ALTA}`, r.bands.ALTA),
        card(`Média ${MUNI_RANGES.TIPICA}`, r.bands.TIPICA),
        card(`Jovem ${MUNI_RANGES.JOVEM}`, r.bands.JOVEM)
      );
    }

    const bandNames = { ALTA: 'Alta', TIPICA: 'Média', JOVEM: 'Jovem' };
    tbody.innerHTML = r.top.map((row, i) => {
      const m = row.municipality;
      return `<tr class="table-row-hover">
        <td class="px-3 py-2 text-right text-slate-500">${i + 1}</td>
        <td class="px-3 py-2 font-bold text-white font-sans">${esc(m.name)}</td>
        <td class="px-3 py-2 text-amber-400 font-bold">${esc(m.uf)}</td>
        <td class="px-3 py-2 text-slate-400">${esc(bandNames[m.band] ?? 'Sem Censo')}</td>
        <td class="px-3 py-2 text-right">${fmtInt(m.elec)}</td>
        <td class="px-3 py-2 text-right font-bold text-amber-300">${fmtPct(row.pct)}</td>
      </tr>`;
    }).join('');
    setText('participationCounter', `${fmtInt(r.top.length)} de ${fmtInt(r.eligible)} municípios elegíveis no filtro.`);
  }

  /**
   * Janela do município: resumo dos dois turnos e zonas eleitorais (carregadas sob demanda)
   */
  async openMuniModal(tseKey) {
    const modal = document.getElementById('muniModal');
    if (!this._service.isMunicipalitiesLoaded()) await this._service.loadMunicipalities();
    const m = this._service.filterMunicipalities({}).find(x => x.tse === tseKey);
    if (!modal || !m) return;
    this._openMuni = m.tse;
    this._writeUrl();

    this._lastFocus = document.activeElement;
    const turn = this._currentTurn;
    const bandNames = { ALTA: 'Alta', TIPICA: 'Média', JOVEM: 'Jovem' };
    setText('mmUf', m.uf);
    setText('mmName', m.name);
    setText('mmMeta', [m.ibge ? `Código IBGE ${m.ibge}` : 'Sem código no Censo 2022', m.capital ? 'Capital' : null,
      `Faixa ${bandNames[m.band] ?? 'sem dado do Censo'}`, `${fmtInt(m.elec)} eleitores`].filter(Boolean).join(' · '));
    const res = t => `PT ${fmtPct(m.getLulaPct(t), 1)} × PL ${fmtPct(m.getFlavioPct(t), 1)} · venceu ${m.getWinner(t)}`;
    setText('mmT1', res(1));
    setText('mmT2', res(2));
    setText('mmT1Part', `Abstenção ${fmtPct(m.getAbstencaoPct(1), 1)} · brancos+nulos ${fmtPct(m.getNaoNominalPct(1), 1)}`);
    setText('mmT2Part', `Abstenção ${fmtPct(m.getAbstencaoPct(2), 1)} · brancos+nulos ${fmtPct(m.getNaoNominalPct(2), 1)}`);
    const virada = document.getElementById('mmVirada');
    if (virada) {
      virada.classList.toggle('hidden', !m.virada);
      virada.textContent = m.virada ? `Este município inverteu o vencedor: ${m.winT1} no 1º turno, ${m.winner} no 2º.` : '';
    }
    setText('mmZonesTitle', `Zonas eleitorais · ${turn}º turno`);
    document.getElementById('mmZonesBody')?.replaceChildren();
    setText('mmZonesStatus', 'Carregando zonas eleitorais...');

    modal.classList.remove('hidden');
    document.getElementById('muniModalClose')?.focus();

    try {
      const detail = await this._service.getMunicipalityDetail(tseKey);
      if (modal.classList.contains('hidden')) return;
      const zones = detail?.zones ?? [];
      const body = document.getElementById('mmZonesBody');
      if (body) {
        body.innerHTML = zones.map(z => {
          const t = z.getTurn(turn);
          if (!t) return '';
          const w = z.getWinner(turn);
          return `<tr class="table-row-hover">
            <td class="px-3 py-2 font-bold text-amber-400">${z.zona}</td>
            <td class="px-3 py-2 text-right">${fmtInt(t.aptos)}</td>
            <td class="px-3 py-2 text-right">${fmtPct(z.getComparecimentoPct(turn), 1)}</td>
            <td class="px-3 py-2 text-right">${fmtPct(z.getNaoNominalPct(turn), 1)}</td>
            <td class="px-3 py-2 text-center">${fmtPct(z.getLulaPct(turn), 1)} × ${fmtPct(z.getFlavioPct(turn), 1)}</td>
            <td class="px-3 py-2 text-center"><span class="badge-status ${w === 'PT' ? 'badge-pt' : 'badge-pl'}">${esc(w)}</span></td>
          </tr>`;
        }).join('');
      }
      setText('mmZonesStatus', zones.length === 1
        ? '1 zona eleitoral atende este município.'
        : `${fmtInt(zones.length)} zonas eleitorais atendem este município.`);
    } catch (err) {
      console.error('[STK-GOVERNO-BRAZIL] Falha ao carregar zonas:', err);
      setText('mmZonesStatus', 'Não foi possível carregar as zonas eleitorais. Tente abrir de novo.');
    }
  }

  closeMuniModal() {
    const modal = document.getElementById('muniModal');
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    this._openMuni = null;
    this._lastFocus?.focus?.();
    this._writeUrl();
  }

  shareData() {
    const summary = this._service.getNationalSummary(this._currentTurn);
    // O link leva quem recebe exatamente à mesma aba, turno e filtros
    const msg = `${this._export.generateShareText(summary, this._service.getViradas())}\n\nVer no painel: ${window.location.href}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
