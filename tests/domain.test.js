/**
 * Testes unitários do domínio: faixas demográficas, percentuais por votos válidos e entidades.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UF_RATIO_BANDS, MUNI_RATIO_BANDS, ratioBand } from '../src/domain/models/DemographicBands.js';
import { StateElection } from '../src/domain/models/StateElection.js';
import { MunicipalityElection } from '../src/domain/models/MunicipalityElection.js';

test('ratioBand: limites inclusivos/exclusivos das faixas', () => {
  const b = UF_RATIO_BANDS;
  assert.equal(ratioBand(b.low - 0.01, b), 'JOVEM');
  assert.equal(ratioBand(b.low, b), 'TIPICA');
  assert.equal(ratioBand(b.high - 0.01, b), 'TIPICA');
  assert.equal(ratioBand(b.high, b), 'ALTA');
  assert.equal(ratioBand(null, b), null);
  assert.equal(ratioBand(undefined, b), null);
});

const stateData = {
  uf: 'XX', name: 'Teste', region: 'Sul', pop: 1000, elec: 780, municipalities: 1,
  t1Lula: 400, t1Flavio: 450, t1Outros: 150, t1Validos: 1000,
  t2Lula: 520, t2Flavio: 480, t2Validos: 1000,
  winT1: 'PL', winT2: 'PT', virada: true
};

test('StateElection: percentuais do 1º turno usam os votos válidos oficiais (com outros candidatos)', () => {
  const s = new StateElection(stateData);
  assert.equal(s.t1LulaPct, 40);
  assert.equal(s.t1FlavioPct, 45);
  assert.equal(s.t1OutrosPct, 15);
  assert.equal(s.t2LulaPct, 52);
  assert.equal(s.getWinningMargin(2), 40);
});

test('StateElection: sem t1Validos, cai para a soma dos candidatos', () => {
  const { t1Validos, t2Validos, ...rest } = stateData;
  const s = new StateElection(rest);
  assert.equal(s.t1Total, 1000);
  assert.equal(s.t2Total, 1000);
});

test('StateElection: faixa demográfica pela razão eleitores/habitantes', () => {
  assert.equal(new StateElection(stateData).band, 'ALTA'); // 78% = limite inferior da faixa alta
  assert.equal(new StateElection({ ...stateData, elec: 600 }).band, 'JOVEM');
});

test('MunicipalityElection: perfil e faixa seguem a mesma regra (80% exato é Alta)', () => {
  const base = { name: 'M', uf: 'XX', elec: 800, pop: 1000, t2Lula: 1, t2Flavio: 2, winner: 'PL' };
  const m = new MunicipalityElection(base);
  assert.equal(m.ratioElecPop, MUNI_RATIO_BANDS.high);
  assert.equal(m.band, 'ALTA');
  assert.equal(m.profileType, 'Alta Densidade Adulta');
});

test('MunicipalityElection: sem população do Censo, razão e faixa ficam nulas', () => {
  const m = new MunicipalityElection({ name: 'Novo', uf: 'MT', elec: 100, pop: null, t2Lula: 1, t2Flavio: 2, winner: 'PL' });
  assert.equal(m.ratioElecPop, null);
  assert.equal(m.band, null);
  assert.equal(m.profileType, 'Sem dado do Censo');
});

test('MunicipalityElection: percentuais e vencedor por turno; virada', () => {
  const m = new MunicipalityElection({
    name: 'M', uf: 'XX', elec: 1000, pop: 1500,
    t1Lula: 300, t1Flavio: 400, t1Outros: 100, t1Validos: 800, t1Aptos: 1000, t1Abstencoes: 150, t1Brancos: 20, t1Nulos: 30,
    t2Lula: 450, t2Flavio: 350, t2Validos: 800, t2Abstencoes: 100, t2Brancos: 40, t2Nulos: 60, t2Comparecimento: 900,
    winT1: 'PL', winner: 'PT'
  });
  assert.equal(m.getLulaPct(1), 37.5);
  assert.equal(m.getFlavioPct(1), 50);
  assert.equal(m.getLulaPct(2), 56.25);
  assert.equal(m.getWinner(1), 'PL');
  assert.equal(m.getWinner(2), 'PT');
  assert.equal(m.virada, true);
  assert.equal(m.getAbstencaoPct(1), 15);
  assert.equal(m.getAbstencaoPct(2), 10);
  assert.equal(m.t1Comparecimento, 850);
  assert.ok(Math.abs(m.getNaoNominalPct(2) - (100 / 900) * 100) < 1e-9);
});
