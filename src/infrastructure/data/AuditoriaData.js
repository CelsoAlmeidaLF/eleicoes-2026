/**
 * Auditoria estatística dos arquivos oficiais do TSE (presidente, 2026).
 * ARQUIVO GERADO por scripts/build_auditoria.py - não editar à mão.
 */
export const AUDITORIA = Object.freeze({
  "meta": {
    "geradoEm": "2026-10-28T22:29:21Z",
    "geradoPor": "scripts/build_auditoria.py",
    "arquivos": [
      {
        "arquivo": "detalhe_votacao_secao_2026_BR.csv",
        "pacote": "https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2026.zip",
        "geradoPeloTse": "26/10/2026 09:49:06",
        "sha256": "340aeb28851ac1291df464a22b4b5d350142dfa161e581a4178f6de250c37491",
        "bytes": 351831261
      },
      {
        "arquivo": "votacao_secao_2026_BR.csv",
        "pacote": "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2026_BR.zip",
        "geradoPeloTse": "26/10/2026 12:07:25",
        "sha256": "fb1db30acd0c68dbb79495c580b69aa64c2d0bed278aabd256632d46559e82dd",
        "bytes": 1578545088
      },
      {
        "arquivo": "votacao_candidato_munzona_2026_BR.csv",
        "pacote": "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2026.zip",
        "geradoPeloTse": "28/10/2026 08:31:40",
        "sha256": "05dc4dbe891fe3ea04fd7b36b120cca6f53f339d0863abf06bf7692e4674eae2",
        "bytes": 40138768
      }
    ]
  },
  "t1": {
    "urnas": 499248,
    "aptos": 158745502,
    "comparecimento": 125275835,
    "lula": 53879538,
    "flavio": 56104503
  },
  "t2": {
    "urnas": 499248,
    "aptos": 158745502,
    "comparecimento": 128236074,
    "lula": 64256232,
    "flavio": 59826041
  },
  "margem2": 4430191,
  "contas": {
    "t1": {
      "repetidas": 0,
      "comparecimentoMaiorQueAptos": 0,
      "aptosNaoFecham": 0,
      "votosNaoFecham": 0,
      "naoInstaladas": 41
    },
    "t2": {
      "repetidas": 0,
      "comparecimentoMaiorQueAptos": 0,
      "aptosNaoFecham": 0,
      "votosNaoFecham": 0,
      "naoInstaladas": 41
    }
  },
  "comparecimentoHistograma": {
    "t1": [
      [
        40,
        0.04
      ],
      [
        45,
        0.05
      ],
      [
        50,
        0.07
      ],
      [
        55,
        0.2
      ],
      [
        60,
        0.94
      ],
      [
        65,
        4.33
      ],
      [
        70,
        14.72
      ],
      [
        75,
        31.57
      ],
      [
        80,
        33.95
      ],
      [
        85,
        12.32
      ],
      [
        90,
        1.55
      ],
      [
        95,
        0.11
      ],
      [
        100,
        0.0
      ]
    ],
    "t2": [
      [
        40,
        0.04
      ],
      [
        45,
        0.05
      ],
      [
        50,
        0.08
      ],
      [
        55,
        0.19
      ],
      [
        60,
        0.63
      ],
      [
        65,
        2.47
      ],
      [
        70,
        9.43
      ],
      [
        75,
        25.38
      ],
      [
        80,
        38.51
      ],
      [
        85,
        20.1
      ],
      [
        90,
        2.84
      ],
      [
        95,
        0.13
      ],
      [
        100,
        0.0
      ]
    ]
  },
  "urnasComparecimento98": {
    "t1": 55,
    "t2": 63
  },
  "boletins": {
    "t1": {
      "medianaHoras": 1.75,
      "maximoHoras": 10.0,
      "depoisDe24h": 0
    },
    "t2": {
      "medianaHoras": 3.44,
      "maximoHoras": 6.4,
      "depoisDe24h": 0
    }
  },
  "origemBoletins": {
    "t1": {
      "Urna Eletrônica": 499126,
      "BU gerado por RED em urna de seção *** RED - Recuperador de dados": 50,
      "Sistema de apuração": 31,
      "Totalização": 41
    },
    "t2": {
      "Urna Eletrônica": 499162,
      "BU gerado por RED em urna de seção *** RED - Recuperador de dados": 14,
      "Sistema de apuração": 29,
      "BU gerado por RED em urna de contingência": 2,
      "Totalização": 41
    }
  },
  "modelos": {
    "t1": {
      "#NULO": {
        "urnas": 41,
        "comparecimento": 0.0
      },
      "UE 2013": {
        "urnas": 11920,
        "comparecimento": 71.62
      },
      "UE 2015": {
        "urnas": 88065,
        "comparecimento": 78.53
      },
      "UE 2020": {
        "urnas": 200466,
        "comparecimento": 79.05
      },
      "UE 2022": {
        "urnas": 198756,
        "comparecimento": 79.44
      }
    },
    "t2": {
      "#NULO": {
        "urnas": 41,
        "comparecimento": 0.0
      },
      "UE 2013": {
        "urnas": 12455,
        "comparecimento": 74.85
      },
      "UE 2015": {
        "urnas": 87502,
        "comparecimento": 80.76
      },
      "UE 2020": {
        "urnas": 200504,
        "comparecimento": 80.9
      },
      "UE 2022": {
        "urnas": 198746,
        "comparecimento": 81.08
      }
    }
  },
  "modeloUrnaCorrelacao": {
    "porUF": {
      "AL": -0.57,
      "AM": 0.59,
      "BA": -0.18,
      "CE": -0.07,
      "DF": 0.24,
      "ES": 0.07,
      "GO": -0.29,
      "MA": 0.11,
      "MG": -0.01,
      "MS": -0.06,
      "MT": -0.14,
      "PA": 0.08,
      "PB": 0.51,
      "PE": -0.06,
      "PI": 0.03,
      "PR": 0.09,
      "RJ": -0.36,
      "RN": 0.35,
      "RS": 0.13,
      "SC": 0.18,
      "SE": 0.35,
      "SP": -0.03,
      "TO": 0.14
    },
    "mediana": 0.07,
    "positivas": 13,
    "negativas": 10
  },
  "urnas100": {
    "total": 91,
    "base": 498528,
    "lula": 88,
    "flavio": 3,
    "emEscolaIndigena": 28,
    "porUF": {
      "AM": 30,
      "MA": 17,
      "PA": 13,
      "RR": 6,
      "TO": 6,
      "MT": 5
    },
    "exemplos": [
      {
        "municipio": "TABATINGA",
        "uf": "AM",
        "local": "E. M. Indígena Rainha Dos Apóstolos",
        "lula": 354,
        "flavio": 0
      },
      {
        "municipio": "TABATINGA",
        "uf": "AM",
        "local": "E. M. Indígena Aitcha",
        "lula": 338,
        "flavio": 0
      },
      {
        "municipio": "MAUÉS",
        "uf": "AM",
        "local": "E. M. Indígena Uniawasapi",
        "lula": 333,
        "flavio": 0
      },
      {
        "municipio": "SANTO ANTÔNIO DO IÇÁ",
        "uf": "AM",
        "local": "E. E. D. Pedro I",
        "lula": 329,
        "flavio": 0
      },
      {
        "municipio": "ATALAIA DO NORTE",
        "uf": "AM",
        "local": "E. M. Braz Tukuna",
        "lula": 325,
        "flavio": 0
      }
    ]
  },
  "zonas90": {
    "total": 14,
    "lula": 12,
    "flavio": 2
  },
  "viradaZonas": {
    "zonas": 6146,
    "mediaPp": -2.42,
    "desvioPp": 1.27,
    "atipicas": [
      {
        "uf": "AL",
        "municipio": "BELO MONTE",
        "zona": "29",
        "variacaoPp": 8.8,
        "desvios": 8.8,
        "urnas": 16,
        "urnasMesmaDirecao": 16
      },
      {
        "uf": "PI",
        "municipio": "SANTO ANTÔNIO DE LISBOA",
        "zona": "28",
        "variacaoPp": 7.6,
        "desvios": 7.9,
        "urnas": 24,
        "urnasMesmaDirecao": 24
      },
      {
        "uf": "RN",
        "municipio": "RAFAEL GODEIRO",
        "zona": "37",
        "variacaoPp": -10.2,
        "desvios": -6.1,
        "urnas": 11,
        "urnasMesmaDirecao": 11
      },
      {
        "uf": "BA",
        "municipio": "CALDEIRÃO GRANDE",
        "zona": "115",
        "variacaoPp": 4.1,
        "desvios": 5.1,
        "urnas": 34,
        "urnasMesmaDirecao": 34
      },
      {
        "uf": "BA",
        "municipio": "NOVA IBIÁ",
        "zona": "151",
        "variacaoPp": 2.8,
        "desvios": 4.1,
        "urnas": 19,
        "urnasMesmaDirecao": 18
      }
    ]
  },
  "viradaUrnas": {
    "urnas": 492331,
    "mediaPp": -2.92,
    "desvioPp": 2.33,
    "acimaDe5Desvios": 55
  },
  "migracao": {
    "ganhoLula": 10376696,
    "ganhoFlavio": 3721538,
    "votosTerceiros1": 9321993,
    "aumentoValidos": 4776239,
    "disputados": 14098232,
    "fatiaLula": 73.6,
    "origens": [
      {
        "origem": "Augusto Cury",
        "votos1": 3448569,
        "paraLula": 59.0,
        "paraFlavio": 22.3,
        "votosLula": 2034672
      },
      {
        "origem": "Renan Santos",
        "votos1": 2675887,
        "paraLula": 38.0,
        "paraFlavio": 43.1,
        "votosLula": 1017676
      },
      {
        "origem": "Ronaldo Caiado",
        "votos1": 2605148,
        "paraLula": 37.7,
        "paraFlavio": 52.9,
        "votosLula": 982468
      },
      {
        "origem": "Romeu Zema",
        "votos1": 326488,
        "paraLula": -20.5,
        "paraFlavio": 103.0,
        "votosLula": -66926
      },
      {
        "origem": "Demais candidatos",
        "votos1": 265901,
        "paraLula": 75.7,
        "paraFlavio": 6.6,
        "votosLula": 201256
      },
      {
        "origem": "Brancos e nulos do 1º turno",
        "votos1": 5969801,
        "paraLula": 74.8,
        "paraFlavio": -16.2,
        "votosLula": 4464905
      },
      {
        "origem": "Novos votantes",
        "votos1": 2960241,
        "paraLula": 56.0,
        "paraFlavio": 39.9,
        "votosLula": 1657994
      }
    ]
  },
  "comparecimentoVotoMunicipio": {
    "urnas": 498400,
    "correlacao": -0.067
  },
  "divergenciaArquivos": {
    "t1": {
      "nominaisUrnas": 119306034,
      "nominaisDetalhe": 119306034,
      "nominaisZona": 119300788,
      "candidatos": [
        {
          "nome": "LEONARDO ALVES DE ARAUJO",
          "nomeUrna": "",
          "diferenca": 5246
        }
      ],
      "zonasComDiferenca": 2148
    },
    "t2": {
      "nominaisUrnas": 124082273,
      "nominaisDetalhe": 124082273,
      "nominaisZona": 124082273,
      "candidatos": [],
      "zonasComDiferenca": 0
    }
  },
  "mudancaDeUrna": {
    "eleitores": 37346,
    "saldo": 0,
    "urnasQuePerderam": 24940,
    "urnasQueGanharam": 30782,
    "principaisDestinos": [
      "SÃO PAULO",
      "BRASÍLIA",
      "BLUMENAU",
      "MACEIÓ"
    ]
  }
});
