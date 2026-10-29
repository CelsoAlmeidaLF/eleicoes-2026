# Painel Eleições 2026 · TSE × IBGE

Painel analítico da eleição presidencial de 2026 (1º e 2º turnos) com microdados oficiais do TSE,
cruzados com a população do Censo IBGE 2022 pelo código IBGE dos 5.571 municípios.

**Acesse:** https://celsoalmeidalf.github.io/eleicoes-2026/

- 27 UFs, 5.571 municípios e 6.106 zonas eleitorais, nos dois turnos
- Percentuais sobre votos válidos oficiais; totais nacionais incluem o exterior
- Viradas entre turnos, ranking de abstenção e brancos/nulos por faixa demográfica, CSV completo
- PWA instalável que funciona offline; local-first, sem telemetria e sem chamadas externas
- Arquitetura hexagonal (`src/domain`, `src/application`, `src/infrastructure`, `src/ui`)

## Prova de origem dos dados

O rodapé do painel e `data/provenance.json` trazem o SHA-256 das fontes brutas
(pacotes do Portal de Dados Abertos do TSE e tabela SIDRA 9514 do IBGE). Para conferir:

```bash
python3 scripts/verify_sources.py --fetch-ibge   # baixa a tabela do IBGE e confere os hashes
```

Os CSVs brutos do TSE (~390 MB) não estão no repositório: baixe os pacotes oficiais indicados em
`data/provenance.json`, extraia em `data/tse_raw/` e rode o mesmo script.
Divergência conhecida: no 1º turno, os votos válidos do arquivo de detalhe do TSE somam 5.246
a mais que a soma dos candidatos; o painel usa os válidos oficiais. No exterior, 423 aptos (em cada
turno) não aparecem nem como comparecimento nem como abstenção. `build_tse_dataset.py` aceita essas
divergências apenas com os valores exatos (`KNOWN_DIVERGENCES`) e falha em qualquer outra.

## Rodar localmente

```bash
python3 -m http.server     # o site usa ES modules e service worker: precisa de servidor
npm test                   # testes com o executor nativo do Node (>= 20), sem dependências
```

## Regenerar os dados

```bash
python3 scripts/build_tse_dataset.py   # CSVs do TSE -> data/tse_2026_presidente.json
python3 scripts/build_app_data.py      # JSON + Censo -> src/infrastructure/data/*.js e data/provenance.json
python3 scripts/build_auditoria.py     # CSVs do TSE -> src/infrastructure/data/AuditoriaData.js (aba Notícias)
```

## Aba Notícias e auditoria

Escrita para o leitor que desconfia do TSE, com a linha "não confie, verifique":

1. **O que procede** nas críticas ao tribunal: prorrogação inédita até as 19h por decisão individual, decisões contraditórias, moderação de conteúdo sem transparência, ausência de voto impresso e arquivos republicados sem aviso.
2. **O que os arquivos das urnas mostram**: boletim impresso em cada seção × resultado oficial (2º turno, todo o país), logs das urnas (voto sem eleitor habilitado, rajadas, horários), biometria, e a auditoria estatística dos dois turnos.
3. **Quem verificou** (testes de integridade, código-fonte, OEA, auditorias independentes de código aberto), **outras alegações** (inclusive a posição dos EUA) e um **guia para o cidadão conferir sozinho**.

Conteúdo curado em `src/infrastructure/data/NoticiasData.js`; números gerados por script:

```bash
python3 scripts/build_auditoria.py         # CSVs do TSE -> AuditoriaData.js (estatística dos resultados)
python3 scripts/build_auditoria_urnas.py   # boletins e logs -> AuditoriaUrnasData.js (precisa do 7z)
python3 scripts/verificar_dossie.py        # confere as alegações do "Relatório Pericial Independente" (só lê, ~1 min)
```

`verificar_dossie.py` compara cada seção com ela mesma no 1º turno: horário de encerramento, eleitores sem biometria, Benford, seções com 100% para um candidato e se o ganho de Lula cabe nos votos disponíveis em cada seção. A margem nos boletins (4.566.361) é maior que a oficial porque o TSE não publicou os boletins de Roraima.

Arquivos brutos em `data/tse_raw/` (não versionados): `detalhe_votacao_secao_2026_BR.csv`, `votacao_candidato_munzona_2026_BR.csv`, `votacao_secao_2026_BR.csv` (zip `votacao_secao/votacao_secao_2026_BR.zip`), `bweb_2t/` (boletins de urna do 2º turno, do conjunto "Resultados - 2026 - Boletim de Urna") e `logs_2t/` (zips `arqurnatot/bu_imgbu_logjez_rdv_vscmr_2026_2t_UF.zip` dos estados auditados e logs avulsos de `resultados.tse.jus.br`).

**Regra para as fontes:** cada item precisa de ao menos uma fonte, e todo link tem de abrir a matéria citada. Antes de publicar, abra os links novos (o teste não acessa a internet). Endereços inventados ou trocados derrubam a credibilidade da aba inteira: um leitor que clica e cai numa página vazia descarta o resto. Prefira veículos lidos pela direita (Gazeta do Povo, Revista Oeste) e documentos primários (TSE, OEA, repositórios de código aberto).

Ao atualizar as notícias, mude `atualizadoEm`. Ao mudar módulos da aba, mantenha `sw.js` em dia (o teste de integridade cobra) e incremente `CACHE_VERSION`.

Desenvolvido por Celso de Almeida Leite (Systekna).

## Auditoria das urnas (outro app)

O app **Auditoria das Urnas** (projeto `8.3. AUDITORIA-URNAS`) é separado e tem endereço próprio (`https://celsoalmeidalf.github.io/auditoria-urnas-2026/`). O painel leva o usuário até ele: no menu, o grupo "Auditoria das urnas" tem um botão para cada seção do app (Panorama das urnas, Abrir urna, Confira o seu voto, Eventos do log, Locais e zonas, Urnas de uma UF, Como ler o log), que abre o app direto na seção (`#aba=panorama`, `#aba=abrir`, `#aba=urna`, `#aba=eventos`, `#aba=locais`, `#aba=uf`, `#aba=guia`); botão "Auditar os logs das urnas deste município" e link "ver urnas" em cada zona (abrem o app em `#locais=UF/município/zona`), e o link na aba Notícias. Os endereços ficam em `src/ui/Ligacoes.js`.
