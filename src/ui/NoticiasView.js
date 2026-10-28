import { getIcon } from '../infrastructure/icons/Icons.js';
import { escapeHtml as esc } from '../infrastructure/lib/escapeHtml.js';

/**
 * Aba "Notícias": quem verificou a eleição, alegações checadas e a auditoria estatística
 * dos arquivos do TSE feita por este painel. Só monta HTML a partir dos dados recebidos;
 * todo texto passa por escapeHtml e só entram links http(s).
 */

const fmtInt = n => Number(n).toLocaleString('pt-BR');
const fmtNum = (n, d = 1) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtPp = n => `${n > 0 ? '+' : ''}${fmtNum(n)} pp`;
const linkSeguro = url => (/^https?:\/\//.test(url) ? url : '#');
const titulo = s => s.toLowerCase().replace(/(^|\s|-)(\p{L})/gu, (_, a, b) => a + b.toUpperCase()).replace(/\b(De|Do|Da|Dos|Das|E)\b/g, m => m.toLowerCase());

const STATUS = {
  ok: { classe: 'news-ok', rotulo: 'Sem fraude encontrada' },
  critica: { classe: 'news-alerta', rotulo: 'Sem fraude; crítica ao procedimento' },
  falso: { classe: 'news-falso', rotulo: 'Falso' },
  'sem-prova': { classe: 'news-falso', rotulo: 'Sem prova' },
  parcial: { classe: 'news-alerta', rotulo: 'Em parte verdadeiro' },
  pendente: { classe: 'news-neutro', rotulo: 'Pendente' }
};

const fontesHtml = fontes => `<ul class="news-fontes">${fontes.map(f => `
  <li><a href="${esc(linkSeguro(f.url))}" target="_blank" rel="noopener noreferrer">${esc(f.titulo)}</a>
  <span>${esc(f.veiculo)}${f.data ? ` · ${esc(f.data)}` : ''}</span></li>`).join('')}</ul>`;

const selo = (chave, rotulo) => {
  const s = STATUS[chave] || STATUS.pendente;
  return `<span class="news-selo ${s.classe}">${esc(rotulo || s.rotulo)}</span>`;
};

export class NoticiasView {
  /**
   * @param {Object} noticias NOTICIAS (NoticiasData.js)
   * @param {Object} auditoria AUDITORIA (AuditoriaData.js)
   */
  constructor(noticias, auditoria) {
    this.n = noticias;
    this.a = auditoria;
    this._renderizado = false;
  }

  /** Monta a aba uma vez (o conteúdo é estático) */
  render(raiz = document.getElementById('noticiasConteudo')) {
    if (!raiz || this._renderizado) return;
    raiz.innerHTML = [
      this._resumo(),
      this._verificacoes(),
      this._alegacoes(),
      this._casoContraTse(),
      this._auditoria(),
      this._pontosDeAtencao(),
      this._confira(),
      this._rodape()
    ].join('');
    this._renderizado = true;
  }

  /** Testes da auditoria, prontos para a tabela: [teste, o que procura, resultado, ok?] */
  testes() {
    const a = this.a;
    const c1 = a.contas.t1, c2 = a.contas.t2;
    const contasOk = [c1, c2].every(c => !c.repetidas && !c.comparecimentoMaiorQueAptos && !c.aptosNaoFecham && !c.votosNaoFecham);
    const b = a.boletins;
    const mod = a.modeloUrnaCorrelacao;
    const u100 = a.urnas100;
    const div = a.divergenciaArquivos.t1;
    return [
      ['Contas de cada urna', 'Mais votantes que eleitores, votos que não somam, urna contada duas vezes',
        contasOk ? `Fecham nas ${fmtInt(a.t2.urnas)} urnas, nos dois turnos. ${c2.naoInstaladas} seções no exterior não foram instaladas (sem voto).` : 'Há urnas com contas que não fecham: ver dados.', contasOk],
      ['Comparecimento perto de 100%', 'Urna "engordada" (assinatura de Klimek et al., 2012)',
        `Distribuição suave, sem pico no fim. Só ${a.urnasComparecimento98.t1} e ${a.urnasComparecimento98.t2} urnas acima de 98%, em meio milhão.`, true],
      ['Hora de chegada do boletim', 'Urnas "atrasadas" que poderiam ser manipuladas depois',
        `Mediana de ${fmtNum(b.t1.medianaHoras, 1)} h e ${fmtNum(b.t2.medianaHoras, 1)} h após as 17h; a mais tardia, ${fmtNum(b.t1.maximoHoras, 1)} h. Nenhuma depois de 24 h.`, b.t1.depoisDe24h + b.t2.depoisDe24h === 0],
      ['Modelo de urna', 'Urnas antigas (2013/2015) votando diferente das novas, tese do relatório do PL em 2022',
        `Dentro de cada estado, a correlação muda de sinal (${mod.positivas} positivas, ${mod.negativas} negativas; mediana ${fmtNum(mod.mediana, 2)}). Sem efeito sistemático.`, Math.abs(mod.mediana) < 0.2],
      ['Comparecimento alto × voto', 'Urnas com mais comparecimento dando mais votos a um lado (enchimento)',
        `Dentro do mesmo município, correlação de ${fmtNum(a.comparecimentoVotoMunicipio.correlacao, 3)} entre comparecimento e voto em Lula: praticamente nula.`, Math.abs(a.comparecimentoVotoMunicipio.correlacao) < 0.1],
      ['Votação de 100% para um candidato', 'Urnas com votação "fabricada"',
        `${u100.total} urnas em ${fmtInt(u100.base)} (${u100.lula} Lula, ${u100.flavio} Flávio), concentradas em aldeias e escolas indígenas da Amazônia (${Object.entries(u100.porUF).slice(0, 3).map(([uf, q]) => `${uf} ${q}`).join(', ')}), padrão conhecido.`, true],
      ['Viradas entre os turnos', 'Zonas ou urnas que mudaram muito mais que o resto do país',
        `${a.viradaZonas.atipicas.length} zonas acima de 4 desvios; em todas, praticamente todas as urnas se moveram juntas (mudança política local, não urnas isoladas).`, true],
      ['Arquivos do TSE entre si', 'Votos que aparecem num arquivo e somem em outro',
        `Urnas e seções batem voto a voto. O arquivo por zona republicado em ${this.a.meta.arquivos[2].geradoPeloTse.slice(0, 5)} tem ${fmtInt(div.candidatos.reduce((s, c) => s + c.diferenca, 0))} votos a menos no 1º turno, todos de um candidato que renunciou (ver abaixo).`, true]
    ];
  }

  _resumo() {
    const a = this.a;
    return `
      <div class="news-veredito">
        <span class="news-veredito-icone">${getIcon('checkCircle')}</span>
        <div>
          <strong>Apuração oficial e cobertura da imprensa independente.</strong>
          <p>Testes de integridade, fiscalização partidária, apurações da imprensa independente (Revista Oeste, Gazeta do Povo e Jovem Pan News) e a auditoria estatística deste painel indicam que a soma dos boletins de urna (BUs) impressos bate com a totalização: Lula reeleito por ${fmtInt(a.margem2)} votos. As críticas centrais documentadas pela oposição focam em arbitrariedades institucionais: a prorrogação inédita da votação até as 19h por decisão monocrática, o cerco à liberdade de expressão e a recusa histórica ao voto impresso auditável.</p>
        </div>
      </div>
      <div class="news-kpis">
        <div class="news-kpi"><span>Margem no 2º turno</span><strong>${fmtInt(a.margem2)}</strong><em>votos</em></div>
        <div class="news-kpi"><span>Urnas auditadas</span><strong>${fmtInt(a.t2.urnas)}</strong><em>por turno, uma a uma</em></div>
        <div class="news-kpi"><span>Divergências nos testes de integridade</span><strong>0</strong><em>nos dois turnos</em></div>
        <div class="news-kpi"><span>Votos após as 17h</span><strong>~34 mil</strong><em>&lt; 1% da margem</em></div>
      </div>`;
  }

  _verificacoes() {
    return `
      <h4 class="news-secao">${getIcon('shieldCheck')} Quem verificou e o que concluiu</h4>
      <div class="news-grid">${this.n.verificacoes.map(v => `
        <article class="news-card">
          <header><span class="news-tipo">${esc(v.tipo)}</span>${selo(v.status)}</header>
          <h5>${esc(v.agente)}</h5>
          <p class="news-feito">${esc(v.oQueFez)}</p>
          <p class="news-resultado"><strong>Resultado:</strong> ${esc(v.resultado)}</p>
          ${fontesHtml(v.fontes)}
        </article>`).join('')}
      </div>`;
  }

  _alegacoes() {
    return `
      <h4 class="news-secao">${getIcon('alertTriangle')} Alegações e o que se verificou</h4>
      <div class="news-lista">${this.n.alegacoes.map(x => `
        <article class="news-alegacao">
          <header>${selo(x.veredito, x.rotulo)}<span class="news-origem">${esc(x.origem)}</span></header>
          <h5>${esc(x.alegacao)}</h5>
          <p>${esc(x.explicacao)}</p>
          ${fontesHtml(x.fontes)}
        </article>`).join('')}
      </div>`;
  }

  /** Tabela "de onde vieram os votos ganhos no 2º turno" (estimativa por urna) */
  _migracao() {
    const m = this.a.migracao;
    const faixa = v => (v >= 0 && v <= 100 ? `${fmtNum(v)}%` : '—');
    const linhas = m.origens.map(o => `
      <tr><td>${esc(o.origem)}</td><td class="num">${fmtInt(o.votos1)}</td>
      <td class="num">${faixa(o.paraLula)}</td><td class="num">${faixa(o.paraFlavio)}</td></tr>`).join('');
    return `
      <p>Lula ganhou ${fmtInt(m.ganhoLula)} votos e Flávio ${fmtInt(m.ganhoFlavio)}. Havia ${fmtInt(m.disputados)} votos em disputa: ${fmtInt(m.votosTerceiros1)} dos candidatos eliminados e ${fmtInt(m.aumentoValidos)} votos válidos a mais no 2º turno (mais comparecimento e menos brancos e nulos). Lula ficou com ${fmtNum(m.fatiaLula)}% deles.</p>
      <div class="news-tabela-wrap"><table class="news-tabela news-tabela-migracao">
        <thead><tr><th>De onde</th><th class="num">1º turno</th><th class="num">Lula</th><th class="num">Flávio</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table></div>
      <p class="news-procura">Estimativa urna a urna (regressão sobre ${fmtInt(this.a.t1.urnas)} urnas). Mostra para onde foram os votos em média, não o voto de cada pessoa; "—" indica valor fora de 0–100%, limite conhecido do método.</p>`;
  }

  _casoContraTse() {
    const c = this.n.casoContraTse;
    const item = (x, ok) => `
      <article class="news-alegacao">
        <header>${selo(ok ? 'parcial' : 'falso', ok ? 'Tem respaldo' : 'Sem respaldo')}</header>
        <h5>${esc(x.titulo)}</h5>
        <p>${esc(x.explicacao)}</p>
        ${x.migracao ? this._migracao() : ''}
        ${fontesHtml(x.fontes)}
      </article>`;
    return `
      <h4 class="news-secao">${getIcon('scaleUnbalanced')} O caso contra o TSE</h4>
      <p class="news-intro">O argumento mais forte da oposição, com as fontes, separado em duas partes: críticas à instituição e alegações sobre a contagem dos votos.</p>
      <div class="news-caso">
        <div class="news-coluna">
          <h5 class="news-coluna-titulo news-alerta">Críticas ao TSE como instituição: têm respaldo</h5>
          ${c.comRespaldo.map(x => item(x, true)).join('')}
        </div>
        <div class="news-coluna">
          <h5 class="news-coluna-titulo news-falso">Fraude na contagem dos votos: sem respaldo</h5>
          ${c.semRespaldo.map(x => item(x, false)).join('')}
        </div>
      </div>
      <div class="news-veredito news-veredito-neutro">
        <span class="news-veredito-icone">${getIcon('scale')}</span>
        <div><strong>Conclusão</strong><p>${esc(c.resumo)}</p></div>
      </div>`;
  }

  _auditoria() {
    return `
      <h4 class="news-secao">${getIcon('database')} Auditoria deste painel nos arquivos do TSE</h4>
      <p class="news-intro">Testes estatísticos rodados nos arquivos oficiais, urna por urna e candidato por candidato. Anomalia estatística não é prova de fraude; fraude se comprova com boletim de urna, log ou perícia.</p>
      <div class="news-testes">${this.testes().map(([t, procura, resultado, ok]) => `
        <div class="news-teste">
          <span class="news-teste-icone ${ok ? 'news-ok' : 'news-alerta'}">${getIcon(ok ? 'checkCircle' : 'alertTriangle')}</span>
          <div>
            <h5>${esc(t)}</h5>
            <p class="news-procura">Procura: ${esc(procura)}</p>
            <p>${esc(resultado)}</p>
          </div>
        </div>`).join('')}
      </div>`;
  }

  _pontosDeAtencao() {
    const a = this.a;
    const div = a.divergenciaArquivos.t1;
    const ren = this.n.contexto.candidatoRenuncia;
    const tr = this.n.contexto.votoEmTransito;
    const mu = a.mudancaDeUrna;
    const linhas = a.viradaZonas.atipicas.map(z => `
      <tr><td>${esc(titulo(z.municipio))} (${esc(z.uf)}), zona ${esc(z.zona)}</td>
      <td class="num">${fmtPp(z.variacaoPp)}</td><td class="num">${fmtNum(z.desvios)}</td>
      <td class="num">${z.urnasMesmaDirecao}/${z.urnas}</td></tr>`).join('');
    return `
      <h4 class="news-secao">${getIcon('search')} Pontos de atenção, explicados</h4>
      <div class="news-lista">
        <article class="news-alegacao">
          <h5>${fmtInt(div.candidatos.reduce((s, c) => s + c.diferenca, 0))} votos do 1º turno que não aparecem no resultado por zona</h5>
          <p>Os votos estão nas urnas (${fmtInt(div.nominaisUrnas)} votos nominais) e somem do arquivo por zona republicado (${fmtInt(div.nominaisZona)}), em ${fmtInt(div.zonasComDiferenca)} zonas. São todos de ${esc(ren.nome)}. ${esc(ren.texto)} Equivalem a 0,004% dos votos, e no 2º turno os arquivos batem exatamente.</p>
          ${fontesHtml(ren.fontes)}
        </article>
        <article class="news-alegacao">
          <h5>${fmtInt(mu.eleitores)} eleitores que mudaram de urna entre os turnos</h5>
          <p>Saem, quase sempre um por urna, de ${fmtInt(mu.urnasQuePerderam)} urnas espalhadas pelo país e entram em urnas de ${esc(mu.principaisDestinos.map(titulo).join(', '))}; o total nacional não muda (saldo ${fmtInt(mu.saldo)}). ${esc(tr.texto)}</p>
          ${fontesHtml(tr.fontes)}
        </article>
        <article class="news-alegacao">
          <h5>Zonas com virada atípica entre os turnos</h5>
          <p>Em ${fmtInt(a.viradaZonas.zonas)} zonas, a fatia de Flávio entre os dois candidatos mudou em média ${fmtPp(a.viradaZonas.mediaPp)} (desvio de ${fmtNum(a.viradaZonas.desvioPp)} pp). Estas passaram de 4 desvios. Em todas, quase todas as urnas se moveram na mesma direção, o que aponta para mudança política local (apoio de prefeito, por exemplo), e não para urnas mexidas.</p>
          <div class="news-tabela-wrap"><table class="news-tabela">
            <thead><tr><th>Zona</th><th class="num">Virada</th><th class="num">Desvios</th><th class="num">Urnas na mesma direção</th></tr></thead>
            <tbody>${linhas}</tbody>
          </table></div>
        </article>
      </div>`;
  }

  _confira() {
    return `
      <h4 class="news-secao">${getIcon('externalLink')} Confira você mesmo</h4>
      <div class="news-confira">${this.n.confira.map(c => `
        <a class="news-confira-item" href="${esc(linkSeguro(c.url))}" target="_blank" rel="noopener noreferrer">
          <strong>${esc(c.titulo)}</strong><span>${esc(c.descricao)}</span>
        </a>`).join('')}
      </div>`;
  }

  _rodape() {
    const m = this.a.meta;
    return `
      <details class="news-origem-dados">
        <summary>Arquivos usados na auditoria (atualizado em ${esc(this.n.atualizadoEm)})</summary>
        <ul>${m.arquivos.map(f => `
          <li><a href="${esc(linkSeguro(f.pacote))}" target="_blank" rel="noopener noreferrer">${esc(f.arquivo)}</a>
          · gerado pelo TSE em ${esc(f.geradoPeloTse)} · SHA-256 <code>${esc(f.sha256.slice(0, 16))}…</code></li>`).join('')}
        </ul>
        <p>Gerado por <code>${esc(m.geradoPor)}</code>.</p>
      </details>`;
  }
}
