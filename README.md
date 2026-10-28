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

Responde "houve fraude?" com três partes, todas com fonte:

- **Quem verificou e o que concluiu** e **Alegações e o que se verificou**: conteúdo curado em `src/infrastructure/data/NoticiasData.js` (testes de integridade do TSE e dos TREs, TCU, MP Eleitoral, missão da OEA, análises dos logs e agências de checagem). Cada item exige ao menos uma fonte com link (`tests/noticias.test.js`).
- **O caso contra o TSE**: o argumento mais forte da oposição, também em `NoticiasData.js`, separado em críticas à instituição com respaldo documental (prorrogação inédita, decisões individuais, moderação opaca, pouca auditabilidade pelo eleitor, dados republicados sem aviso) e alegações sobre a contagem sem respaldo. A conta "de onde vieram os votos ganhos no 2º turno" é calculada pelo script de auditoria (regressão por urna).
- **Auditoria deste painel nos arquivos do TSE**: números gerados por `scripts/build_auditoria.py`, que lê os três arquivos de `data/tse_raw/`. Além dos dois já usados pelo painel, precisa do arquivo de votos por urna e candidato (1,5 GB, não versionado):
  `https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2026_BR.zip`
  Os testes procuram contas que não fecham, comparecimento perto de 100%, boletins atrasados, efeito do modelo de urna, votações extremas, viradas atípicas (urna a urna), assinatura de enchimento (comparecimento × voto dentro do município) e divergência entre os arquivos. Anomalia estatística não é prova de fraude, e a aba diz isso.

Ao atualizar as notícias, mude `atualizadoEm` em `NoticiasData.js`. Ao mudar módulos da aba, mantenha `sw.js` em dia (o teste de integridade cobra) e incremente `CACHE_VERSION`.

Desenvolvido por Celso de Almeida Leite (Systekna).
