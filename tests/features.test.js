/**
 * Zonas eleitorais, ranking de participação e exportação CSV (dados reais + funções puras).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ElectionRepository } from '../src/infrastructure/repositories/ElectionRepository.js';
import { ElectionAnalysisService } from '../src/application/services/ElectionAnalysisService.js';
import { ExportService, csvCell, buildCsv } from '../src/application/services/ExportService.js';

const service = new ElectionAnalysisService(new ElectionRepository());
await service.loadMunicipalities();
const munis = service.filterMunicipalities({});
const exporter = new ExportService();

test('zonas: em todos os municípios, a soma das zonas bate com o município nos dois turnos', async () => {
  await service._repo.loadZones();
  let zonas = 0;
  for (const m of munis) {
    const zs = service._repo.getZones(m.tse);
    assert.ok(zs.length > 0, `${m.name}/${m.uf} sem zonas`);
    zonas += zs.length;
    const sum = (t, f) => zs.reduce((a, z) => a + (z.getTurn(t)?.[f] ?? 0), 0);
    assert.equal(sum(1, 'lula'), m.t1Lula, `${m.name}/${m.uf} Lula 1ºT`);
    assert.equal(sum(1, 'validos'), m.t1Validos, `${m.name}/${m.uf} válidos 1ºT`);
    assert.equal(sum(2, 'lula'), m.t2Lula, `${m.name}/${m.uf} Lula 2ºT`);
    assert.equal(sum(2, 'flavio'), m.t2Flavio, `${m.name}/${m.uf} Flávio 2ºT`);
    assert.equal(sum(2, 'aptos'), m.elec, `${m.name}/${m.uf} aptos 2ºT`);
    assert.equal(sum(2, 'abstencoes'), m.t2Abstencoes, `${m.name}/${m.uf} abstenções 2ºT`);
  }
  assert.ok(zonas > munis.length);
});

test('detalhe do município: zonas ordenadas e município inexistente devolve null', async () => {
  const bh = munis.find(m => m.name === 'Belo Horizonte');
  const d = await service.getMunicipalityDetail(bh.tse);
  assert.equal(d.municipality, bh);
  assert.deepEqual(d.zones.map(z => z.zona), [...d.zones.map(z => z.zona)].sort((a, b) => a - b));
  assert.equal(await service.getMunicipalityDetail('XX-0'), null);
});

test('ranking de participação: ordenado, filtros respeitados e média ponderada correta', () => {
  for (const metric of ['ABSTENCAO', 'NAO_NOMINAL']) {
    for (const turn of [1, 2]) {
      const r = service.getParticipationRanking({ metric, turn, minElec: 10000, band: 'ALTA', limit: 20 });
      assert.equal(r.top.length, 20);
      for (let i = 1; i < r.top.length; i++) assert.ok(r.top[i - 1].pct >= r.top[i].pct, 'ordem decrescente');
      for (const row of r.top) {
        assert.ok(row.municipality.elec >= 10000);
        assert.equal(row.municipality.band, 'ALTA');
      }
    }
  }
  const r = service.getParticipationRanking({ metric: 'ABSTENCAO', turn: 2 });
  const abst = munis.reduce((a, m) => a + m.t2Abstencoes, 0);
  const aptos = munis.reduce((a, m) => a + m.elec, 0);
  assert.ok(Math.abs(r.bands.BRASIL.pct - (abst / aptos) * 100) < 1e-9);
  assert.equal(r.bands.ALTA.count + r.bands.TIPICA.count + r.bands.JOVEM.count, munis.length - 1); // 1 sem Censo
});

test('csvCell: aspas, quebras de linha e neutralização de fórmulas de planilha', () => {
  assert.equal(csvCell('Simples'), 'Simples');
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('diz "oi"'), '"diz ""oi"""');
  assert.equal(csvCell('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell('+55'), "'+55");
  assert.equal(csvCell(-12), '-12'); // número negativo continua número
  assert.equal(csvCell(null), '');
  assert.equal(csvCell(true), 'sim');
  assert.equal(buildCsv(['a', 'b'], [[1, 'x']]), 'a,b\n1,x\n');
});

const parse = csv => csv.trim().split('\n').map(l => l.split(','));

test('CSV das UFs: 27 UFs + exterior, colunas consistentes e totais = TSE nacional', () => {
  const rows = parse(exporter.buildStatesCsv(service.getAllStates(), service.getExterior()));
  const [header, ...data] = rows;
  assert.equal(data.length, 28);
  for (const r of data) assert.equal(r.length, header.length, r[0]);
  const col = name => header.indexOf(name);
  for (const turn of [1, 2]) {
    const s = service.getNationalSummary(turn);
    const sum = name => data.reduce((a, r) => a + Number(r[col(name)]), 0);
    assert.equal(sum(`T${turn}_Lula`), s.ptVotes);
    assert.equal(sum(`T${turn}_Flavio`), s.plVotes);
    assert.equal(sum(`T${turn}_Validos`), s.totalValid);
    assert.equal(sum(`T${turn}_Brancos`), s.totalBrancos);
    assert.equal(sum(`T${turn}_Abstencoes`), s.totalAbstencoes);
  }
});

test('CSV dos municípios: uma linha por município filtrado, colunas consistentes', () => {
  const filtered = service.filterMunicipalities({ filter: 'CAPITAIS' });
  const [header, ...data] = parse(exporter.buildMunicipalitiesCsv(filtered));
  assert.equal(data.length, 27);
  for (const r of data) assert.equal(r.length, header.length, r[1]);
  assert.ok(data.every(r => r[header.indexOf('Capital')] === 'sim'));
});

test('texto de compartilhamento usa as viradas dos dados, sem texto fixo', () => {
  const s = service.getNationalSummary(2);
  const txt = exporter.generateShareText(s, service.getViradas());
  for (const v of service.getViradas()) assert.ok(txt.includes(`${v.name} (${v.uf})`));
  assert.match(exporter.generateShareText(s, []), /nenhuma UF trocou de vencedor/);
});
