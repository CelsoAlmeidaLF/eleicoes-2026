/**
 * Estado da interface no endereço (#aba=municipios&turno=1&mfiltro=VIRADA&mbusca=belo...).
 * Funções puras: o hash é entrada não confiável, então todo valor é validado contra listas fechadas
 * e o que for inválido cai no padrão. Valores padrão não aparecem no endereço.
 */

const TABS = { ufs: 'tabUFs', municipios: 'tabMunicipios', demografia: 'tabDemografia', noticias: 'tabNoticias', mapa: 'tabMapa' };
const TAB_SLUGS = Object.fromEntries(Object.entries(TABS).map(([slug, id]) => [id, slug]));

const ALLOWED = {
  filtro: ['ALL', 'PT', 'PL', 'VIRADA'],
  mfiltro: ['ALL', 'PT', 'PL', 'VIRADA', 'CAPITAIS', 'ALTA', 'JOVEM'],
  dfiltro: ['ALL', 'TIPICA', 'ALTA', 'JOVEM'],
  regiao: ['ALL', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']
};

export const DEFAULT_URL_STATE = Object.freeze({
  tab: 'tabUFs',
  turn: 2,
  filter: 'ALL',
  muniFilter: 'ALL',
  demogFilter: 'ALL',
  demogRegion: 'ALL',
  ufSearch: '',
  muniSearch: '',
  demogSearch: '',
  uf: null,
  municipio: null
});

const MAX_SEARCH = 80;
const clean = v => (v ?? '').slice(0, MAX_SEARCH);
const pick = (value, list, fallback) => (list.includes(value) ? value : fallback);

/** Converte o hash (com ou sem '#') no estado da interface, sempre completo e válido */
export function parseUrlState(hash) {
  const p = new URLSearchParams(String(hash ?? '').replace(/^#/, ''));
  const uf = (p.get('uf') ?? '').toUpperCase();
  const municipio = (p.get('municipio') ?? '').toUpperCase();
  return {
    tab: TABS[p.get('aba')] ?? DEFAULT_URL_STATE.tab,
    turn: p.get('turno') === '1' ? 1 : 2,
    filter: pick(p.get('filtro'), ALLOWED.filtro, 'ALL'),
    muniFilter: pick(p.get('mfiltro'), ALLOWED.mfiltro, 'ALL'),
    demogFilter: pick(p.get('dfiltro'), ALLOWED.dfiltro, 'ALL'),
    demogRegion: pick(p.get('regiao'), ALLOWED.regiao, 'ALL'),
    ufSearch: clean(p.get('busca')),
    muniSearch: clean(p.get('mbusca')),
    demogSearch: clean(p.get('dbusca')),
    uf: /^[A-Z]{2}$/.test(uf) ? uf : null,
    municipio: /^[A-Z]{2}-\d{1,6}$/.test(municipio) ? municipio : null
  };
}

/** Converte o estado em hash ('' quando tudo está no padrão) */
export function serializeUrlState(state) {
  const s = { ...DEFAULT_URL_STATE, ...state };
  const p = new URLSearchParams();
  if (s.tab !== DEFAULT_URL_STATE.tab && TAB_SLUGS[s.tab]) p.set('aba', TAB_SLUGS[s.tab]);
  if (s.turn === 1) p.set('turno', '1');
  if (s.filter !== 'ALL') p.set('filtro', s.filter);
  if (s.muniFilter !== 'ALL') p.set('mfiltro', s.muniFilter);
  if (s.demogFilter !== 'ALL') p.set('dfiltro', s.demogFilter);
  if (s.demogRegion !== 'ALL') p.set('regiao', s.demogRegion);
  if (s.ufSearch) p.set('busca', clean(s.ufSearch));
  if (s.muniSearch) p.set('mbusca', clean(s.muniSearch));
  if (s.demogSearch) p.set('dbusca', clean(s.demogSearch));
  if (s.uf) p.set('uf', s.uf);
  if (s.municipio) p.set('municipio', s.municipio);
  const str = p.toString();
  return str ? `#${str}` : '';
}
