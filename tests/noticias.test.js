/**
 * Aba Notícias: conteúdo curado com fonte, auditoria coerente com os dados do painel
 * e montagem segura do HTML.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NOTICIAS } from '../src/infrastructure/data/NoticiasData.js';
import { AUDITORIA } from '../src/infrastructure/data/AuditoriaData.js';
import { NoticiasView } from '../src/ui/NoticiasView.js';
import { parseUrlState, serializeUrlState, DEFAULT_URL_STATE } from '../src/ui/UrlState.js';

const VEREDITOS = ['ok', 'critica', 'falso', 'sem-prova', 'parcial', 'pendente'];
const todasAsFontes = () => [
  ...NOTICIAS.verificacoes.flatMap(v => v.fontes),
  ...NOTICIAS.alegacoes.flatMap(a => a.fontes),
  ...Object.values(NOTICIAS.contexto).flatMap(c => c.fontes),
  ...NOTICIAS.casoContraTse.comRespaldo.flatMap(c => c.fontes),
  ...NOTICIAS.casoContraTse.semRespaldo.flatMap(c => c.fontes)
];

test('notícias: toda verificação e toda alegação tem resultado e ao menos uma fonte', () => {
  for (const v of NOTICIAS.verificacoes) {
    assert.ok(v.agente && v.oQueFez && v.resultado, v.agente);
    assert.ok(VEREDITOS.includes(v.status), `${v.agente}: status ${v.status}`);
    assert.ok(v.fontes.length > 0, `${v.agente} sem fonte`);
  }
  for (const a of NOTICIAS.alegacoes) {
    assert.ok(a.alegacao && a.explicacao && a.rotulo, a.alegacao);
    assert.ok(VEREDITOS.includes(a.veredito), `${a.alegacao}: veredito ${a.veredito}`);
    assert.ok(a.fontes.length > 0, `${a.alegacao} sem fonte`);
  }
});

test('notícias: fontes com título, veículo e link http(s); datas no formato dd/mm/aaaa', () => {
  for (const f of [...todasAsFontes(), ...NOTICIAS.confira]) {
    assert.match(f.url, /^https?:\/\/[^\s]+$/, f.titulo);
    assert.ok(f.titulo, f.url);
    if ('veiculo' in f) assert.ok(f.veiculo, f.url);
    if (f.data) assert.match(f.data, /^\d{2}\/\d{2}\/\d{4}$/, f.titulo);
  }
});

test('auditoria: votos e margem batem com o conjunto de dados do painel', () => {
  const dados = JSON.parse(readFileSync(new URL('../data/tse_2026_presidente.json', import.meta.url), 'utf-8'));
  for (const t of ['t1', 't2']) {
    assert.equal(AUDITORIA[t].lula, dados.nacional[t].lula, `Lula ${t}`);
    assert.equal(AUDITORIA[t].flavio, dados.nacional[t].flavio, `Flávio ${t}`);
    assert.equal(AUDITORIA[t].aptos, dados.nacional[t].aptos, `aptos ${t}`);
    assert.equal(AUDITORIA[t].comparecimento, dados.nacional[t].comparecimento, `comparecimento ${t}`);
  }
  assert.equal(AUDITORIA.margem2, dados.nacional.t2.lula - dados.nacional.t2.flavio);
});

test('auditoria: divergência entre arquivos do 1º turno é exatamente a já registrada no ETL', () => {
  const t1 = AUDITORIA.divergenciaArquivos.t1;
  const soma = t1.candidatos.reduce((s, c) => s + c.diferenca, 0);
  assert.equal(soma, 5246); // KNOWN_DIVERGENCES ("validos_menos_candidatos", 1, "BR") em build_tse_dataset.py
  assert.equal(t1.nominaisUrnas - t1.nominaisZona, soma);
  assert.equal(AUDITORIA.divergenciaArquivos.t2.candidatos.length, 0);
  assert.equal(AUDITORIA.mudancaDeUrna.saldo, 0, 'quem muda de urna entre os turnos não altera o total de aptos');
});

test('aba Notícias monta o HTML e escapa o texto vindo dos dados', () => {
  const malicioso = structuredClone(NOTICIAS);
  malicioso.alegacoes[0].alegacao = '<img src=x onerror=alert(1)>';
  malicioso.confira[0].url = 'javascript:alert(1)';
  const raiz = { innerHTML: '' };
  new NoticiasView(malicioso, AUDITORIA).render(raiz);
  assert.ok(raiz.innerHTML.includes('Quem verificou e o que concluiu'));
  assert.ok(raiz.innerHTML.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!raiz.innerHTML.includes('<img src=x'));
  assert.ok(!raiz.innerHTML.includes('href="javascript:'));
  const testes = new NoticiasView(NOTICIAS, AUDITORIA).testes();
  assert.equal(testes.length, 8);
  assert.ok(testes.every(([t, p, r, ok]) => t && p && r && typeof ok === 'boolean'));
});

test('endereço: aba Notícias vai e volta pelo hash (#aba=noticias)', () => {
  assert.equal(parseUrlState('#aba=noticias').tab, 'tabNoticias');
  assert.equal(serializeUrlState({ ...DEFAULT_URL_STATE, tab: 'tabNoticias' }), '#aba=noticias');
});

test('caso contra o TSE: cada argumento tem explicação e fonte', () => {
  const { comRespaldo, semRespaldo, resumo } = NOTICIAS.casoContraTse;
  assert.ok(resumo && comRespaldo.length && semRespaldo.length);
  for (const x of [...comRespaldo, ...semRespaldo]) {
    assert.ok(x.titulo && x.explicacao, x.titulo);
    assert.ok(x.fontes.length > 0, `${x.titulo} sem fonte`);
  }
});

test('migração de votos entre turnos: a conta fecha com os dados do TSE', () => {
  const m = AUDITORIA.migracao;
  assert.equal(m.disputados, m.votosTerceiros1 + m.aumentoValidos);
  // ganho de Lula + Flávio = votos em disputa (diferença máxima de poucas urnas sem par entre os turnos)
  assert.ok(Math.abs(m.ganhoLula + m.ganhoFlavio - m.disputados) <= 10, `${m.ganhoLula + m.ganhoFlavio} x ${m.disputados}`);
  assert.ok(m.ganhoLula > 10_000_000, 'o ganho de Lula citado na carta (mais de 10 milhões) é real');
  const raiz = { innerHTML: '' };
  new NoticiasView(NOTICIAS, AUDITORIA).render(raiz);
  assert.ok(raiz.innerHTML.includes('O caso contra o TSE') && raiz.innerHTML.includes('De onde'));
});
