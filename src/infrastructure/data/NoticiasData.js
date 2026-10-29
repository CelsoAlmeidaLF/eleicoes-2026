/**
 * Notícias, críticas e verificações sobre a eleição presidencial de 2026 (aba "Notícias").
 * Escrito para o leitor que desconfia do TSE: começa pelo que procede nas críticas ao tribunal,
 * mostra o que os arquivos das urnas dizem e ensina a conferir sozinho.
 * Regras: toda afirmação tem fonte com link que abre a matéria citada (tests/noticias.test.js
 * cobra fonte; confira o link antes de publicar). Preferência por veículos lidos pela direita
 * (Gazeta do Povo, Revista Oeste) e por documentos primários (TSE, OEA, código aberto).
 * Os números da auditoria vêm de AuditoriaData.js e AuditoriaUrnasData.js, gerados por script.
 */

/** @typedef {{ titulo: string, url: string, veiculo: string, data?: string }} Fonte */

const OEA = { titulo: 'Relatório preliminar da Missão de Observação Eleitoral da OEA (2º turno)', veiculo: 'OEA', data: '27/10/2026', url: 'http://www.oas.org/fpdb/press/2026_MOE_Brasil_Segundo_Turno_Relatorio_Preliminar_POR.pdf' };
const TARCISIO = { titulo: 'Reconhecer eleição não significa calar sobre excessos, afirma Tarcísio', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/reconhecer-eleicao-nao-significa-calar-sobre-excessos-afirma-tarcisio/' };
const DATAURNAS = { titulo: 'DataUrnas-BR: auditoria reprodutível dos arquivos da urna (código aberto)', veiculo: 'GitHub', url: 'https://github.com/alissonlinneker/DataUrnas-BR' };

export const NOTICIAS = Object.freeze({
  atualizadoEm: '28/10/2026',

  /** Abertura da aba: o convite é conferir, não acreditar */
  apresentacao: {
    titulo: 'Não confie: verifique',
    texto: 'Desconfiar de quem conta os votos é direito de todo cidadão, e há motivos reais para cobrar o TSE. Esta aba não pede que você confie no tribunal, na imprensa ou neste painel: separa o que procede nas críticas do que os arquivos das próprias urnas mostram, e ensina a conferir sozinho, com os mesmos dados públicos usados aqui.'
  },

  /** Quem fiscalizou a eleição e o que concluiu */
  verificacoes: [
    {
      agente: 'Fiscalização dos Testes de Integridade das Urnas',
      tipo: 'Auditoria no dia da eleição, com testemunhas',
      status: 'ok',
      oQueFez: 'Urnas sorteadas na véspera recebem, no dia da eleição, votos de cédulas de papel digitados na frente de fiscais e testemunhas; no fim, o boletim é comparado com as cédulas. Feito nos dois turnos, em todos os estados, com acompanhamento do TCU.',
      resultado: 'Nenhuma divergência entre cédulas e urnas nos dois turnos (389 votos conferidos no TSE no 2º turno; 33 urnas no TRE-SP no 1º; 23 no TRE-AL no 2º).',
      fontes: [
        { titulo: 'Teste de Integridade do 2º turno confirma correspondência entre cédulas e votos', veiculo: 'TSE', url: 'https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/teste-de-integridade-do-2o-turno-no-tse-confirma-correspondencia-entre-cedulas-e-votos-nas-urnas' },
        { titulo: 'Teste de Integridade das urnas no 2º turno é concluído sem divergências em São Paulo', veiculo: 'TRE-SP', url: 'https://www.tre-sp.jus.br/comunicacao/noticias/2026/Outubro/teste-de-integridade-das-urnas-no-2o-turno-e-concluido-sem-divergencias-em-sao-paulo' },
        { titulo: 'Eleições de 2026 terão acompanhamento do TCU nos Testes de Integridade', veiculo: 'TSE', url: 'https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/eleicoes-de-2026-terao-acompanhamento-do-tcu-nos-testes-de-integridade-das-urnas-eletronicas' }
      ]
    },
    {
      agente: 'Inspeção do código-fonte por partidos e entidades',
      tipo: 'Inspeção técnica antes da lacração',
      status: 'ok',
      oQueFez: 'O código-fonte da urna e dos sistemas ficou aberto às entidades fiscalizadoras desde outubro de 2025. O União Brasil foi o primeiro partido a inspecionar, em maio; o Ministério Público Eleitoral concluiu a inspeção em agosto.',
      resultado: 'Inspeções concluídas antes da lacração dos sistemas, sem apontamento de falha divulgado.',
      fontes: [
        { titulo: 'União Brasil é o 1º partido a inspecionar códigos-fonte dos sistemas das Eleições 2026', veiculo: 'TSE', url: 'https://www.tse.jus.br/comunicacao/noticias/2026/Maio/uniao-brasil-e-o-1o-partido-a-inspecionar-codigos-fonte-dos-sistemas-das-eleicoes-2026' },
        { titulo: 'MP Eleitoral conclui inspeção nos códigos-fonte da urna eletrônica', veiculo: 'MPF', url: 'https://www.mpf.mp.br/o-mpf/unidades/procuradoria-geral-da-republica-pgr/noticias/mp-eleitoral-realiza-inspecao-nos-codigos-fonte-da-urna-eletronica-e-sistemas-utilizados-nas-eleicoes-2026' }
      ]
    },
    {
      agente: 'Missão de Observação Eleitoral da OEA',
      tipo: 'Observação internacional',
      status: 'critica',
      oQueFez: '88 observadores de 22 países no 2º turno, em 21 estados, no DF e em 5 cidades no exterior. Acompanharam a lacração das urnas, o sorteio do Teste de Integridade e a conferência dos hashes dos sistemas.',
      resultado: 'Os resultados "coincidem com as informações coletadas em campo" e a missão "não tem dúvidas quanto à integridade dos dados oficiais". Mas critica com dureza a prorrogação até as 19h por decisão individual de um ministro do STF ("situação inédita", que "não deve se repetir") e o recorde de 1.071 ações entre as campanhas.',
      fontes: [OEA]
    },
    {
      agente: 'Auditorias independentes de cidadãos (código aberto)',
      tipo: 'Qualquer um pode refazer a conta',
      status: 'ok',
      oQueFez: 'Programadores sem vínculo com o TSE baixaram os arquivos das urnas e publicaram o código: o DataUrnas-BR conferiu a assinatura digital e o hash de todas as urnas do 1º turno; o urna-2t cruzou boletim, registro digital do voto e log de 57.744 urnas do 2º turno; o AnaliseEleicoes aplicou testes forenses nos boletins.',
      resultado: 'Nenhuma afirma ter achado fraude. 1º turno: 499.207 assinaturas válidas, nenhum hash divergente e recontagem voto a voto sem diferença. 2º turno: registro digital igual ao boletim em 100% das urnas analisadas.',
      fontes: [
        DATAURNAS,
        { titulo: 'urna-2t: auditoria independente do 2º turno (boletim, registro digital e log)', veiculo: 'GitHub', url: 'https://github.com/mmarsz/urna-2t' },
        { titulo: 'AnaliseEleicoes: testes forenses nos boletins de urna', veiculo: 'GitHub', url: 'https://github.com/radzki/AnaliseEleicoes' }
      ]
    },
    {
      agente: 'Análise dos logs: votos depois das 17h',
      tipo: 'Imprensa e analistas',
      status: 'ok',
      oQueFez: 'Contagem, nos registros (logs) públicos das urnas, dos votos dados depois das 17h, quando a votação foi prorrogada.',
      resultado: 'Entre 34,3 mil e 35,5 mil votos depois das 17h, conforme o recorte (TSE: 34.393). Menos de 1% da margem de 4,43 milhões: mesmo que todos fossem de um só candidato, o vencedor não mudaria.',
      fontes: [
        { titulo: 'Eleições 2026: 35 mil votos foram registrados após as 17h', veiculo: 'DOL', url: 'https://dol.com.br/noticias/politica/eleicoes-2026/966566/eleicoes-2026-35-mil-votos-foram-registrados-apos-as-17h' },
        { titulo: 'Prorrogação até as 19h não permitiu fraude nem alterou resultado', veiculo: 'NSC Total', url: 'https://nsctotal.com.br/politica/prorrogacao-da-votacao-ate-as-19h-nao-permitiu-fraude-eleitoral-nem-alterou-resultado-das-eleicoes-entenda' }
      ]
    }
  ],

  /** Outras alegações que circularam e o que os dados e as fontes mostram */
  alegacoes: [
    {
      alegacao: 'Lideranças da direita reconhecem o resultado sem abrir mão de denunciar os excessos',
      origem: 'Tarcísio de Freitas, PL e o candidato a vice Alfredo Gaspar',
      veredito: 'ok',
      rotulo: 'Procede',
      explicacao: 'Tarcísio reconheceu a vitória de Lula e disse que "reconhecer o resultado não significa calar sobre os excessos", citando o uso da máquina pública e a interferência do Judiciário. O PL e o vice da chapa também reconheceram o resultado.',
      fontes: [TARCISIO, { titulo: 'Veja íntegra de carta assinada por Flávio Bolsonaro', veiculo: 'Metrópoles', data: '28/10/2026', url: 'https://www.metropoles.com/brasil/veja-integra-de-carta-assinada-por-flavio-bolsonaro-apos-fugir-do-brasil' }]
    },
    {
      alegacao: 'Os Estados Unidos confirmaram que houve fraude',
      origem: 'Redes sociais, depois de declarações de Donald Trump',
      veredito: 'sem-prova',
      rotulo: 'Não procede',
      explicacao: 'Trump disse em 26/10 que a eleição "pareceu mais uma eleição fraudada", sem apresentar dado, e na mesma fala disse gostar de Lula. Segundo a CNN Brasil, o governo americano ainda não havia reconhecido oficialmente o resultado, o que é fato político relevante. Mas nenhum órgão do governo dos EUA publicou declaração formal de fraude; o Departamento de Estado anunciou vistos para Flávio Bolsonaro e família. Antes da eleição, o Departamento de Estado já tinha chamado de censura exigências do TSE às redes.',
      fontes: [
        { titulo: 'Trump diz que eleição do Brasil pareceu fraudada, mas que gosta de Lula', veiculo: 'CNN Brasil', data: '26/10/2026', url: 'https://www.cnnbrasil.com.br/internacional/trump-diz-que-eleicao-do-brasil-pareceu-fraudada-mas-que-gosta-de-lula/' },
        { titulo: "Brazil's Flávio Bolsonaro and family will get US visas after election loss", veiculo: 'The Washington Post', data: '27/10/2026', url: 'https://www.washingtonpost.com/world/2026/10/27/brazil-flavio-bolsonaro-passport-lula/c1bb7428-d22f-11f1-9931-2a41b76fc976_story.html' },
        { titulo: 'EUA apontam censura do TSE em nova trava do X para 2026', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/mundo/eua-apontam-censura-do-tse-em-nova-trava-do-x-para-2026/' }
      ]
    },
    {
      alegacao: 'Auditores encontraram fraude nas urnas',
      origem: 'Redes sociais',
      veredito: 'sem-prova',
      rotulo: 'Não procede',
      explicacao: 'Nenhuma auditoria publicada sobre 2026 afirma fraude: as independentes, de código aberto, conferiram assinaturas, hashes, registros digitais e logs sem achar adulteração. Em 2022, o responsável pelo relatório do Instituto Voto Legal, contratado pelo PL, afirmou que "a palavra fraude jamais apareceu em nossos relatórios": o trabalho apontou falhas técnicas a corrigir, não votos alterados.',
      fontes: [DATAURNAS, { titulo: 'PF deturpa relatórios técnicos sobre erros nas urnas (sobre o relatório do IVL, 2022)', veiculo: 'A Investigação', url: 'https://www.ainvestigacao.com/p/pf-deturpa-relatorios-tecnicos-sobre' }]
    },
    {
      alegacao: 'A pausa no painel de resultados do 1º turno serviu para fraudar a apuração',
      origem: 'Redes sociais',
      veredito: 'falso',
      rotulo: 'Não se sustenta nos dados',
      explicacao: 'Parou a divulgação no site, por excesso de acesso, não a apuração. Os boletins de cada urna já tinham sido impressos e afixados nas seções, e a soma deles bate com o resultado.',
      fontes: [
        { titulo: 'TSE desmente alegação de fraude na apuração dos votos', veiculo: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/tse-desmente-alegacao-de-fraude-na-apuracao-dos-votos' },
        { titulo: 'TSE vai investigar atraso na divulgação de resultados?', veiculo: 'Boatos.org', url: 'https://www.boatos.org/politica/tse-vai-investigar-se-atraso-na-divulgacao-de-resultados-das-eleicoes-tem-relacao-com-fraude-contra-flavio-bolsonaro.html' }
      ]
    },
    {
      alegacao: 'A soma de três seções de Teixeira de Freitas (BA) comprova fraude',
      origem: 'Vídeo nas redes sociais',
      veredito: 'falso',
      rotulo: 'Não se sustenta nos dados',
      explicacao: 'A conta usa 3 das 342 seções da cidade. Somando todos os boletins, o resultado bate com o do TSE.',
      fontes: [{ titulo: 'Soma de três boletins de urna não comprova fraude em Teixeira de Freitas (BA)', veiculo: 'Justiça Eleitoral: Fato ou Boato', url: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/checagens/2026/soma-de-tres-boletins-de-urna-nao-comprova-fraude-na-eleicao-presidencial-em-teixeira-de-freitas-ba' }]
    },
    {
      alegacao: 'O PL vai anular a eleição na Justiça',
      origem: 'Flávio Bolsonaro, 25/10',
      veredito: 'pendente',
      rotulo: 'Anunciado, sem decisão até 28/10',
      explicacao: 'O pedido foi anunciado. Juristas avaliam que tem pouca chance: o caminho natural seria recorrer da decisão de Zanin no próprio STF, e o artigo 219, parágrafo único, do Código Eleitoral impede que a nulidade seja pedida por quem também pediu a prorrogação.',
      fontes: [
        { titulo: 'Flávio Bolsonaro diz que não reconhece resultado e vai pedir anulação da eleição', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/eleicoes/2026/flavio-bolsonaro-pronunciamento-anulacao-eleicao/' },
        { titulo: 'O (impossível) pedido de anulação do segundo turno', veiculo: 'Consultor Jurídico', data: '26/10/2026', url: 'https://conjur.com.br/2026-out-26/o-impossivel-pedido-de-anulacao-do-segundo-turno/' }
      ]
    }
  ],

  /**
   * "O caso contra o TSE": o argumento da oposição, separando as críticas à conduta do tribunal
   * (com respaldo documental) das teses de fraude na contagem (sem respaldo nos arquivos das urnas).
   */
  casoContraTse: {
    resumo: 'Há base documental farta para cobrar o TSE como poder: a prorrogação inédita fora do horário legal, decisões individuais contraditórias, moderação de conteúdo sem transparência e a recusa ao voto impresso. Mas os arquivos das urnas não mostram fraude na contagem: o boletim impresso em cada seção, na frente dos fiscais, bate voto a voto com o resultado oficial. A cobrança que se sustenta é por mais transparência e menos poder concentrado, não pela anulação dos votos.',
    comRespaldo: [
      {
        titulo: 'A prorrogação até as 19h foi irregular e inédita',
        explicacao: 'O ministro Cristiano Zanin, do STF, decidiu sozinho, por cima da competência do TSE, e a ordem chegou depois do fim do horário legal. A OEA chamou de "situação inédita" que gerou confusão e pediu que não se repita; o próprio presidente do TSE disse que "nunca houve prorrogação" e que ela poderia ter comprometido a eleição. Ressalva: o PL também pediu prorrogação, e foram cerca de 34 mil votos depois das 17h.',
        fontes: [
          OEA,
          { titulo: 'Flávio critica decisão de Zanin, mas PL também pediu prorrogação da votação', veiculo: 'Metrópoles', url: 'https://www.metropoles.com/brasil/flavio-critica-decisao-de-zanin-mas-pl-tambem-pediu-prorrogacao-da-votacao' },
          { titulo: 'Flávio anuncia que vai tentar anulação do resultado da eleição', veiculo: 'Consultor Jurídico', data: '25/10/2026', url: 'https://conjur.com.br/2026-out-25/derrotado-flavio-bolsonaro-critica-zanin-e-diz-que-vai-pedir-anulacao/' }
        ]
      },
      {
        titulo: 'Decisões individuais demais, e contraditórias',
        explicacao: 'Foram 1.071 ações entre as duas campanhas, 75% a mais que em 2022, segundo o próprio presidente do TSE citado pela OEA. A missão aponta a tensão entre liminares imediatas de um só ministro e a revisão pelo colegiado, e houve ordens individuais desfeitas por outro ministro.',
        fontes: [OEA]
      },
      {
        titulo: 'Moderação de conteúdo sem transparência',
        explicacao: 'O TSE não tem dados de quantas contas e postagens mandou bloquear desde 2022 (editorial da Folha). O Departamento de Estado dos EUA chamou de censura as exigências feitas ao X para 2026. O TSE retirou das regras finais a permissão de impulsionar críticas a governos antes da campanha, e Flávio Bolsonaro desistiu de um debate citando "censura". Não há medição pública de que a moderação tenha atingido mais um lado que o outro: o TSE também atendeu dezenas de pedidos da campanha de Flávio.',
        fontes: [
          { titulo: 'Folha de S.Paulo denuncia falta de controle sobre censura no TSE', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/imprensa/emfolha-de-s-paulo-em-denuncia-falta-de-controle-sobre-censura-no-tse/' },
          { titulo: 'EUA apontam censura do TSE em nova trava do X para 2026', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/mundo/eua-apontam-censura-do-tse-em-nova-trava-do-x-para-2026/' },
          { titulo: 'TSE proíbe impulsionamento de críticas no período pré-eleitoral', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/tse-proibe-impulsionamento-de-criticas-no-periodo-pre-eleitoral/' },
          { titulo: 'Flávio fala em censura do TSE e desiste de debate da TV Globo', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/eleicoes/2026/flavio-bolsonaro-desiste-de-participar-de-debate-da-tv-globo/' },
          { titulo: 'Flávio Bolsonaro promete direito de criticar, mas aciona TSE contra opositores', veiculo: 'Lupa', data: '30/09/2026', url: 'https://www.agencialupa.org/jornalismo/2026/09/30/flavio-bolsonaro-promete-direito-de-criticar-mas-aciona-tse-contra-opositores/' }
        ]
      },
      {
        titulo: 'O eleitor não tem comprovante físico do próprio voto',
        explicacao: 'Não há voto impresso: o eleitor não consegue conferir em papel que o voto dele foi registrado como digitou. A emenda que tornava a impressão obrigatória passou na CCJ do Senado (14 a 12), mas não valeu para esta eleição, e o TSE não acatou as sugestões de voto impresso na audiência pública das regras de 2026. O que existe hoje para conferência é o boletim impresso em cada seção, o registro digital do voto e o Teste de Integridade.',
        fontes: [
          { titulo: 'O que diz o parecer da PEC do voto impresso e como ele contrapõe o TSE', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/parecer-pec-voto-impresso-auditavel-tse/' },
          { titulo: 'Aprovado na CCJ do Senado, voto impresso pode valer em 2026?', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/oposicao-tenta-avancar-com-projeto-do-voto-impresso-apesar-de-tempo-limitado-e-pressao-do-stf/' },
          { titulo: 'Análise das sugestões às resoluções das Eleições 2026', veiculo: 'TSE', url: 'https://www.tse.jus.br/servicos-judiciais/audiencias-publicas/arquivos/minutas-das-resolucoes-2026/analise-das-sugestoes/sre_atos-gerais-eleicoes-2026_versao-web-2/@@display-file/file/sre_atos-gerais-eleicoes-2026_versao-web-2.pdf' }
        ]
      },
      {
        titulo: 'Falhas de comunicação e arquivos republicados sem aviso',
        explicacao: 'O painel de resultados parou por quase uma hora no 1º turno. O arquivo de votos por zona foi republicado em 28/10 com 5.246 votos a menos no 1º turno, sem nota explicando (a razão, encontrada por esta auditoria, é a renúncia de um candidato). O TSE não publicou os boletins de urna do 2º turno de Roraima no portal de dados abertos. 1.551 urnas foram substituídas no 2º turno. Nada disso muda votos, mas alimenta a desconfiança.',
        fontes: [
          { titulo: 'TSE desmente alegação de fraude na apuração dos votos', veiculo: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/tse-desmente-alegacao-de-fraude-na-apuracao-dos-votos' },
          OEA
        ]
      }
    ],
    semRespaldo: [
      {
        titulo: '"Houve fraude na contagem e Flávio é o verdadeiro presidente eleito"',
        explicacao: 'A carta de 28/10 não anexa documento, processo, boletim de urna ou dado oficial. O boletim impresso em cada seção bate voto a voto com o resultado oficial (ver a auditoria abaixo), e as próprias lideranças da direita reconheceram o resultado.',
        fontes: [
          { titulo: 'Veja íntegra de carta assinada por Flávio Bolsonaro', veiculo: 'Metrópoles', data: '28/10/2026', url: 'https://www.metropoles.com/brasil/veja-integra-de-carta-assinada-por-flavio-bolsonaro-apos-fugir-do-brasil' },
          TARCISIO
        ]
      },
      {
        titulo: '"Mais de 10 milhões de votos para Lula entre os turnos é matematicamente impossível"',
        explicacao: 'O ganho existiu, mas a conta fecha com os dados do TSE: veja ao lado de onde vieram os votos disputados no 2º turno.',
        migracao: true,
        fontes: [{ titulo: 'Flávio diz ser verdadeiro presidente e saúda Trump e Milei', veiculo: 'SBT News', url: 'https://sbtnews.sbt.com.br/noticia/politica/flavio-diz-que-e-o-verdadeiro-presidente-em-carta-ao-povo' }]
      },
      {
        titulo: '"O tribunal está aparelhado pela esquerda"',
        explicacao: 'O presidente do TSE em 2026, Kassio Nunes Marques, foi indicado por Jair Bolsonaro. Desde janeiro, o TSE deu ao menos 36 decisões atendendo pedidos da campanha de Flávio para remover conteúdo de adversários. A crítica ao excesso de poder do tribunal se sustenta; a de que ele age para um lado só, não.',
        fontes: [{ titulo: 'Flávio Bolsonaro promete direito de criticar, mas aciona TSE contra opositores', veiculo: 'Lupa', data: '30/09/2026', url: 'https://www.agencialupa.org/jornalismo/2026/09/30/flavio-bolsonaro-promete-direito-de-criticar-mas-aciona-tse-contra-opositores/' }]
      },
      {
        titulo: '"Fiscais do PL foram expulsos da sala-cofre"',
        explicacao: 'Ninguém de fora entra na sala-cofre dos computadores de totalização; os fiscais do PL acompanharam a apuração nas salas de Totalização e dos Partidos.',
        fontes: [{ titulo: 'Flávio Bolsonaro denuncia fraude, mas documentos e números do TSE contradizem', veiculo: 'Gizmodo', url: 'https://www.gizmodo.com.br/flavio-bolsonaro-denuncia-fraude-nas-eleicoes-mas-documentos-e-numeros-do-tse-contradizem-acusacoes-72928' }]
      }
    ]
  },

  /** Contexto para os pontos que a auditoria dos dados encontrou */
  contexto: {
    candidatoRenuncia: {
      nome: 'Leonardo Avalanche (PRTB, 28)',
      texto: 'Situação do registro e na totalização: "Renúncia". O nome já estava carregado nas urnas, então os votos ficaram registrados nelas e foram anulados na totalização.',
      fontes: [{ titulo: 'Leonardo Avalanche: situação da candidatura (dados do TSE DivulgaCandContas)', veiculo: 'Agência Sertão', url: 'https://agenciasertao.com/eleicoes/candidato/BR/leonardo-avalanche-prtb-br--280002554479/' }]
    },
    votoEmTransito: {
      texto: 'O voto em trânsito é pedido turno a turno: 323.583 eleitores pediram para o 1º turno e 314.519 para o 2º. Quem pede vota numa seção de outra cidade, geralmente em capitais.',
      fontes: [
        { titulo: 'Mais de 314 mil pessoas solicitaram voto em trânsito para o 2º turno', veiculo: 'TNH1', url: 'https://www.tnh1.com.br/noticia/nid/mais-de-314-mil-pessoas-solicitaram-voto-em-transito-para-o-2-turno-das-eleicoes/' },
        { titulo: 'Mais de 323 mil eleitores pediram voto em trânsito para o 1º turno', veiculo: 'Portal Tela', url: 'https://www.portaltela.com/politica/2026/08/21/mais-de-323-mil-eleitores-pediram-voto-em-transito-para-o-1o-turno/' }
      ]
    }
  },

  /** Guia para o cidadão conferir sozinho, sem depender do TSE, da imprensa ou deste painel */
  guia: [
    { passo: 'Ache o boletim da sua seção', texto: 'Com a zona e a seção do seu título (ou do e-Título), abra o boletim de urna no site de resultados do TSE. É o mesmo papel que a urna imprime e que fica afixado na porta da seção no fim da votação, antes de qualquer transmissão.', url: 'https://resultados.tse.jus.br' },
    { passo: 'Compare com quem estava lá', texto: 'Fiscais de partido e eleitores fotografam o boletim impresso. Se a foto de qualquer seção divergir do site, isso é prova de verdade: guarde a foto com data, local e número da urna e leve ao Ministério Público Eleitoral ou ao partido.' },
    { passo: 'Baixe os arquivos de todas as urnas', texto: 'O Portal de Dados Abertos publica, por estado, o boletim, o registro digital de cada voto (sem identificar o eleitor) e o log de cada urna, com hash para conferir que o arquivo não foi trocado.', url: 'https://dadosabertos.tse.jus.br/dataset/resultados-2026-arquivos-transmitidos-para-totalizacao' },
    { passo: 'Refaça a conta com código aberto', texto: 'Os projetos DataUrnas-BR e urna-2t mostram como abrir esses arquivos e refazer a totalização. Os testes desta aba estão nos scripts build_auditoria.py e build_auditoria_urnas.py, no repositório público do painel.', url: 'https://github.com/CelsoAlmeidaLF/eleicoes-2026' },
    { passo: 'Confira a situação dos candidatos', texto: 'Renúncias e indeferimentos explicam votos que aparecem na urna e somem do resultado, como os 5.246 do 1º turno.', url: 'https://divulgacandcontas.tse.jus.br' }
  ],

  /** Onde acompanhar e conferir */
  confira: [
    { titulo: 'Gazeta do Povo: República', descricao: 'Cobertura do voto impresso, do Congresso e das decisões do Judiciário.', url: 'https://www.gazetadopovo.com.br/republica/' },
    { titulo: 'Revista Oeste: Política', descricao: 'Cobertura de liberdades públicas, ativismo judicial e da eleição.', url: 'https://revistaoeste.com/politica/' },
    { titulo: 'Resultados e boletins de urna', descricao: 'O boletim de cada seção, para comparar com a foto tirada na porta da seção.', url: 'https://resultados.tse.jus.br' },
    { titulo: 'Portal de Dados Abertos do TSE', descricao: 'Boletins, registros digitais do voto e logs de todas as urnas, para a auditoria cidadã.', url: 'https://dadosabertos.tse.jus.br' }
  ]
});
