/**
 * Notícias e verificações sobre a integridade da eleição presidencial de 2026 (aba "Notícias").
 * Conteúdo curado à mão, com a fonte de cada afirmação. Os números da auditoria dos dados
 * vêm de AuditoriaData.js (gerado por scripts/build_auditoria.py), não daqui.
 * Ao acrescentar um item: título curto, resultado em uma frase, e pelo menos uma fonte com link.
 */

/** @typedef {{ titulo: string, url: string, veiculo: string, data?: string }} Fonte */

export const NOTICIAS = Object.freeze({
  atualizadoEm: '28/10/2026',

  /** Quem verificou a eleição e o que concluiu */
  verificacoes: [
    {
      agente: 'TSE: Teste de Integridade',
      tipo: 'Auditoria oficial',
      status: 'ok',
      oQueFez: 'Votação paralela no dia da eleição: urnas sorteadas recebem votos de cédulas de papel, na frente de testemunhas, e o resultado é comparado com as cédulas. Feito nos dois turnos, em todas as unidades da federação.',
      resultado: 'Nenhuma divergência nos dois turnos. No TSE, 389 votos conferidos no 2º turno. Desde 2002 o teste nunca registrou divergência.',
      fontes: [
        { titulo: 'Teste de Integridade do 2º turno confirma correspondência entre cédulas e votos', veiculo: 'TSE', url: 'https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/teste-de-integridade-do-2o-turno-no-tse-confirma-correspondencia-entre-cedulas-e-votos-nas-urnas' },
        { titulo: 'Teste de Integridade confirma correspondência entre cédulas e votos (1º turno)', veiculo: 'TSE', url: 'https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/teste-de-integridade-no-tse-confirma-correspondencia-entre-cedulas-e-votos-registrados-nas-urnas' }
      ]
    },
    {
      agente: 'TREs (São Paulo, Alagoas e demais estados)',
      tipo: 'Auditoria oficial',
      status: 'ok',
      oQueFez: 'Cada tribunal regional repete o Teste de Integridade com urnas do próprio estado. O TRE-SP testou 33 urnas no 1º turno; o TRE-AL auditou 23 urnas de vários municípios no 2º.',
      resultado: 'Sem divergências entre cédulas e urnas.',
      fontes: [
        { titulo: 'Teste de Integridade das urnas no 2º turno é concluído sem divergências em São Paulo', veiculo: 'TRE-SP', url: 'https://www.tre-sp.jus.br/comunicacao/noticias/2026/Outubro/teste-de-integridade-das-urnas-no-2o-turno-e-concluido-sem-divergencias-em-sao-paulo' },
        { titulo: 'Teste de Integridade confirma pleno funcionamento das urnas eletrônicas', veiculo: 'TRE-SP', url: 'https://www.tre-sp.jus.br/comunicacao/noticias/2026/Outubro/eleicoes-2026-teste-de-integridade-confirma-pleno-funcionamento-das-urnas-eletronicas' },
        { titulo: 'TRE/AL realiza auditorias em 23 urnas eletrônicas durante o segundo turno', veiculo: 'Tribuna do Sertão', data: '27/10/2026', url: 'https://www.tribunadosertao.com.br/politica/2026/10/27/1007210-treal-realiza-auditorias-em-23-urnas-eletronicas-durante-o-segundo-turno-das-eleicoes-2026' }
      ]
    },
    {
      agente: 'TCU',
      tipo: 'Órgão de controle',
      status: 'ok',
      oQueFez: 'Acompanhou os Testes de Integridade nas 27 unidades da federação no 1º turno e nos estados com 2º turno.',
      resultado: 'Os testes acompanhados terminaram sem divergência.',
      fontes: [
        { titulo: 'Eleições de 2026 terão acompanhamento do TCU nos Testes de Integridade', veiculo: 'TSE', url: 'https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/eleicoes-de-2026-terao-acompanhamento-do-tcu-nos-testes-de-integridade-das-urnas-eletronicas' }
      ]
    },
    {
      agente: 'Ministério Público Eleitoral e partidos',
      tipo: 'Inspeção do código-fonte',
      status: 'ok',
      oQueFez: 'O código-fonte da urna e dos sistemas ficou aberto às entidades fiscalizadoras desde outubro de 2025. O MP Eleitoral concluiu a inspeção em agosto; o União Brasil foi o primeiro partido a inspecionar, em maio.',
      resultado: 'Inspeções concluídas antes da lacração dos sistemas, sem apontamento de falha divulgado nas fontes encontradas.',
      fontes: [
        { titulo: 'MP Eleitoral conclui inspeção nos códigos-fonte da urna eletrônica', veiculo: 'MPF', url: 'https://www.mpf.mp.br/o-mpf/unidades/procuradoria-geral-da-republica-pgr/noticias/mp-eleitoral-realiza-inspecao-nos-codigos-fonte-da-urna-eletronica-e-sistemas-utilizados-nas-eleicoes-2026' },
        { titulo: 'União Brasil é o 1º partido a inspecionar códigos-fonte dos sistemas', veiculo: 'TSE', url: 'https://www.tse.jus.br/comunicacao/noticias/2026/Maio/uniao-brasil-e-o-1o-partido-a-inspecionar-codigos-fonte-dos-sistemas-das-eleicoes-2026' }
      ]
    },
    {
      agente: 'Missão de Observação Eleitoral da OEA',
      tipo: 'Observação internacional',
      status: 'critica',
      oQueFez: '88 observadores de 22 nacionalidades no 2º turno, em 21 estados, no DF e em 5 cidades no exterior (179 nas eleições gerais, a maior missão já feita no Brasil). Acompanharam a lacração das urnas, o sorteio do Teste de Integridade e a conferência dos hashes dos sistemas.',
      resultado: 'Os resultados do TSE "coincidem com as informações coletadas em campo" e a missão "não tem dúvidas quanto à integridade dos dados oficiais". Crítica: a prorrogação até as 19h por decisão individual de um ministro do STF foi "situação inédita" que gerou confusão e não deve se repetir. 1.551 urnas substituídas (0,28%); nenhuma seção precisou de votação manual.',
      fontes: [
        { titulo: 'Relatório preliminar da MOE/OEA para o segundo turno', veiculo: 'OEA', data: '27/10/2026', url: 'http://www.oas.org/fpdb/press/2026_MOE_Brasil_Segundo_Turno_Relatorio_Preliminar_POR.pdf' }
      ]
    },
    {
      agente: 'Análises independentes dos logs das urnas',
      tipo: 'Imprensa e analistas',
      status: 'ok',
      oQueFez: 'Contagem, nos registros (logs) públicos das urnas, dos votos dados depois das 17h, quando a votação foi prorrogada.',
      resultado: 'Entre 34,3 mil e 35,5 mil votos depois das 17h, conforme o recorte (TSE: 34.393; TV Globo: 35.521; contagem independente: 34.330). Menos de 1% da margem de 4,43 milhões: mesmo que todos fossem para um só candidato, o resultado não mudaria.',
      fontes: [
        { titulo: 'Eleições 2026: 35 mil votos foram registrados após as 17h', veiculo: 'DOL', url: 'https://dol.com.br/noticias/politica/eleicoes-2026/966566/eleicoes-2026-35-mil-votos-foram-registrados-apos-as-17h' },
        { titulo: 'Só 0,03% dos votos foram registrados após as 17h no 2º turno', veiculo: 'Revista Fórum', url: 'https://revistaforum.com.br/politica/votos-apos-as-17h-segundo-turno/' },
        { titulo: 'Prorrogação até as 19h não permitiu fraude nem alterou resultado', veiculo: 'NSC Total', url: 'https://nsctotal.com.br/politica/prorrogacao-da-votacao-ate-as-19h-nao-permitiu-fraude-eleitoral-nem-alterou-resultado-das-eleicoes-entenda' }
      ]
    },
    {
      agente: 'Agências de checagem',
      tipo: 'Jornalismo de verificação',
      status: 'ok',
      oQueFez: 'Aos Fatos, Lupa, Fato ou Boato (Justiça Eleitoral), Boatos.org, Gazeta do Paraná e Gizmodo checaram as alegações que circularam depois de cada turno.',
      resultado: 'Nenhuma alegação de fraude foi comprovada. As principais estão na seção "Alegações e o que se verificou".',
      fontes: [
        { titulo: 'Urnas eletrônicas voltam a ser alvo de desinformação em 2026', veiculo: 'Lupa', data: '04/10/2026', url: 'https://www.agencialupa.org/jornalismo/2026/10/04/urnas-eletronicas-voltam-a-ser-alvo-de-desinformacao-em-2026/' },
        { titulo: 'Fake news pós-eleições: 11 boatos sobre fraude nas urnas', veiculo: 'Gazeta do Paraná', url: 'https://gazetadoparana.com.br/publico/fake-news-pos-eleicoes-gazeta-checa-11-boatos-sobre-fraude-nas-urnas-prisoes-e-comemoracoes-de' },
        { titulo: 'Flávio Bolsonaro denuncia fraude, mas documentos e números do TSE contradizem', veiculo: 'Gizmodo', url: 'https://www.gizmodo.com.br/flavio-bolsonaro-denuncia-fraude-nas-eleicoes-mas-documentos-e-numeros-do-tse-contradizem-acusacoes-72928' }
      ]
    }
  ],

  /** Alegações que circularam e o que as verificações encontraram */
  alegacoes: [
    {
      alegacao: '"Houve fraude no 2º turno" e Flávio Bolsonaro seria o "verdadeiro presidente eleito"',
      origem: 'Carta de Flávio Bolsonaro, 28/10',
      veredito: 'sem-prova',
      rotulo: 'Sem prova',
      explicacao: 'A carta não apresenta dado técnico. Testes de integridade, observadores da OEA e checagens não encontraram fraude, e a auditoria deste painel nos arquivos do TSE também não.',
      fontes: [
        { titulo: 'Em carta, Flávio se declara "verdadeiro presidente eleito do Brasil"', veiculo: 'Metrópoles', data: '28/10/2026', url: 'https://www.metropoles.com/mundo/em-carta-flavio-se-declara-verdadeiro-presidente-eleito-do-brasil' },
        { titulo: 'Derrotado, Flávio mente ao sugerir que eleição foi fraudada', veiculo: 'Aos Fatos', data: '26/10/2026', url: 'https://www.aosfatos.org/noticias/derrotado-flavio-mente-sugerir-eleicao-fraudada/' }
      ]
    },
    {
      alegacao: 'A prorrogação da votação até as 19h mudou as regras para favorecer Lula',
      origem: 'Flávio Bolsonaro e campanha do PL',
      veredito: 'parcial',
      rotulo: 'Em parte verdadeiro, sem efeito no resultado',
      explicacao: 'É verdade que a prorrogação foi inédita, decidida individualmente pelo ministro Cristiano Zanin (STF) depois do horário de encerramento, e criticada pela OEA e pelo próprio presidente do TSE. É falso que só a campanha de Lula pediu: o PL pediu prorrogação ao TSE às 15h27 e às 15h42 (SP, PR, SC, MG e RS). Foram cerca de 34 mil votos depois das 17h, menos de 1% da margem.',
      fontes: [
        { titulo: 'Flávio critica decisão de Zanin, mas PL também pediu prorrogação da votação', veiculo: 'Metrópoles', url: 'https://www.metropoles.com/brasil/flavio-critica-decisao-de-zanin-mas-pl-tambem-pediu-prorrogacao-da-votacao' },
        { titulo: 'Derrotado, Flávio mente ao sugerir que eleição foi fraudada', veiculo: 'Aos Fatos', data: '26/10/2026', url: 'https://www.aosfatos.org/noticias/derrotado-flavio-mente-sugerir-eleicao-fraudada/' },
        { titulo: 'Relatório preliminar da MOE/OEA para o segundo turno', veiculo: 'OEA', data: '27/10/2026', url: 'http://www.oas.org/fpdb/press/2026_MOE_Brasil_Segundo_Turno_Relatorio_Preliminar_POR.pdf' }
      ]
    },
    {
      alegacao: 'Fiscais do PL foram retirados da sala-cofre do TSE durante a apuração',
      origem: 'Flávio Bolsonaro',
      veredito: 'falso',
      rotulo: 'Falso',
      explicacao: 'A sala-cofre, onde ficam os computadores da totalização, não é aberta a ninguém de fora. Os fiscais do PL acompanharam a apuração nas salas de Totalização e dos Partidos; o TSE diz ter imagens do acesso.',
      fontes: [
        { titulo: 'Derrotado, Flávio mente ao sugerir que eleição foi fraudada', veiculo: 'Aos Fatos', data: '26/10/2026', url: 'https://www.aosfatos.org/noticias/derrotado-flavio-mente-sugerir-eleicao-fraudada/' }
      ]
    },
    {
      alegacao: 'A pausa no painel de resultados do 1º turno serviu para fraudar a apuração',
      origem: 'Redes sociais',
      veredito: 'falso',
      rotulo: 'Falso',
      explicacao: 'Parou a divulgação no site, por excesso de acesso, não a apuração. Os boletins de cada urna já tinham sido impressos e afixados nas seções.',
      fontes: [
        { titulo: 'É falso que a interrupção na divulgação dos resultados tenha fraudado o 1º turno', veiculo: 'Justiça Eleitoral: Fato ou Boato', url: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/checagens/2026/e-falso-que-a-interrupcao-na-divulgacao-dos-resultados-tenha-fraudado-o-resultado-do-1o-turno-para-presidente' },
        { titulo: 'TSE desmente alegação de fraude na apuração dos votos', veiculo: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/tse-desmente-alegacao-de-fraude-na-apuracao-dos-votos' }
      ]
    },
    {
      alegacao: 'A soma de três seções de Teixeira de Freitas (BA) comprova fraude',
      origem: 'Vídeo nas redes sociais',
      veredito: 'falso',
      rotulo: 'Enganoso',
      explicacao: 'A conta ignora que a cidade tem 342 seções; três seções isoladas não representam o município.',
      fontes: [
        { titulo: 'Soma de votos de três seções eleitorais na BA não comprova fraude', veiculo: 'Aos Fatos', url: 'https://www.aosfatos.org/noticias/soma-votos-tres-secoes-ba-nao-comprova-fraude/' }
      ]
    },
    {
      alegacao: 'O PL vai anular a eleição na Justiça',
      origem: 'Flávio Bolsonaro, 25/10',
      veredito: 'pendente',
      rotulo: 'Anunciado, sem decisão até 28/10',
      explicacao: 'O pedido foi anunciado. Especialistas ouvidos pela imprensa avaliam que não tem amparo no Código Eleitoral, cujo artigo 219, parágrafo único, impede que a nulidade seja pedida por quem lhe deu causa (o PL também pediu prorrogação).',
      fontes: [
        { titulo: 'O (impossível) pedido de anulação do segundo turno', veiculo: 'Consultor Jurídico', data: '26/10/2026', url: 'https://conjur.com.br/2026-out-26/o-impossivel-pedido-de-anulacao-do-segundo-turno/' },
        { titulo: 'Sem amparo legal, pedido de Flávio para anular eleição não deve prosperar', veiculo: 'Brasil de Fato', data: '26/10/2026', url: 'https://www.brasildefato.com.br/2026/10/26/sem-amparo-legal-pedido-de-flavio-bolsonaro-para-anular-eleicao-nao-deve-prosperar/' },
        { titulo: 'Flávio não aceita derrota e diz que pedirá a anulação do resultado', veiculo: 'Poder360', url: 'https://www.poder360.com.br/poder-eleicoes-2026/flavio-nao-aceita-derrota-e-diz-que-pedira-a-anulacao-do-resultado/' }
      ]
    }
  ],

  /**
   * "O caso contra o TSE": o argumento mais forte da direita, separando críticas à instituição
   * (com respaldo documental) de alegações sobre a contagem dos votos (sem respaldo).
   */
  casoContraTse: {
    resumo: 'Há base séria para desconfiar do TSE como poder: decisões individuais, moderação de conteúdo opaca, uma prorrogação sem precedente e pouca transparência na comunicação. Não há base para desconfiar da contagem: testes de integridade, observadores, boletins de urna e a auditoria deste painel chegam à mesma margem.',
    comRespaldo: [
      {
        titulo: 'A prorrogação até as 19h foi irregular e inédita',
        explicacao: 'O ministro Cristiano Zanin (STF) decidiu sozinho, por cima da competência do TSE, e a ordem chegou depois do fim do horário legal. A OEA chamou de "situação inédita" que gerou confusão e pediu que não se repita; o próprio presidente do TSE disse que "nunca houve prorrogação" e que ela poderia ter comprometido a eleição. Ressalva: o PL também pediu prorrogação, e foram cerca de 34 mil votos depois das 17h.',
        fontes: [
          { titulo: 'Relatório preliminar da MOE/OEA para o segundo turno', veiculo: 'OEA', data: '27/10/2026', url: 'http://www.oas.org/fpdb/press/2026_MOE_Brasil_Segundo_Turno_Relatorio_Preliminar_POR.pdf' },
          { titulo: 'O (impossível) pedido de anulação do segundo turno', veiculo: 'Consultor Jurídico', data: '26/10/2026', url: 'https://conjur.com.br/2026-out-26/o-impossivel-pedido-de-anulacao-do-segundo-turno/' }
        ]
      },
      {
        titulo: 'Decisões individuais demais, e contraditórias',
        explicacao: 'Foram 1.071 ações entre as duas campanhas, 75% a mais que em 2022 (dado do presidente do TSE citado pela OEA). Houve decisões de um só ministro desfeitas por outro: o canal pró-Lula derrubado por ordem do presidente do TSE foi liberado pelo corregedor. A OEA aponta a tensão entre liminares imediatas e revisão colegiada.',
        fontes: [
          { titulo: 'Relatório preliminar da MOE/OEA para o segundo turno', veiculo: 'OEA', data: '27/10/2026', url: 'http://www.oas.org/fpdb/press/2026_MOE_Brasil_Segundo_Turno_Relatorio_Preliminar_POR.pdf' },
          { titulo: 'Entre censura e omissão: o papel do TSE e da mídia na campanha de 2026', veiculo: 'Plantão Brasil', url: 'https://www.plantaobrasil.net/noticias/10-entre-censura-e-omissao-o-papel-do-tse-e-da-midia-na-campanha-de-2026' }
        ]
      },
      {
        titulo: 'Moderação de conteúdo sem transparência',
        explicacao: 'O TSE não tem dados de quantas contas e postagens mandou bloquear desde 2022 (editorial da Folha). O Departamento de Estado dos EUA chamou de censura as exigências feitas ao X para 2026. O TSE retirou das regras finais a permissão de impulsionar críticas a governos antes da campanha. Flávio Bolsonaro desistiu de um debate citando "censura" do TSE.',
        fontes: [
          { titulo: 'Folha de S.Paulo denuncia falta de controle sobre censura no TSE', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/imprensa/emfolha-de-s-paulo-em-denuncia-falta-de-controle-sobre-censura-no-tse/' },
          { titulo: 'EUA apontam censura do TSE em nova trava do X para 2026', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/mundo/eua-apontam-censura-do-tse-em-nova-trava-do-x-para-2026/' },
          { titulo: 'TSE proíbe impulsionamento de críticas no período pré-eleitoral', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/tse-proibe-impulsionamento-de-criticas-no-periodo-pre-eleitoral/' },
          { titulo: 'Flávio fala em censura do TSE e desiste de debate da TV Globo', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/eleicoes/2026/flavio-bolsonaro-desiste-de-participar-de-debate-da-tv-globo/' }
        ]
      },
      {
        titulo: 'O eleitor tem pouca forma de auditar o próprio voto',
        explicacao: 'Não há voto impresso. O TSE não acatou as sugestões de voto impresso e contagem manual na audiência pública das regras de 2026, e a emenda aprovada na CCJ do Senado não valeu para esta eleição. Especialista ouvido pela Gazeta do Povo diz que o sistema precisa de mais auditabilidade. Ressalva: existem o registro digital do voto, o boletim impresso em cada seção e o teste de integridade.',
        fontes: [
          { titulo: 'Análise das sugestões às resoluções das Eleições 2026', veiculo: 'TSE', url: 'https://www.tse.jus.br/servicos-judiciais/audiencias-publicas/arquivos/minutas-das-resolucoes-2026/analise-das-sugestoes/sre_atos-gerais-eleicoes-2026_versao-web-2/@@display-file/file/sre_atos-gerais-eleicoes-2026_versao-web-2.pdf' },
          { titulo: 'O que diz o parecer da PEC do voto impresso e como ele contrapõe o TSE', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/parecer-pec-voto-impresso-auditavel-tse/' },
          { titulo: 'Aprovado na CCJ do Senado, voto impresso pode valer em 2026?', veiculo: 'Gazeta do Povo', url: 'https://www.gazetadopovo.com.br/republica/oposicao-tenta-avancar-com-projeto-do-voto-impresso-apesar-de-tempo-limitado-e-pressao-do-stf/' }
        ]
      },
      {
        titulo: 'Falhas de comunicação e dados republicados sem aviso',
        explicacao: 'O painel de resultados parou por quase uma hora no 1º turno. O arquivo de votos por zona foi republicado em 28/10 com 5.246 votos a menos no 1º turno, sem nota explicando (a razão, encontrada por esta auditoria, é a renúncia de um candidato). 1.551 urnas foram substituídas no 2º turno. Nada disso muda votos, mas alimenta a desconfiança.',
        fontes: [
          { titulo: 'TSE explica falha na divulgação dos votos e nega suspeita de fraude', veiculo: 'Brasil 247', url: 'https://www.brasil247.com/brasil/tse-explica-falha-na-divulgacao-dos-votos-nega-suspeita-de-fraude-e-prepara-alteracoes-para-2o-turno' },
          { titulo: 'Relatório preliminar da MOE/OEA para o segundo turno', veiculo: 'OEA', data: '27/10/2026', url: 'http://www.oas.org/fpdb/press/2026_MOE_Brasil_Segundo_Turno_Relatorio_Preliminar_POR.pdf' }
        ]
      }
    ],
    semRespaldo: [
      {
        titulo: '"Houve fraude e Flávio é o verdadeiro presidente eleito"',
        explicacao: 'A carta de 28/10 não anexa documento, processo, boletim de urna ou dado oficial. O próprio PL, o candidato a vice Alfredo Gaspar e Tarcísio de Freitas reconheceram o resultado ("reconhecer o resultado não significa calar sobre os excessos").',
        fontes: [
          { titulo: 'Veja íntegra de carta assinada por Flávio Bolsonaro', veiculo: 'Metrópoles', data: '28/10/2026', url: 'https://www.metropoles.com/brasil/veja-integra-de-carta-assinada-por-flavio-bolsonaro-apos-fugir-do-brasil' },
          { titulo: 'Reconhecer eleição não significa calar sobre excessos, afirma Tarcísio', veiculo: 'Revista Oeste', url: 'https://revistaoeste.com/politica/reconhecer-eleicao-nao-significa-calar-sobre-excessos-afirma-tarcisio/' }
        ]
      },
      {
        titulo: '"Mais de 10 milhões de votos para Lula entre os turnos é matematicamente impossível"',
        explicacao: 'A conta fecha com os dados do TSE: veja ao lado de onde vieram os votos.',
        migracao: true,
        fontes: [
          { titulo: 'Veja íntegra de carta assinada por Flávio Bolsonaro', veiculo: 'Metrópoles', data: '28/10/2026', url: 'https://www.metropoles.com/brasil/veja-integra-de-carta-assinada-por-flavio-bolsonaro-apos-fugir-do-brasil' }
        ]
      },
      {
        titulo: '"O tribunal está aparelhado pelo PT"',
        explicacao: 'O presidente do TSE em 2026, Kassio Nunes Marques, foi indicado por Jair Bolsonaro. Desde janeiro, o TSE deu ao menos 36 decisões atendendo pedidos da campanha de Flávio para remover conteúdo de adversários.',
        fontes: [
          { titulo: 'Flávio Bolsonaro promete direito de criticar, mas aciona TSE contra opositores', veiculo: 'Lupa', data: '30/09/2026', url: 'https://www.agencialupa.org/jornalismo/2026/09/30/flavio-bolsonaro-promete-direito-de-criticar-mas-aciona-tse-contra-opositores/' }
        ]
      },
      {
        titulo: '"Fiscais do PL foram expulsos da sala-cofre"',
        explicacao: 'Ninguém de fora entra na sala-cofre; os fiscais do PL acompanharam a apuração nas salas de Totalização e dos Partidos.',
        fontes: [
          { titulo: 'Derrotado, Flávio mente ao sugerir que eleição foi fraudada', veiculo: 'Aos Fatos', data: '26/10/2026', url: 'https://www.aosfatos.org/noticias/derrotado-flavio-mente-sugerir-eleicao-fraudada/' }
        ]
      },
      {
        titulo: 'Auditorias independentes "provam" a fraude',
        explicacao: 'A análise independente mais compartilhada (seções com 100% e 90%, migração de votos) aponta padrões, mas não afirma fraude. Em 2022, o relatório do Instituto Voto Legal contratado pelo PL foi rejeitado pelo TSE, e o próprio presidente do PL disse depois que o publicou "contra a vontade".',
        fontes: [
          { titulo: 'Auditoria de urnas eletrônicas 2026 (repositório público)', veiculo: 'GitHub', url: 'https://github.com/romuloigor/eleicoes-2026' },
          { titulo: 'PL publicou relatório de urnas contra minha vontade, diz Valdemar', veiculo: 'Poder360', url: 'https://www.poder360.com.br/poder-justica/valdemar-costa-neto-pl-relatorio-urnas-contra-vontade/' }
        ]
      }
    ]
  },

  /** Contexto para os pontos que a auditoria dos dados encontrou */
  contexto: {
    candidatoRenuncia: {
      nome: 'Leonardo Avalanche (PRTB, 28)',
      texto: 'Situação do registro e na totalização: "Renúncia". O nome já estava carregado nas urnas, então os votos ficaram registrados nelas e foram anulados na totalização.',
      fontes: [
        { titulo: 'Leonardo Avalanche: situação da candidatura (dados do TSE DivulgaCandContas)', veiculo: 'Agência Sertão', url: 'https://agenciasertao.com/eleicoes/candidato/BR/leonardo-avalanche-prtb-br--280002554479/' }
      ]
    },
    votoEmTransito: {
      texto: 'O voto em trânsito é pedido turno a turno: 323.583 eleitores pediram para o 1º turno e 314.519 para o 2º. Quem pede vota numa seção de outra cidade, geralmente em capitais.',
      fontes: [
        { titulo: 'Mais de 314 mil pessoas solicitaram voto em trânsito para o 2º turno', veiculo: 'TNH1', url: 'https://www.tnh1.com.br/noticia/nid/mais-de-314-mil-pessoas-solicitaram-voto-em-transito-para-o-2-turno-das-eleicoes/' },
        { titulo: 'Mais de 323 mil eleitores pediram voto em trânsito para o 1º turno', veiculo: 'Portal Tela', url: 'https://www.portaltela.com/politica/2026/08/21/mais-de-323-mil-eleitores-pediram-voto-em-transito-para-o-1o-turno/' }
      ]
    }
  },

  /** Onde qualquer pessoa pode conferir */
  confira: [
    { titulo: 'Boletim de urna de cada seção', descricao: 'O boletim é impresso e afixado na seção antes de ser transmitido. Compare o de qualquer urna com o resultado publicado.', url: 'https://resultados.tse.jus.br' },
    { titulo: 'Portal de Dados Abertos do TSE', descricao: 'Votos por urna e por candidato, logs das urnas e registro digital do voto: os mesmos arquivos usados nesta auditoria.', url: 'https://dadosabertos.tse.jus.br' },
    { titulo: 'Fato ou Boato (Justiça Eleitoral)', descricao: 'Checagens oficiais de boatos sobre o processo eleitoral.', url: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/' },
    { titulo: 'DivulgaCandContas', descricao: 'Situação de registro de cada candidatura, inclusive renúncias e indeferimentos.', url: 'https://divulgacandcontas.tse.jus.br' }
  ]
});
