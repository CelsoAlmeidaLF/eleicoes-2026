/**
 * Testes unitários da aplicação e infraestrutura com dados sintéticos (sem depender da base real).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ElectionRepository } from '../src/infrastructure/repositories/ElectionRepository.js';
import { ElectionAnalysisService } from '../src/application/services/ElectionAnalysisService.js';
import { escapeHtml } from '../src/infrastructure/lib/escapeHtml.js';

const states = [
  { uf: 'AA', name: 'Alfa', region: 'Sul', pop: 1000, elec: 800, municipalities: 2,
    t1Lula: 300, t1Flavio: 400, t1Outros: 100, t1Validos: 800, t1Brancos: 10, t1Nulos: 10, t1Abstencoes: 100, t1Aptos: 800, t1Comparecimento: 700,
    t2Lula: 420, t2Flavio: 380, t2Validos: 800, t2Brancos: 5, t2Nulos: 5, t2Abstencoes: 90, t2Comparecimento: 710,
    winT1: 'PL', winT2: 'PT', virada: true },
  { uf: 'BB', name: 'Beta', region: 'Sul', pop: 2000, elec: 1300, municipalities: 1,
    t1Lula: 600, t1Flavio: 500, t1Outros: 0, t1Validos: 1100, t1Brancos: 0, t1Nulos: 0, t1Abstencoes: 200, t1Aptos: 1300, t1Comparecimento: 1100,
    t2Lula: 700, t2Flavio: 400, t2Validos: 1100, t2Brancos: 0, t2Nulos: 0, t2Abstencoes: 200, t2Comparecimento: 1100,
    winT1: 'PT', winT2: 'PT', virada: false }
];
const zero = { aptos: 0, comparecimento: 0, validos: 0, lula: 0, flavio: 0, outros: 0, brancos: 0, nulos: 0, abstencoes: 0 };
const exterior = { t1: { ...zero, aptos: 10, comparecimento: 6, validos: 6, lula: 4, flavio: 2, abstencoes: 4 }, t2: { ...zero, aptos: 10, comparecimento: 5, validos: 5, lula: 1, flavio: 4, abstencoes: 5 } };
const munis = [
  { ibge: '1111111', name: 'Capital Alfa', uf: 'AA', capital: true, pop: 600, elec: 480, t2Lula: 250, t2Flavio: 200, winner: 'PT' },
  { ibge: '1111112', name: 'Interior <b>', uf: 'AA', capital: false, pop: 400, elec: 320, t2Lula: 170, t2Flavio: 180, winner: 'PL' },
  { ibge: null, name: 'Novo', uf: 'BB', capital: false, pop: null, elec: 50, t2Lula: 10, t2Flavio: 20, winner: 'PL' }
];
const provenance = { geradoEm: '2026-10-28T00:00:00Z', tse: [], ibge: {}, divergencias: {} };

const makeService = loader => new ElectionAnalysisService(new ElectionRepository(states, exterior, loader ?? (async () => munis), provenance));

test('resumo nacional soma UFs + exterior; válidos do 1º turno incluem outros candidatos', () => {
  const s = makeService().getNationalSummary(1);
  assert.equal(s.ptVotes, 300 + 600 + 4);
  assert.equal(s.plVotes, 400 + 500 + 2);
  assert.equal(s.othersVotes, 100);
  assert.equal(s.totalValid, 800 + 1100 + 6);
  assert.equal(s.totalAptos, 800 + 1300 + 10);
  assert.equal(s.ptUFs, 1);
  assert.equal(s.leader, 'PT');
});

test('filtro VIRADA e contagens dos chips seguem o turno', () => {
  const svc = makeService();
  assert.deepEqual(svc.filterAndSortStates({ filter: 'VIRADA' }).map(s => s.uf), ['AA']);
  assert.deepEqual(svc.getStateFilterCounts(1), { ALL: 2, PT: 1, PL: 1, viradaUFs: ['AA'] });
  assert.deepEqual(svc.getStateFilterCounts(2), { ALL: 2, PT: 2, PL: 0, viradaUFs: ['AA'] });
});

test('geografia partidária: região inteira conquistada vira nome da região', () => {
  const geo = makeService().getPartyGeography(2);
  assert.deepEqual(geo.PT, { fullRegions: ['Sul'], otherUFs: [] });
  assert.deepEqual(geo.PL, { fullRegions: [], otherUFs: [] });
});

test('base municipal: carrega uma vez só, mesmo com chamadas simultâneas', async () => {
  let calls = 0;
  const svc = makeService(async () => { calls++; return munis; });
  assert.equal(svc.isMunicipalitiesLoaded(), false);
  assert.equal(svc.filterMunicipalities().length, 0);
  await Promise.all([svc.loadMunicipalities(), svc.loadMunicipalities()]);
  assert.equal(calls, 1);
  assert.equal(svc.isMunicipalitiesLoaded(), true);
});

test('base municipal: falha de rede permite nova tentativa', async () => {
  let calls = 0;
  const svc = makeService(async () => { if (++calls === 1) throw new Error('offline'); return munis; });
  await assert.rejects(svc.loadMunicipalities(), /offline/);
  await svc.loadMunicipalities();
  assert.equal(calls, 2);
  assert.equal(svc.isMunicipalitiesLoaded(), true);
});

test('filtros municipais: capitais, código IBGE e município sem Censo', async () => {
  const svc = makeService();
  await svc.loadMunicipalities();
  assert.deepEqual(svc.filterMunicipalities({ filter: 'CAPITAIS' }).map(m => m.name), ['Capital Alfa']);
  assert.deepEqual(svc.filterMunicipalities({ search: '1111112' }).map(m => m.ibge), ['1111112']);
  // sem população não entra em nenhuma faixa demográfica
  assert.ok(!svc.filterMunicipalities({ filter: 'JOVEM' }).some(m => m.name === 'Novo'));
  assert.deepEqual(svc.getMunicipalityFilterCounts(), { ALL: 3, PT: 1, PL: 2, VIRADA: 0, CAPITAIS: 1, ALTA: 2, JOVEM: 0 });
  // sem dados do 1º turno, a busca no turno 1 não quebra
  assert.equal(svc.filterMunicipalities({ search: 'pt', turn: 1 }).length, 0);
});

test('escapeHtml neutraliza HTML vindo dos dados', () => {
  assert.equal(escapeHtml('<img src=x onerror="a()">'), '&lt;img src=x onerror=&quot;a()&quot;&gt;');
  assert.equal(escapeHtml("D'Oeste & cia"), 'D&#39;Oeste &amp; cia');
  assert.equal(escapeHtml(null), '');
});
