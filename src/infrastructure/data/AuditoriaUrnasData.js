/**
 * Auditoria dos boletins de urna e dos logs das urnas (2º turno de 2026).
 * ARQUIVO GERADO por scripts/build_auditoria_urnas.py - não editar à mão.
 */
export const AUDITORIA_URNAS = Object.freeze({
  "geradoEm": "2026-10-29T01:44:05Z",
  "geradoPor": "scripts/build_auditoria_urnas.py",
  "boletins": {
    "ufs": 27,
    "ufsSemBoletim": [
      "RR"
    ],
    "arquivosComHashConferido": 27,
    "urnasComparadas": 497686,
    "urnasComDiferenca": 0,
    "soNoBoletim": 0,
    "soNaTotalizacao": 0,
    "votosLula": 64172727,
    "votosFlavio": 59606366
  },
  "urnas": {
    "aberturaAntesDas7h": 0,
    "boletimAntesDoEncerramento": 0,
    "encerramento": {
      "ate17h": 125753,
      "ate18h": 363536,
      "ate19h30": 6327,
      "ate19h": 737,
      "depois19h30": 25
    },
    "encerradasDepoisDas19h05": 494,
    "carregadasNoDia": [
      {
        "uf": "MS",
        "municipio": "Campo Grande",
        "zona": "8",
        "secao": "486",
        "carga": "06:55",
        "abertura": "08:26",
        "comparecimento": 280,
        "lula": 109,
        "flavio": 163
      },
      {
        "uf": "MS",
        "municipio": "Três Lagoas",
        "zona": "51",
        "secao": "44",
        "carga": "07:36",
        "abertura": "09:13",
        "comparecimento": 218,
        "lula": 98,
        "flavio": 118
      },
      {
        "uf": "PR",
        "municipio": "Carlópolis",
        "zona": "56",
        "secao": "37",
        "carga": "09:20",
        "abertura": "10:02",
        "comparecimento": 278,
        "lula": 85,
        "flavio": 177
      },
      {
        "uf": "PR",
        "municipio": "Guarapuava",
        "zona": "43",
        "secao": "397",
        "carga": "10:04",
        "abertura": "10:51",
        "comparecimento": 38,
        "lula": 22,
        "flavio": 15
      },
      {
        "uf": "SP",
        "municipio": "Atibaia",
        "zona": "16",
        "secao": "436",
        "carga": "07:58",
        "abertura": "08:32",
        "comparecimento": 297,
        "lula": 111,
        "flavio": 174
      }
    ],
    "semBiometria": {
      "eleitores": 8619842,
      "votantes": 127927477,
      "pct": 6.74,
      "correlacaoComLulaNoMunicipio": 0.012,
      "urnas": 496886
    }
  },
  "logs": {
    "ufs": [
      "AL",
      "RR"
    ],
    "urnas": 8620,
    "votos": 2256121,
    "votosSemEleitorHabilitado": 0,
    "paresMenosDe15s": 0,
    "menorIntervaloSeg": 18,
    "intervaloMedianoSeg": 66,
    "votosDepoisDas17h": 791,
    "logIgualAoOficial": 8589,
    "logDiferente": 31,
    "diferentesComTrocaDeUrna": 31,
    "diferentesComLogAMais": 0
  },
  "casos": [
    {
      "uf": "MG",
      "municipio": "Chapada Gaúcha",
      "zona": "320",
      "secao": "185",
      "encerramento": "23:04",
      "contingencia": true,
      "votosNaUrnaOriginal": 96,
      "comparecimentoOficial": 96,
      "votosSemHabilitacao": 0,
      "primeiroVoto": "08:04",
      "ultimoVoto": "16:27"
    }
  ]
});
