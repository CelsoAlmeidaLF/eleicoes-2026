/**
 * Microdados Eleitorais e Demográficos Consolidados.
 * Fontes oficiais: TSE Dados Abertos (Eleições 2026, Presidente, 1º e 2º turnos)
 * e IBGE Censo 2022 (SIDRA tabela 9514). ARQUIVO GERADO por scripts/build_app_data.py
 * a partir de data/tse_2026_presidente.json - não editar à mão.
 * Vencedores (winT1/winT2/winner/virada) são derivados dos votos.
 * Votos no exterior (ZZ) não pertencem a nenhuma UF: ficam fora da tabela de UFs e
 * entram só nos totais nacionais, via EXTERIOR_DATA.
 * Imutabilidade de dados base.
 */
export const BRAZIL_DATA = Object.freeze([
  { uf: "AC", name: "Acre", region: "Norte", pop: 830018, elec: 613715, municipalities: 22, t1Lula: 134770, t1Flavio: 302807, t2Lula: 144513, t2Flavio: 287715, t1Outros: 31489, t1Brancos: 5579, t1Nulos: 13662, t1Abstencoes: 125412, t2Brancos: 5016, t2Nulos: 16410, t2Abstencoes: 160061, t1Aptos: 613742, t1Comparecimento: 488330, t1Validos: 469089, t2Comparecimento: 453654, t2Validos: 432228, winT1: "PL", winT2: "PL", virada: false },
  { uf: "AL", name: "Alagoas", region: "Nordeste", pop: 3127683, elec: 2442081, municipalities: 102, t1Lula: 995459, t1Flavio: 735718, t2Lula: 1152621, t2Flavio: 744140, t1Outros: 87679, t1Brancos: 33712, t1Nulos: 85787, t1Abstencoes: 503698, t2Brancos: 16983, t2Nulos: 37888, t2Abstencoes: 490449, t1Aptos: 2442126, t1Comparecimento: 1938428, t1Validos: 1818929, t2Comparecimento: 1951632, t2Validos: 1896761, winT1: "PT", winT2: "PT", virada: false },
  { uf: "AM", name: "Amazonas", region: "Norte", pop: 3941613, elec: 2798661, municipalities: 62, t1Lula: 1046996, t1Flavio: 976764, t2Lula: 1145783, t2Flavio: 975245, t1Outros: 147003, t1Brancos: 24402, t1Nulos: 39302, t1Abstencoes: 564062, t2Brancos: 18324, t2Nulos: 52707, t2Abstencoes: 606602, t1Aptos: 2798611, t1Comparecimento: 2234549, t1Validos: 2170845, t2Comparecimento: 2192059, t2Validos: 2121028, winT1: "PT", winT2: "PT", virada: false },
  { uf: "AP", name: "Amapá", region: "Norte", pop: 733759, elec: 576910, municipalities: 16, t1Lula: 212503, t1Flavio: 212278, t2Lula: 222968, t2Flavio: 198674, t1Outros: 40077, t1Brancos: 4415, t1Nulos: 7272, t1Abstencoes: 100426, t2Brancos: 3320, t2Nulos: 5013, t2Abstencoes: 146935, t1Aptos: 576988, t1Comparecimento: 476562, t1Validos: 464875, t2Comparecimento: 429975, t2Validos: 421642, winT1: "PT", winT2: "PT", virada: false },
  { uf: "BA", name: "Bahia", region: "Nordeste", pop: 14141626, elec: 11312891, municipalities: 417, t1Lula: 5664771, t1Flavio: 2442585, t2Lula: 6485258, t2Flavio: 2608761, t1Outros: 452935, t1Brancos: 154936, t1Nulos: 338123, t1Abstencoes: 2259151, t2Brancos: 92721, t2Nulos: 235307, t2Abstencoes: 1890844, t1Aptos: 11312752, t1Comparecimento: 9053601, t1Validos: 8560542, t2Comparecimento: 9422047, t2Validos: 9094019, winT1: "PT", winT2: "PT", virada: false },
  { uf: "CE", name: "Ceará", region: "Nordeste", pop: 8794957, elec: 6996521, municipalities: 184, t1Lula: 3555263, t1Flavio: 1756850, t2Lula: 4036124, t2Flavio: 1819478, t1Outros: 305701, t1Brancos: 103295, t1Nulos: 189185, t1Abstencoes: 1086074, t2Brancos: 56386, t2Nulos: 112855, t2Abstencoes: 971678, t1Aptos: 6996545, t1Comparecimento: 5910471, t1Validos: 5617991, t2Comparecimento: 6024843, t2Validos: 5855602, winT1: "PT", winT2: "PT", virada: false },
  { uf: "DF", name: "Distrito Federal", region: "Centro-Oeste", pop: 2817381, elec: 2258995, municipalities: 1, t1Lula: 675627, t1Flavio: 909616, t2Lula: 825224, t2Flavio: 979542, t1Outros: 187565, t1Brancos: 25362, t1Nulos: 33169, t1Abstencoes: 426924, t2Brancos: 22386, t2Nulos: 41128, t2Abstencoes: 390715, t1Aptos: 2258320, t1Comparecimento: 1831396, t1Validos: 1772865, t2Comparecimento: 1868280, t2Validos: 1804766, winT1: "PL", winT2: "PL", virada: false },
  { uf: "ES", name: "Espírito Santo", region: "Sudeste", pop: 3833712, elec: 2991515, municipalities: 78, t1Lula: 850028, t1Flavio: 1233194, t2Lula: 1001965, t2Flavio: 1294504, t1Outros: 167856, t1Brancos: 43211, t1Nulos: 57872, t1Abstencoes: 639368, t2Brancos: 33080, t2Nulos: 79665, t2Abstencoes: 582301, t1Aptos: 2991650, t1Comparecimento: 2352282, t1Validos: 2251199, t2Comparecimento: 2409214, t2Validos: 2296469, winT1: "PL", winT2: "PL", virada: false },
  { uf: "GO", name: "Goiás", region: "Centro-Oeste", pop: 7056495, elec: 5080385, municipalities: 246, t1Lula: 1188880, t1Flavio: 2051888, t2Lula: 1585555, t2Flavio: 2345334, t1Outros: 587055, t1Brancos: 45643, t1Nulos: 98014, t1Abstencoes: 1109003, t2Brancos: 43214, t2Nulos: 73177, t2Abstencoes: 1033105, t1Aptos: 5080590, t1Comparecimento: 3971587, t1Validos: 3827930, t2Comparecimento: 4047280, t2Validos: 3930889, winT1: "PL", winT2: "PL", virada: false },
  { uf: "MA", name: "Maranhão", region: "Nordeste", pop: 6776699, elec: 5183049, municipalities: 217, t1Lula: 2566301, t1Flavio: 1239040, t2Lula: 2808231, t2Flavio: 1229971, t1Outros: 205098, t1Brancos: 46315, t1Nulos: 103244, t1Abstencoes: 1022772, t2Brancos: 30855, t2Nulos: 58714, t2Abstencoes: 1055278, t1Aptos: 5183115, t1Comparecimento: 4160343, t1Validos: 4010784, t2Comparecimento: 4127771, t2Validos: 4038202, winT1: "PT", winT2: "PT", virada: false },
  { uf: "MG", name: "Minas Gerais", region: "Sudeste", pop: 20539989, elec: 16372144, municipalities: 853, t1Lula: 5188936, t1Flavio: 5777548, t2Lula: 6351099, t2Flavio: 6241786, t1Outros: 1009751, t1Brancos: 268302, t1Nulos: 392176, t1Abstencoes: 3735098, t2Brancos: 164141, t2Nulos: 287177, t2Abstencoes: 3327941, t1Aptos: 16372372, t1Comparecimento: 12637274, t1Validos: 11976796, t2Comparecimento: 13044203, t2Validos: 12592885, winT1: "PL", winT2: "PT", virada: true },
  { uf: "MS", name: "Mato Grosso do Sul", region: "Centro-Oeste", pop: 2757013, elec: 2024437, municipalities: 79, t1Lula: 516855, t1Flavio: 873351, t2Lula: 628973, t2Flavio: 927892, t1Outros: 100072, t1Brancos: 21270, t1Nulos: 29596, t1Abstencoes: 483210, t2Brancos: 14958, t2Nulos: 22637, t2Abstencoes: 429977, t1Aptos: 2024430, t1Comparecimento: 1541220, t1Validos: 1490354, t2Comparecimento: 1594460, t2Validos: 1556865, winT1: "PL", winT2: "PL", virada: false },
  { uf: "MT", name: "Mato Grosso", region: "Centro-Oeste", pop: 3658649, elec: 2637879, municipalities: 142, t1Lula: 581681, t1Flavio: 1298581, t2Lula: 694167, t2Flavio: 1351099, t1Outros: 113026, t1Brancos: 20756, t1Nulos: 37994, t1Abstencoes: 585668, t2Brancos: 15431, t2Nulos: 24637, t2Abstencoes: 552545, t1Aptos: 2637801, t1Comparecimento: 2052133, t1Validos: 1993383, t2Comparecimento: 2085334, t2Validos: 2045266, winT1: "PL", winT2: "PL", virada: false },
  { uf: "PA", name: "Pará", region: "Norte", pop: 8120131, elec: 6262063, municipalities: 144, t1Lula: 2427237, t1Flavio: 2163957, t2Lula: 2690449, t2Flavio: 2199940, t1Outros: 271978, t1Brancos: 54203, t1Nulos: 148946, t1Abstencoes: 1195893, t2Brancos: 36501, t2Nulos: 62683, t2Abstencoes: 1272490, t1Aptos: 6262397, t1Comparecimento: 5066504, t1Validos: 4863355, t2Comparecimento: 4989573, t2Validos: 4890389, winT1: "PT", winT2: "PT", virada: false },
  { uf: "PB", name: "Paraíba", region: "Nordeste", pop: 3974687, elec: 3248434, municipalities: 223, t1Lula: 1541127, t1Flavio: 831377, t2Lula: 1794059, t2Flavio: 865210, t1Outros: 141243, t1Brancos: 52297, t1Nulos: 117854, t1Abstencoes: 564543, t2Brancos: 25943, t2Nulos: 58348, t2Abstencoes: 504874, t1Aptos: 3248531, t1Comparecimento: 2683988, t1Validos: 2513837, t2Comparecimento: 2743560, t2Validos: 2659269, winT1: "PT", winT2: "PT", virada: false },
  { uf: "PE", name: "Pernambuco", region: "Nordeste", pop: 9058931, elec: 7223227, municipalities: 185, t1Lula: 3553971, t1Flavio: 1738043, t2Lula: 4117513, t2Flavio: 1832554, t1Outros: 309003, t1Brancos: 109491, t1Nulos: 200416, t1Abstencoes: 1312388, t2Brancos: 56758, t2Nulos: 119642, t2Abstencoes: 1096760, t1Aptos: 7223450, t1Comparecimento: 5911062, t1Validos: 5601155, t2Comparecimento: 6126467, t2Validos: 5950067, winT1: "PT", winT2: "PT", virada: false },
  { uf: "PI", name: "Piauí", region: "Nordeste", pop: 3271199, elec: 2704695, municipalities: 224, t1Lula: 1523710, t1Flavio: 517028, t2Lula: 1653989, t2Flavio: 525859, t1Outros: 105656, t1Brancos: 28329, t1Nulos: 66108, t1Abstencoes: 463875, t2Brancos: 16137, t2Nulos: 43845, t2Abstencoes: 464865, t1Aptos: 2704758, t1Comparecimento: 2240883, t1Validos: 2146446, t2Comparecimento: 2239830, t2Validos: 2179848, winT1: "PT", winT2: "PT", virada: false },
  { uf: "PR", name: "Paraná", region: "Sul", pop: 11444380, elec: 8613628, municipalities: 399, t1Lula: 2054597, t1Flavio: 3945345, t2Lula: 2566504, t2Flavio: 4291444, t1Outros: 585301, t1Brancos: 122499, t1Nulos: 133447, t1Abstencoes: 1772200, t2Brancos: 82572, t2Nulos: 118819, t2Abstencoes: 1554289, t1Aptos: 8613657, t1Comparecimento: 6841457, t1Validos: 6585511, t2Comparecimento: 7059339, t2Validos: 6857948, winT1: "PL", winT2: "PL", virada: false },
  { uf: "RJ", name: "Rio de Janeiro", region: "Sudeste", pop: 16055174, elec: 12857526, municipalities: 92, t1Lula: 3693021, t1Flavio: 4966844, t2Lula: 4565393, t2Flavio: 5169033, t1Outros: 709835, t1Brancos: 201979, t1Nulos: 287736, t1Abstencoes: 2997846, t2Brancos: 111682, t2Nulos: 231341, t2Abstencoes: 2780077, t1Aptos: 12857648, t1Comparecimento: 9859802, t1Validos: 9370087, t2Comparecimento: 10077449, t2Validos: 9734426, winT1: "PL", winT2: "PL", virada: false },
  { uf: "RN", name: "Rio Grande do Norte", region: "Nordeste", pop: 3302729, elec: 2659867, municipalities: 167, t1Lula: 1237963, t1Flavio: 720493, t2Lula: 1413596, t2Flavio: 737409, t1Outros: 113442, t1Brancos: 33172, t1Nulos: 65880, t1Abstencoes: 488812, t2Brancos: 19939, t2Nulos: 61879, t2Abstencoes: 427044, t1Aptos: 2659825, t1Comparecimento: 2171013, t1Validos: 2071961, t2Comparecimento: 2232823, t2Validos: 2151005, winT1: "PT", winT2: "PT", virada: false },
  { uf: "RO", name: "Rondônia", region: "Norte", pop: 1581196, elec: 1265926, municipalities: 52, t1Lula: 250667, t1Flavio: 652988, t2Lula: 294446, t2Flavio: 674382, t1Outros: 64404, t1Brancos: 9846, t1Nulos: 13109, t1Abstencoes: 274813, t2Brancos: 8361, t2Nulos: 11300, t2Abstencoes: 277437, t1Aptos: 1265893, t1Comparecimento: 991080, t1Validos: 968125, t2Comparecimento: 988489, t2Validos: 968828, winT1: "PL", winT2: "PL", virada: false },
  { uf: "RR", name: "Roraima", region: "Norte", pop: 636707, elec: 401540, municipalities: 15, t1Lula: 74420, t1Flavio: 231322, t2Lula: 83505, t2Flavio: 219675, t1Outros: 19803, t1Brancos: 2618, t1Nulos: 4595, t1Abstencoes: 68749, t2Brancos: 2176, t2Nulos: 3241, t2Abstencoes: 92943, t1Aptos: 401521, t1Comparecimento: 332772, t1Validos: 325559, t2Comparecimento: 308597, t2Validos: 303180, winT1: "PL", winT2: "PL", virada: false },
  { uf: "RS", name: "Rio Grande do Sul", region: "Sul", pop: 10882965, elec: 8522318, municipalities: 497, t1Lula: 2294759, t1Flavio: 3573783, t2Lula: 2824552, t2Flavio: 3874378, t1Outros: 554504, t1Brancos: 148339, t1Nulos: 131265, t1Abstencoes: 1819642, t2Brancos: 89463, t2Nulos: 101245, t2Abstencoes: 1632680, t1Aptos: 8522545, t1Comparecimento: 6702903, t1Validos: 6423299, t2Comparecimento: 6889638, t2Validos: 6698930, winT1: "PL", winT2: "PL", virada: false },
  { uf: "SC", name: "Santa Catarina", region: "Sul", pop: 7610361, elec: 5734687, municipalities: 295, t1Lula: 1127168, t1Flavio: 3000020, t2Lula: 1418314, t2Flavio: 3220071, t1Outros: 373709, t1Brancos: 69007, t1Nulos: 78071, t1Abstencoes: 1086492, t2Brancos: 48674, t2Nulos: 75244, t2Abstencoes: 972384, t1Aptos: 5734651, t1Comparecimento: 4648159, t1Validos: 4501081, t2Comparecimento: 4762303, t2Validos: 4638385, winT1: "PL", winT2: "PL", virada: false },
  { uf: "SE", name: "Sergipe", region: "Nordeste", pop: 2210004, elec: 1740093, municipalities: 75, t1Lula: 856019, t1Flavio: 417839, t2Lula: 989041, t2Flavio: 433354, t1Outros: 90338, t1Brancos: 24859, t1Nulos: 49970, t1Abstencoes: 301053, t2Brancos: 13135, t2Nulos: 31129, t2Abstencoes: 273434, t1Aptos: 1740135, t1Comparecimento: 1439082, t1Validos: 1364253, t2Comparecimento: 1466659, t2Validos: 1422395, winT1: "PT", winT2: "PT", virada: false },
  { uf: "SP", name: "São Paulo", region: "Sudeste", pop: 44411238, elec: 34123591, municipalities: 645, t1Lula: 9505413, t1Flavio: 12922023, t2Lula: 12119274, t2Flavio: 14139178, t1Outros: 2455512, t1Brancos: 632801, t1Nulos: 914888, t1Abstencoes: 7690900, t2Brancos: 389606, t2Nulos: 716331, t2Abstencoes: 6759202, t1Aptos: 34122892, t1Comparecimento: 26431992, t1Validos: 24884303, t2Comparecimento: 27364389, t2Validos: 26258452, winT1: "PL", winT2: "PL", virada: false },
  { uf: "TO", name: "Tocantins", region: "Norte", pop: 1511460, elec: 1182041, municipalities: 139, t1Lula: 404009, t1Flavio: 469321, t2Lula: 442962, t2Flavio: 467916, t1Outros: 57117, t1Brancos: 8344, t1Nulos: 26377, t1Abstencoes: 216827, t2Brancos: 8059, t2Nulos: 35826, t2Abstencoes: 227278, t1Aptos: 1182023, t1Comparecimento: 965196, t1Validos: 930475, t2Comparecimento: 954763, t2Validos: 910878, winT1: "PL", winT2: "PL", virada: false }
]);

export const EXTERIOR_DATA = Object.freeze({
  t1: Object.freeze({ aptos: 916534, comparecimento: 341766, validos: 331005, lula: 157387, flavio: 143900, outros: 29595, brancos: 5816, nulos: 4945, abstencoes: 574345 }),
  t2: Object.freeze({ aptos: 916683, comparecimento: 381443, validos: 371651, lula: 200154, flavio: 171497, outros: 0, brancos: 4675, nulos: 5117, abstencoes: 534817 })
});

/** Prova de origem das fontes (mesmo conteúdo de data/provenance.json) */
export const PROVENANCE = Object.freeze({
  "geradoEm": "2026-10-28T12:54:35Z",
  "tse": [
    {
      "arquivo": "votacao_candidato_munzona_2026_BR.csv",
      "pacote": "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2026.zip",
      "sha256": "de72c736ded808be34c32c592cfab77ee94702e659d73e855a615325983f8f82",
      "bytes": 40138768,
      "obtidoEm": "2026-10-27T22:44:18Z"
    },
    {
      "arquivo": "detalhe_votacao_secao_2026_BR.csv",
      "pacote": "https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2026.zip",
      "sha256": "340aeb28851ac1291df464a22b4b5d350142dfa161e581a4178f6de250c37491",
      "bytes": 351831261,
      "obtidoEm": "2026-10-26T18:23:02Z"
    }
  ],
  "tseDataset": {
    "arquivo": "data/tse_2026_presidente.json",
    "sha256": "fdb205326dcaaf5cccbff41b50ef452cd6d13c3bc0b2a8ad186acca1944646b6",
    "geradoEm": "2026-10-28T12:44:34Z"
  },
  "ibge": {
    "tabela": "SIDRA 9514, variável 93 (População residente, Censo 2022)",
    "api": "https://servicodados.ibge.gov.br/api/v3/agregados/9514/periodos/2022/variaveis/93?localidades=N6[all]",
    "sha256Tabela": "2405b0935f37900efc603e11c1455a2fc075d602439a6570a944cb59b5a41d27",
    "municipios": 5570,
    "sha256Arquivo": "0b64b1b4d8af968c7468f84f891a58c23f39c9ffa0d51d7c0216f9adc32ae096",
    "obtidoEm": "2026-10-27T20:32:41Z"
  },
  "divergencias": {
    "t1ValidosAcimaDaSomaDosCandidatos": 5246
  }
});
