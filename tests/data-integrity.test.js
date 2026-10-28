/**
 * Integridade dos dados gerados: o painel precisa bater com a totalização oficial do TSE
 * (data/tse_2026_presidente.json) e com a prova de origem (data/provenance.json).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ElectionRepository } from '../src/infrastructure/repositories/ElectionRepository.js';
import { ElectionAnalysisService } from '../src/application/services/ElectionAnalysisService.js';
import { PROVENANCE } from '../src/infrastructure/data/BrazilElectionData.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = p => JSON.parse(readFileSync(join(ROOT, p), 'utf-8'));
const sha256 = p => createHash('sha256').update(readFileSync(join(ROOT, p))).digest('hex');

const tse = readJson('data/tse_2026_presidente.json');
const service = new ElectionAnalysisService(new ElectionRepository());

for (const turn of [1, 2]) {
  test(`totais nacionais do ${turn}º turno batem exatamente com o TSE (UFs + exterior)`, () => {
    const s = service.getNationalSummary(turn);
    const n = tse.nacional[`t${turn}`];
    assert.equal(s.ptVotes, n.lula);
    assert.equal(s.plVotes, n.flavio);
    assert.equal(s.othersVotes, turn === 1 ? n.outros : 0);
    assert.equal(s.totalValid, n.validos);
    assert.equal(s.totalAptos, n.aptos);
    assert.equal(s.totalComparecimento, n.comparecimento);
    assert.equal(s.totalAbstencoes, n.abstencoes);
    assert.equal(s.totalBrancos, n.brancos);
    assert.equal(s.totalNulos, n.nulos);
    assert.equal(s.ptUFs + s.plUFs, 27);
  });
}

test('vencedores e viradas por UF são derivados dos votos', () => {
  for (const s of service._repo.getAllStates().toArray()) {
    const t = tse.ufs[s.uf];
    assert.equal(s.winT1, t.t1.lula > t.t1.flavio ? 'PT' : 'PL', `${s.uf} 1º turno`);
    assert.equal(s.winT2, t.t2.lula > t.t2.flavio ? 'PT' : 'PL', `${s.uf} 2º turno`);
    assert.equal(s.virada, s.winT1 !== s.winT2, `${s.uf} virada`);
  }
  assert.deepEqual(service.getViradas().map(v => v.uf), service.getStateFilterCounts(2).viradaUFs);
});

test('regiões cobrem as 27 UFs, cada uma uma única vez', () => {
  const ufs = service.getRegionSummary(2).flatMap(r => [...r.ptUFs, ...r.plUFs]);
  assert.equal(ufs.length, 27);
  assert.equal(new Set(ufs).size, 27);
});

test('faixas demográficas particionam as 27 UFs', () => {
  const b = service.getDemographicBands();
  assert.equal(b.TIPICA.length + b.ALTA.length + b.JOVEM.length, 27);
});

test('municípios: soma por UF bate com a UF nos dois turnos', async () => {
  await service.loadMunicipalities();
  const munis = service._repo.getMunicipalities().toArray();
  assert.equal(munis.length, tse.meta.total_municipios);
  const byUf = {};
  for (const m of munis) {
    const a = (byUf[m.uf] ||= { t2Lula: 0, t2Flavio: 0, elec: 0 });
    a.t2Lula += m.t2Lula; a.t2Flavio += m.t2Flavio; a.elec += m.elec;
  }
  for (const s of service._repo.getAllStates().toArray()) {
    assert.equal(byUf[s.uf].t2Lula, s.t2Lula, `${s.uf} Lula`);
    assert.equal(byUf[s.uf].t2Flavio, s.t2Flavio, `${s.uf} Flávio`);
    assert.equal(byUf[s.uf].elec, s.elec, `${s.uf} aptos`);
  }
  const c = service.getMunicipalityFilterCounts();
  assert.equal(c.PT + c.PL, c.ALL);
  assert.equal(c.CAPITAIS, 27);
});

test('divergência conhecida do TSE no 1º turno está documentada e não mudou', () => {
  const div = tse.municipios.reduce((acc, m) => acc + m.t1.validos - (m.t1.lula + m.t1.flavio + m.t1.outros), 0);
  assert.equal(div, PROVENANCE.divergencias.t1ValidosAcimaDaSomaDosCandidatos);
  // 2º turno: válidos = soma exata dos dois candidatos
  for (const m of tse.municipios) assert.equal(m.t2.validos, m.t2.lula + m.t2.flavio, m.nome);
});

test('prova de origem: export do app = data/provenance.json, e o JSON do TSE confere com o hash', () => {
  assert.deepEqual(PROVENANCE, readJson('data/provenance.json'));
  assert.equal(sha256(PROVENANCE.tseDataset.arquivo), PROVENANCE.tseDataset.sha256);
  for (const f of PROVENANCE.tse) assert.match(f.sha256, /^[0-9a-f]{64}$/);
});

test('prova de origem: CSVs brutos do TSE conferem (quando presentes; ficam fora do git)', t => {
  const present = PROVENANCE.tse.filter(f => existsSync(join(ROOT, 'data/tse_raw', f.arquivo)));
  if (!present.length) return t.skip('data/tse_raw ausente');
  for (const f of present) assert.equal(sha256(join('data/tse_raw', f.arquivo)), f.sha256, f.arquivo);
});

test('service worker: todo módulo JS do app está no cache offline (menos municípios e zonas, sob demanda)', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf-8');
  const walk = dir => readdirSync(dir).flatMap(n => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
  const modules = walk(join(ROOT, 'src'))
    .filter(p => p.endsWith('.js'))
    .map(p => relative(ROOT, p))
    .filter(p => !p.endsWith('BrazilMunicipalitiesData.js') && !p.endsWith('BrazilZonesData.js') && !p.endsWith('program.js') && !p.endsWith('stk-pkg-linq.js'));
  for (const m of modules) assert.ok(sw.includes(`'${m}'`), `${m} fora do APP_SHELL do sw.js`);
  for (const f of [...sw.matchAll(/^\s+'([^']+)',?$/gm)].map(x => x[1]).filter(x => x !== './')) {
    assert.ok(existsSync(join(ROOT, f)), `sw.js lista arquivo inexistente: ${f}`);
  }
});

test('municípios: 1º turno somado por UF bate com a UF; virada coerente com os vencedores', async () => {
  await service.loadMunicipalities();
  const munis = service._repo.getMunicipalities().toArray();
  const byUf = {};
  for (const m of munis) {
    const a = (byUf[m.uf] ||= { lula: 0, flavio: 0, outros: 0, validos: 0 });
    a.lula += m.t1Lula; a.flavio += m.t1Flavio; a.outros += m.t1Outros; a.validos += m.t1Validos;
    assert.equal(m.virada, m.winT1 !== m.winner, `${m.name}/${m.uf}`);
    assert.equal(m.winT1, m.t1Lula > m.t1Flavio ? 'PT' : 'PL', `${m.name}/${m.uf} vencedor 1º turno`);
  }
  for (const s of service._repo.getAllStates().toArray()) {
    assert.equal(byUf[s.uf].lula, s.t1Lula, `${s.uf} Lula 1ºT`);
    assert.equal(byUf[s.uf].flavio, s.t1Flavio, `${s.uf} Flávio 1ºT`);
    assert.equal(byUf[s.uf].outros, s.t1Outros, `${s.uf} outros 1ºT`);
    assert.equal(byUf[s.uf].validos, s.t1Validos, `${s.uf} válidos 1ºT`);
  }
  const v = service.getMunicipalityViradaSummary();
  assert.equal(v.paraPT + v.paraPL, v.total);
  assert.equal(service.filterMunicipalities({ filter: 'VIRADA' }).length, v.total);
  for (const turn of [1, 2]) {
    const c = service.getMunicipalityFilterCounts(turn);
    assert.equal(c.PT + c.PL, c.ALL, `turno ${turn}`);
    assert.equal(service.filterMunicipalities({ filter: 'PT', turn }).length, c.PT);
  }
});
