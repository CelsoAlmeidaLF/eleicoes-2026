/**
 * Estado no endereço: o hash é entrada não confiável (links compartilhados),
 * então tudo é validado e o que for inválido cai no padrão.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseUrlState, serializeUrlState, DEFAULT_URL_STATE } from '../src/ui/UrlState.js';

test('sem hash = estado padrão; estado padrão = endereço limpo', () => {
  assert.deepEqual(parseUrlState(''), { ...DEFAULT_URL_STATE });
  assert.deepEqual(parseUrlState('#'), { ...DEFAULT_URL_STATE });
  assert.equal(serializeUrlState(DEFAULT_URL_STATE), '');
});

test('ida e volta preserva aba, turno, filtros, buscas e janelas', () => {
  const state = {
    ...DEFAULT_URL_STATE, tab: 'tabMunicipios', turn: 1, filter: 'VIRADA', muniFilter: 'CAPITAIS',
    demogFilter: 'JOVEM', demogRegion: 'Centro-Oeste', ufSearch: 'minas', muniSearch: 'São José & cia',
    demogSearch: 'rr', uf: 'MG', municipio: 'MG-41238'
  };
  const hash = serializeUrlState(state);
  assert.match(hash, /^#aba=municipios&turno=1/);
  assert.deepEqual(parseUrlState(hash), state);
});

test('valores inválidos ou maliciosos caem no padrão', () => {
  const s = parseUrlState('#aba=<script>&turno=9&filtro=DROP&mfiltro=x&regiao=Marte&uf=MGX&municipio=../etc');
  assert.equal(s.tab, 'tabUFs');
  assert.equal(s.turn, 2);
  assert.equal(s.filter, 'ALL');
  assert.equal(s.muniFilter, 'ALL');
  assert.equal(s.demogRegion, 'ALL');
  assert.equal(s.uf, null);
  assert.equal(s.municipio, null);
});

test('busca é limitada a 80 caracteres e sigla é normalizada', () => {
  const s = parseUrlState(`#busca=${'a'.repeat(500)}&uf=mg&municipio=mg-41238`);
  assert.equal(s.ufSearch.length, 80);
  assert.equal(s.uf, 'MG');
  assert.equal(s.municipio, 'MG-41238');
});
