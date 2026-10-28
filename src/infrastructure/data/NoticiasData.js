/**
 * Notícias, investigações e verificações sobre a eleição presidencial de 2026 (aba "Notícias").
 * Conteúdo curado a partir de veículos da imprensa independente e conservadora (Revista Oeste,
 * Gazeta do Povo, Jovem Pan News e congêneres), com foco em transparência, liberdades públicas,
 * ativismo judicial, voto impresso auditável e fiscalização institucional.
 */

/** @typedef {{ titulo: string, url: string, veiculo: string, data?: string }} Fonte */

export const NOTICIAS = Object.freeze({
  atualizadoEm: '28/10/2026',

  /** Quem fiscalizou a eleição e o que concluiu */
  verificacoes: [
    {
      agente: 'Fiscalização nos Testes de Integridade das Urnas',
      tipo: 'Auditoria oficial e acompanhamento externo',
      status: 'ok',
      oQueFez: 'Auditores independentes, entidades fiscalizadoras e partidos acompanharam a votação paralela no dia da eleição, comparando cédulas de papel digitadas com o registro das urnas eletrônicas sorteadas nos dois turnos.',
      resultado: 'Os boletins emitidos pelas urnas sorteadas conferiram com as cédulas físicas inseridas perante as testemunhas presentes nos testes presenciais.',
      fontes: [
        { titulo: 'O que dizem os relatórios de fiscalização sobre os testes de integridade das urnas', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/fiscalizacao-testes-integridade-urnas-eletronicas/' },
        { titulo: 'Auditores e fiscais partidários concluem acompanhamento do teste das urnas', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/auditores-e-fiscais-partidarios-concluem-acompanhamento-do-teste-das-urnas/' }
      ]
    },
    {
      agente: 'Inspeção do Código-Fonte por Partidos e Entidades',
      tipo: 'Inspeção técnica e lacração',
      status: 'ok',
      oQueFez: 'Técnicos de partidos da oposição e entidades fiscalizadoras inspecionaram as linhas de código dos sistemas eleitorais e assinaram digitalmente a cerimônia de lacração dos programas.',
      resultado: 'Os sistemas foram lacrados e congelados em cofre digital antes do início do pleito eleitoral.',
      fontes: [
        { titulo: 'Partidos de oposição concluem inspeção técnica nos sistemas eleitorais e código-fonte', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/politica/partidos-oposicao-inspecao-codigo-fonte-tse/' },
        { titulo: 'Entidades fiscalizadoras acompanham lacração e assinatura digital dos programas das urnas', veiculo: 'Jovem Pan News', url: 'https://jovempan.com.br/noticias/politica/entidades-fiscalizadoras-acompanham-lacracao-urnas.html' }
      ]
    },
    {
      agente: 'Investigações sobre a Prorrogação Inédita da Votação até as 19h',
      tipo: 'Contestação jurídica e de procedimento',
      status: 'critica',
      oQueFez: 'Juristas, jornalistas e parlamentares examinaram a legalidade da prorrogação do encerramento da votação decidida individualmente por ministro do STF fora do horário legal das 17h.',
      resultado: 'Apontou-se quebra da segurança jurídica e da isonomia legal, gerando precedentes de interferência monocrática no cronograma da apuração.',
      fontes: [
        { titulo: 'Decisão monocrática que prorrogou votação fere regras eleitorais e gera contestação', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/decisao-monocratica-prorrogacao-votacao-fere-regras/' },
        { titulo: 'Juristas apontam precedente perigoso em prorrogação de votação por ordem individual', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/politica/juristas-criticam-prorrogacao-votacao-stf/' }
      ]
    },
    {
      agente: 'Análises Independentes dos Boletins de Urna e Logs Oficiais',
      tipo: 'Auditoria cidadã e dados abertos',
      status: 'ok',
      oQueFez: 'Especialistas e analistas de dados compilaram os Boletins de Urna (BU) e Registros Digitais do Voto (RDV) para checagem estatística dos resultados nacionais.',
      resultado: 'Os boletins impressos afixados nas seções coincidem com a base totalizada, reiterando que a principal vulnerabilidade reside na falta de contraprova física para o eleitor.',
      fontes: [
        { titulo: 'Boletins de urna impressos coincidem com totalização, mas ausência de voto físico limita conferência', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/boletins-urna-totalizacao-tse-voto-impresso/' },
        { titulo: 'Especialistas analisam logs das urnas e reforçam necessidade de mais transparência externa', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/tecnologia/especialistas-analisam-logs-urnas-transparencia/' }
      ]
    },
    {
      agente: 'Monitoramento de Censura e Bloqueios Judiciais no Pleito',
      tipo: 'Investigação de liberdades públicas',
      status: 'critica',
      oQueFez: 'Documentação dos pedidos e determinações de bloqueio de contas em redes sociais, desmonetizações e ordens sigilosas impostas a veículos e comunicadores conservadores.',
      resultado: 'A atuação judicial gerou desequilíbrio e forte repercussão internacional, inclusive com relatórios no Comitê Judiciário do Congresso dos Estados Unidos.',
      fontes: [
        { titulo: 'Comitê do Congresso dos EUA expõe documentos de censura prévia imposta pelo TSE a redes e jornalistas', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/mundo/congresso-dos-eua-expoe-censura-do-tse/' },
        { titulo: 'O cerco à liberdade de expressão e as decisões do TSE nas eleições', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/voz-do-leitor/cerco-liberdade-expressao-tse/' }
      ]
    },
    {
      agente: 'Defesa e Tramitação da PEC do Voto Impresso Auditável',
      tipo: 'Proposição legislativa e transparência',
      status: 'critica',
      oQueFez: 'Acompanhamento do debate no Congresso Nacional sobre a necessidade de adoção de impressora acoplada à urna para conferência física pelo cidadão.',
      resultado: 'Apesar de aprovada em comissão no Senado com amplo apoio de especialistas independentes, a medida enfrentou resistência histórica da cúpula do tribunal eleitoral.',
      fontes: [
        { titulo: 'Por que o voto impresso auditável é defendido por especialistas como padrão internacional', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/voto-impresso-auditavel-padrao-internacional/' },
        { titulo: 'Avanço da PEC do Voto Impresso expõe confronto entre Congresso e ativismo judicial', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/avanco-pec-voto-impresso-confronto-congresso-stf/' }
      ]
    }
  ],

  /** Alegações que circularam e as apurações dos veículos de direita */
  alegacoes: [
    {
      alegacao: 'A prorrogação da votação após o horário legal por ordem de um único ministro quebrou a isonomia',
      origem: 'Bancada conservadora e juristas',
      veredito: 'parcial',
      rotulo: 'Crítica fundamentada com respaldo jurídico',
      explicacao: 'A decisão foi expedida monocraticamente e comunicada formalmente após as 17h, contrariando a praxe histórica. Documentos e análises mostram que cerca de 34 mil votos ocorreram após o horário padrão, gerando severa crise institucional de confiança.',
      fontes: [
        { titulo: 'A decisão de prorrogar o pleito e seus impactos na segurança jurídica da eleição', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/decisao-prorrogacao-pleito-seguranca-juridica/' },
        { titulo: 'Oposição protocola questionamento formal sobre prorrogação monocrática da eleição', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/politica/oposicao-questiona-prorrogacao-eleicao-tse/' }
      ]
    },
    {
      alegacao: 'Decisões monocráticas do TSE desmonetizaram e bloquearam conteúdos conservadores sem o devido processo legal',
      origem: 'Revista Oeste, Gazeta do Povo e parlamentares',
      veredito: 'parcial',
      rotulo: 'Comprovado por relatórios e atos judiciais',
      explicacao: 'Ordens de remoção sumária, bloqueio de perfis em redes sociais e restrições a menções sobre temas públicos atingiram de forma assimétrica a comunicação da direita durante todo o processo eleitoral.',
      fontes: [
        { titulo: 'Folha de S.Paulo denuncia falta de controle sobre censura no TSE', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/imprensa/emfolha-de-s-paulo-em-denuncia-falta-de-controle-sobre-censura-no-tse/' },
        { titulo: 'TSE impõe restrições severas ao debate público e atinge veículos independentes', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/politica/tse-restricoes-debate-publico-imprensa/' }
      ]
    },
    {
      alegacao: 'O sistema 100% digital não permite que o cidadão audite materialmente o seu voto em papel',
      origem: 'Especialistas em segurança da informação e juristas',
      veredito: 'ok',
      rotulo: 'Fato incontestável do modelo atual',
      explicacao: 'O Brasil permanece como um dos raros países com sistema puramente eletrônico de 1ª geração sem comprovante físico para recontagem pública por amostragem em urna transparente.',
      fontes: [
        { titulo: 'O que diz o parecer da PEC do voto impresso e como ele contrapõe o TSE', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/parecer-pec-voto-impresso-auditavel-tse/' },
        { titulo: 'EUA apontam censura do TSE em nova trava do X para 2026', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/mundo/eua-apontam-censura-do-tse-em-nova-trava-do-x-para-2026/' }
      ]
    },
    {
      alegacao: 'Candidato da oposição declinou de debate na TV devido a ambiente de censura prévia',
      origem: 'Campanha de Flávio Bolsonaro',
      veredito: 'ok',
      rotulo: 'Fato documentado',
      explicacao: 'A campanha apontou risco iminente de punições e multas do tribunal eleitoral por manifestações políticas legítimas durante debates televisivos com regras restritivas.',
      fontes: [
        { titulo: 'Flávio fala em censura do TSE e desiste de debate da TV Globo', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/eleicoes/2026/flavio-bolsonaro-desiste-de-participar-de-debate-da-tv-globo/' },
        { titulo: 'TSE proíbe impulsionamento de críticas no período pré-eleitoral', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/tse-proibe-impulsionamento-de-criticas-no-periodo-pre-eleitoral/' }
      ]
    },
    {
      alegacao: 'Lideranças conservadoras reconhecem os números oficiais sem abdicar da denúncia dos excessos judiciais',
      origem: 'Governador Tarcísio de Freitas e bancadas do Congresso',
      veredito: 'ok',
      rotulo: 'Posição consolidada da oposição',
      explicacao: 'A liderança da oposição definiu que respeitar a proclamação das urnas não invalida a necessidade de denunciar os abusos institucionais do tribunal e aprovar reformas eleitorais estruturais no Congresso.',
      fontes: [
        { titulo: 'Reconhecer eleição não significa calar sobre excessos, afirma Tarcísio', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/reconhecer-eleicao-nao-significa-calar-sobre-excessos-afirma-tarcisio/' },
        { titulo: 'Lideranças conservadoras focam atuação no Congresso para conter avanço do Judiciário', veiculo: 'Jovem Pan News', url: 'https://jovempan.com.br/noticias/politica/liderancas-conservadoras-focam-atuacao-congresso-judiciario.html' }
      ]
    }
  ],

  /**
   * "O caso contra o TSE": a fundamentação da oposição e dos veículos de direita,
   * separando as críticas à conduta institucional (com respaldo documental)
   * de teses sobre manipulação física de urnas (sem respaldo nos boletins impressos).
   */
  casoContraTse: {
    resumo: 'Há farta base documental para criticar a atuação institucional do TSE: decisões monocráticas de exceção, censura prévia opaca a comunicadores de direita, prorrogação de votação fora do horário legal e recusa histórica ao voto impresso auditável. Na apuração matemática dos boletins de urna (BUs) impressos, os números batem com a totalização, evidenciando que a contestação legítima reside no ativismo institucional do tribunal.',
    comRespaldo: [
      {
        titulo: 'A prorrogação até as 19h foi irregular e inédita',
        explicacao: 'A decisão foi expedida monocraticamente por ministro do STF em horário posterior ao fechamento oficial das urnas, usurpando competências regulamentares e gerando desconfiança legítima na condução do pleito.',
        fontes: [
          { titulo: 'Decisão monocrática que prorrogou votação fere regras eleitorais e gera contestação', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/decisao-monocratica-prorrogacao-votacao-fere-regras/' },
          { titulo: 'Juristas apontam precedente perigoso em prorrogação de votação por ordem individual', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/politica/juristas-criticam-prorrogacao-votacao-stf/' }
        ]
      },
      {
        titulo: 'Decisões monocráticas contraditórias e ativismo judicial',
        explicacao: 'O número de ações judiciais de campanha cresceu significativamente, com ministros emitindo ordens individuais contraditórias que geraram instabilidade nas regras do jogo eleitoral.',
        fontes: [
          { titulo: 'TSE impõe restrições severas ao debate público e atinge veículos independentes', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/politica/tse-restricoes-debate-publico-imprensa/' },
          { titulo: 'Lideranças conservadoras focam atuação no Congresso para conter avanço do Judiciário', veiculo: 'Jovem Pan News', url: 'https://jovempan.com.br/noticias/politica/liderancas-conservadoras-focam-atuacao-congresso-judiciario.html' }
        ]
      },
      {
        titulo: 'Moderação de conteúdo sem transparência e cerco à liberdade',
        explicacao: 'O tribunal não divulgou métricas claras sobre perfis e postagens desmonetizados e derrubados. O Congresso dos EUA apontou restrições à liberdade de expressão em ordens judiciais emitidas contra plataformas digitais.',
        fontes: [
          { titulo: 'Folha de S.Paulo denuncia falta de controle sobre censura no TSE', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/imprensa/emfolha-de-s-paulo-em-denuncia-falta-de-controle-sobre-censura-no-tse/' },
          { titulo: 'EUA apontam censura do TSE em nova trava do X para 2026', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/mundo/eua-apontam-censura-do-tse-em-nova-trava-do-x-para-2026/' },
          { titulo: 'TSE proíbe impulsionamento de críticas no período pré-eleitoral', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/tse-proibe-impulsionamento-de-criticas-no-periodo-pre-eleitoral/' },
          { titulo: 'Flávio fala em censura do TSE e desiste de debate da TV Globo', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/eleicoes/2026/flavio-bolsonaro-desiste-de-participar-de-debate-da-tv-globo/' }
        ]
      },
      {
        titulo: 'O eleitor tem pouca forma de auditar o próprio voto',
        explicacao: 'A ausência do comprovante físico impresso impede que o próprio cidadão verifique se seu voto foi registrado com fidelidade na urna, distanciando o Brasil dos padrões de auditoria independente adotados por democracias ocidentais.',
        fontes: [
          { titulo: 'O que diz o parecer da PEC do voto impresso e como ele contrapõe o TSE', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/parecer-pec-voto-impresso-auditavel-tse/' },
          { titulo: 'Aprovado na CCJ do Senado, voto impresso pode valer em 2026?', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/oposicao-tenta-avancar-com-projeto-do-voto-impresso-apesar-de-tempo-limitado-e-pressao-do-stf/' }
        ]
      },
      {
        titulo: 'Falhas de comunicação, instabilidade técnica e republicação de arquivos',
        explicacao: 'A paralisação temporária na divulgação da apuração no 1º turno e a republicação de arquivos de votação sem esclarecimento imediato geraram desconfiança pública, apontada por analistas como grave deficit de transparência.',
        fontes: [
          { titulo: 'Especialistas analisam logs das urnas e reforçam necessidade de mais transparência externa', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/tecnologia/especialistas-analisam-logs-urnas-transparencia/' },
          { titulo: 'Oposição cobra explicações sobre instabilidade nos sistemas de divulgação do TSE', veiculo: 'Jovem Pan News', url: 'https://jovempan.com.br/noticias/politica/oposicao-cobra-explicacoes-instabilidade-tse.html' }
        ]
      }
    ],
    semRespaldo: [
      {
        titulo: 'Alegações de fraude na contagem física dos boletins de urna',
        explicacao: 'Os boletins de urna (BUs) impressos em cada uma das seções eleitorais do país conferem rigorosamente com a soma oficial do tribunal. Como destacou o governador Tarcísio de Freitas, o foco da oposição deve ser no combate aos excessos judiciais comprovados.',
        fontes: [
          { titulo: 'Reconhecer eleição não significa calar sobre excessos, afirma Tarcísio', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/reconhecer-eleicao-nao-significa-calar-sobre-excessos-afirma-tarcisio/' },
          { titulo: 'Boletins de urna impressos coincidem com totalização, mas ausência de voto físico limita conferência', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/boletins-urna-totalizacao-tse-voto-impresso/' }
        ]
      },
      {
        titulo: '"Mais de 10 milhões de votos para Lula entre os turnos é matematicamente impossível"',
        explicacao: 'A conta fecha quando analisada nos dados oficiais do TSE: veja na tabela ao lado a estimativa urna a urna de onde vieram os votos disputados no 2º turno.',
        migracao: true,
        fontes: [
          { titulo: 'Análise detalhada da migração de votos e comparecimento no segundo turno eleitoral', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/eleicoes/analise-migracao-votos-segundo-turno/' },
          { titulo: 'Especialistas analisam logs das urnas e reforçam necessidade de mais transparência externa', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/tecnologia/especialistas-analisam-logs-urnas-transparencia/' }
        ]
      },
      {
        titulo: 'Expulsão física de fiscais durante a apuração',
        explicacao: 'A sala-cofre dos computadores de totalização do TSE não permite acesso externo por protocolo de segurança; fiscais de partidos acompanharam a apuração nas salas de Totalização e dos Partidos.',
        fontes: [
          { titulo: 'Auditores e fiscais partidários concluem acompanhamento do teste das urnas', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/auditores-e-fiscais-partidarios-concluem-acompanhamento-do-teste-das-urnas/' }
        ]
      }
    ]
  },

  /** Contexto para os pontos que a auditoria dos dados encontrou */
  contexto: {
    candidatoRenuncia: {
      nome: 'Leonardo Avalanche (PRTB, 28)',
      texto: 'Situação de registro e totalização: renúncia comunicada após a carga das urnas eletrônicas.',
      fontes: [
        { titulo: 'TSE registra renúncia de candidatura e esclarece cômputo de votos nulos nas urnas', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/eleicoes/tse-renuncia-candidatura-votos/' }
      ]
    },
    votoEmTransito: {
      texto: 'O voto em trânsito mobilizou mais de 314 mil eleitores cadastrados para o 2º turno em seções de trânsito em grandes capitais.',
      fontes: [
        { titulo: 'Voto em trânsito mobiliza centenas de milhares de eleitores no segundo turno', veiculo: 'Jovem Pan News', url: 'https://jovempan.com.br/noticias/politica/voto-em-transito-mobiliza-eleitores-segundo-turno.html' }
      ]
    }
  },

  /** Portais de jornalismo independente e dados oficiais para conferência */
  confira: [
    { titulo: 'Revista Oeste — Política e Liberdades', descricao: 'Reportagens investigativas, análises sobre ativismo judicial e cobertura das liberdades públicas.', url: 'https://revistaoeste.com/politica/' },
    { titulo: 'Gazeta do Povo — República e Voto Auditável', descricao: 'Artigos técnicos, pareceres constitucionais e acompanhamento de propostas eleitorais no Congresso.', url: 'https://www.gazetadopovo.com.br/republica/' },
    { titulo: 'Jovem Pan News — Notícias de Política', descricao: 'Acompanhamento do Congresso Nacional, debates e fiscalização dos poderes da República.', url: 'https://jovempan.com.br/noticias/politica' },
    { titulo: 'Portal de Dados Abertos do TSE', descricao: 'Arquivos brutos de Boletins de Urna e Registros Digitais do Voto (RDV) para auditoria cidadã.', url: 'https://dadosabertos.tse.jus.br' }
  ]
});
