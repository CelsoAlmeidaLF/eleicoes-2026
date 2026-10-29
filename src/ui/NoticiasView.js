import { getIcon } from '../infrastructure/icons/Icons.js';
import { escapeHtml as esc } from '../infrastructure/lib/escapeHtml.js';

/**
 * Aba "Notícias": para o leitor que desconfia do TSE. Começa pelo que procede nas críticas ao tribunal,
 * mostra o que os arquivos das urnas dizem (boletins, logs e auditoria estatística), quem verificou,
 * as alegações checadas e um guia para conferir sozinho. Só monta HTML a partir dos dados recebidos;
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
  falso: { classe: 'news-falso', rotulo: 'Não se sustenta nos dados' },
  'sem-prova': { classe: 'news-falso', rotulo: 'Sem prova apresentada' },
  parcial: { classe: 'news-alerta', rotulo: 'Procede em parte' },
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
   * @param {Object} [urnas] AUDITORIA_URNAS (AuditoriaUrnasData.js): boletins e logs das urnas
   */
  constructor(noticias, auditoria, urnas = null) {
    this.n = noticias;
    this.a = auditoria;
    this.u = urnas;
    this._renderizado = false;
  }

  /** Monta a aba uma vez (o conteúdo é estático) */
  render(raiz = document.getElementById('noticiasConteudo')) {
    if (!raiz || this._renderizado) return;
    raiz.innerHTML = [
      this._apresentacao(),
      this._resumo(),
      this._casoContraTse(),
      this._boletinsELogs(),
      this._auditoria(),
      this._pontosDeAtencao(),
      this._verificacoes(),
      this._alegacoes(),
      this._guia(),
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

  _apresentacao() {
    const ap = this.n.apresentacao;
    if (!ap) return '';
    return `
      <div class="news-apresentacao">
        <strong>${esc(ap.titulo)}</strong>
        <p>${esc(ap.texto)}</p>
      </div>`;
  }

  _resumo() {
    const a = this.a;
    const b = this.u?.boletins;
    return `
      <div class="news-veredito">
        <span class="news-veredito-icone">${getIcon('checkCircle')}</span>
        <div>
          <strong>O problema está na conduta do tribunal, não na contagem dos votos.</strong>
          <p>As críticas documentadas da oposição se sustentam: a prorrogação inédita da votação até as 19h por decisão individual, a moderação de conteúdo sem transparência e a recusa ao voto impresso. Mas os arquivos das próprias urnas não mostram fraude: ${b ? `o boletim impresso em cada seção bate voto a voto com o resultado oficial em ${fmtInt(b.urnasComparadas)} urnas` : 'a soma dos boletins de urna bate com a totalização'}, e Lula foi reeleito por ${fmtInt(a.margem2)} votos. Testes de integridade, observadores e auditorias independentes de código aberto chegam ao mesmo número.</p>
        </div>
      </div>
      <div class="news-kpis">
        <div class="news-kpi"><span>Margem no 2º turno</span><strong>${fmtInt(a.margem2)}</strong><em>votos</em></div>
        <div class="news-kpi"><span>Boletins × resultado oficial</span><strong>${b ? fmtInt(b.urnasComDiferenca) : '0'}</strong><em>diferenças${b ? ` em ${fmtInt(b.urnasComparadas)} urnas` : ''}</em></div>
        <div class="news-kpi"><span>Divergências nos testes de integridade</span><strong>0</strong><em>nos dois turnos</em></div>
        <div class="news-kpi"><span>Votos após as 17h</span><strong>~34 mil</strong><em>&lt; 1% da margem</em></div>
      </div>`;
  }

  /** Testes nos arquivos da própria urna: [teste, o que procura, resultado, ok?] */
  testesUrnas() {
    const u = this.u;
    if (!u) return [];
    const b = u.boletins, m = u.urnas, l = u.logs;
    return [
      ['Boletim impresso × resultado oficial', 'Votos alterados depois de saírem da urna, na transmissão ou na totalização',
        `${fmtInt(b.urnasComparadas)} urnas comparadas voto a voto: ${fmtInt(b.urnasComDiferenca)} diferenças, nenhuma urna sobrando ou faltando. O TSE não publicou os boletins do 2º turno de ${b.ufsSemBoletim.join(', ') || 'nenhuma UF'}.`, b.urnasComDiferenca === 0],
      ['Voto sem eleitor liberado', '"Urna votando sozinha": voto computado sem o mesário ter habilitado um eleitor',
        `Logs de ${fmtInt(l.urnas)} urnas (${l.ufs.join(' e ')} inteiros), ${fmtInt(l.votos)} votos: ${fmtInt(l.votosSemEleitorHabilitado)} votos sem habilitação.`, l.votosSemEleitorHabilitado === 0],
      ['Rajada de votos', 'Votos fabricados em sequência rápida demais para uma pessoa real',
        `${fmtInt(l.paresMenosDe15s)} pares de votos com menos de 15 segundos; o menor intervalo foi ${l.menorIntervaloSeg} s, o típico ${l.intervaloMedianoSeg} s.`, l.paresMenosDe15s === 0],
      ['Log da urna × resultado oficial', 'Resultado com mais votos que os registrados na urna',
        `${fmtInt(l.logIgualAoOficial)} iguais. Nas ${l.logDiferente} restantes houve troca de urna no meio do dia (registrada no log); os votos antes da troca vêm da memória da urna substituída.`, l.diferentesComLogAMais === 0 && l.diferentesComTrocaDeUrna === l.logDiferente],
      ['Eleitores sem biometria', 'Votos liberados por código, sem digital, favorecendo um candidato',
        `${fmtNum(m.semBiometria.pct, 2)}% dos votantes foram liberados sem biometria. Dentro do mesmo município, isso não tem relação com o voto em Lula (correlação ${fmtNum(m.semBiometria.correlacaoComLulaNoMunicipio, 3)}).`, Math.abs(m.semBiometria.correlacaoComLulaNoMunicipio) < 0.1],
      ['Horários da urna', 'Urna aberta antes da hora ou boletim emitido antes do fim da votação',
        `${m.aberturaAntesDas7h} urnas abertas antes das 7h e ${m.boletimAntesDoEncerramento} boletins emitidos antes do encerramento. ${fmtInt(m.encerradasDepoisDas19h05)} urnas fecharam depois das 19h05, quase todas pouco depois, com fila.`, m.aberturaAntesDas7h === 0 && m.boletimAntesDoEncerramento === 0]
    ];
  }

  _boletinsELogs() {
    if (!this.u) return '';
    const casos = this.u.casos.map(c => `
      <article class="news-alegacao">
        <header>${selo('ok', 'Explicado')}<span class="news-origem">${esc(c.municipio)} (${esc(c.uf)}), zona ${esc(c.zona)}, seção ${esc(c.secao)}</span></header>
        <h5>Urna encerrada às ${esc(c.encerramento || '?')}</h5>
        <p>O log da urna original mostra ${fmtInt(c.votosNaUrnaOriginal)} votos entre ${esc(c.primeiroVoto || '?')} e ${esc(c.ultimoVoto || '?')}, todos com eleitor habilitado (${fmtInt(c.votosSemHabilitacao)} sem habilitação), iguais aos ${fmtInt(c.comparecimentoOficial)} do resultado oficial. A impressora falhou no fim do dia; à noite, uma urna de contingência recuperou os votos da memória para emitir o boletim, sem nenhum voto novo.</p>
      </article>`).join('');
    const cargas = this.u.urnas.carregadasNoDia;
    return `
      <h4 class="news-secao">${getIcon('database')} Boletins e logs das urnas (2º turno)</h4>
      <p class="news-intro">O boletim é impresso e assinado pela própria urna na seção, na frente dos fiscais; o log registra cada passo do eleitor. São os arquivos mais próximos do voto: se alguém tivesse mexido na contagem, a diferença apareceria aqui.</p>
      <div class="news-testes">${this.testesUrnas().map(([t, procura, resultado, ok]) => `
        <div class="news-teste">
          <span class="news-teste-icone ${ok ? 'news-ok' : 'news-alerta'}">${getIcon(ok ? 'checkCircle' : 'alertTriangle')}</span>
          <div>
            <h5>${esc(t)}</h5>
            <p class="news-procura">Procura: ${esc(procura)}</p>
            <p>${esc(resultado)}</p>
          </div>
        </div>`).join('')}
      </div>
      <div class="news-lista">${casos}
        <article class="news-alegacao">
          <header>${selo('ok', 'Explicado')}<span class="news-origem">${cargas.length} urnas</span></header>
          <h5>Urnas carregadas no dia da eleição</h5>
          <p>${cargas.map(c => `${esc(c.municipio)} (${esc(c.uf)}): carga às ${esc(c.carga)}, abertura às ${esc(c.abertura || '?')}, Lula ${fmtInt(c.lula)} × Flávio ${fmtInt(c.flavio)}`).join('; ')}. São urnas preparadas no dia para substituir equipamentos com defeito, abertas no meio da manhã, com votação normal para cada lugar.</p>
        </article>
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
      <h4 class="news-secao">${getIcon('alertTriangle')} Outras alegações e o que se verificou</h4>
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
        <header>${selo(ok ? 'parcial' : 'falso', ok ? 'Procede' : 'Não se sustenta nos dados')}</header>
        <h5>${esc(x.titulo)}</h5>
        <p>${esc(x.explicacao)}</p>
        ${x.migracao ? this._migracao() : ''}
        ${fontesHtml(x.fontes)}
      </article>`;
    return `
      <h4 class="news-secao">${getIcon('scaleUnbalanced')} O caso contra o TSE: o que procede e o que não se sustenta</h4>
      <p class="news-intro">O argumento da oposição, com as fontes, separado em duas partes: a conduta do tribunal e a contagem dos votos.</p>
      <div class="news-caso">
        <div class="news-coluna">
          <h5 class="news-coluna-titulo news-alerta">Procede: críticas ao TSE como poder</h5>
          ${c.comRespaldo.map(x => item(x, true)).join('')}
        </div>
        <div class="news-coluna">
          <h5 class="news-coluna-titulo news-falso">Não se sustenta nos dados: fraude na contagem</h5>
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
      <h4 class="news-secao">${getIcon('chartColumn')} Auditoria estatística dos resultados (dois turnos)</h4>
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

  _guia() {
    const g = this.n.guia;
    if (!g?.length) return '';
    return `
      <h4 class="news-secao">${getIcon('search')} Não confie: verifique você mesmo</h4>
      <ol class="news-guia">${g.map(p => `
        <li>
          <strong>${esc(p.passo)}</strong>
          <p>${esc(p.texto)}</p>
          ${p.url ? `<a href="${esc(linkSeguro(p.url))}" target="_blank" rel="noopener noreferrer">${esc(p.url.replace(/^https?:\/\//, ''))}</a>` : ''}
        </li>`).join('')}
      </ol>`;
  }

  _confira() {
    return `
      <h4 class="news-secao">${getIcon('externalLink')} Onde acompanhar</h4>
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
        <p>Gerado por <code>${esc(m.geradoPor)}</code>${this.u ? ` e <code>${esc(this.u.geradoPor)}</code> (boletins de urna e arquivos transmitidos para totalização do Portal de Dados Abertos do TSE)` : ''}.</p>
      </details>`;
  }
}
