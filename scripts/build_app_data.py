#!/usr/bin/env python3
"""
Gera src/infrastructure/data/BrazilElectionData.js a partir de fontes oficiais:
  - TSE 2026 (data/tse_2026_presidente.json, gerado por build_tse_dataset.py)
  - IBGE Censo 2022 (data/ibge_raw_pop_munic.json = SIDRA tabela 9514, var. 93)
Todos os campos de votos/eleitores/vencedores são DERIVADOS (nenhum digitado à mão).
Saídas: BrazilElectionData.js (UFs + PROVENANCE), BrazilMunicipalitiesData.js (todos os municípios),
BrazilZonesData.js (zonas eleitorais por município, carregado sob demanda)
e data/provenance.json (prova de origem: SHA-256 das fontes brutas; conferir com scripts/verify_sources.py).
"""
import json, re, unicodedata, hashlib
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
tse = json.loads((ROOT / "data/tse_2026_presidente.json").read_text(encoding="utf-8"))
ibge = json.loads((ROOT / "data/ibge_raw_pop_munic.json").read_text(encoding="utf-8"))

UFS = {
    "AC": ("Acre", "Norte", 12), "AL": ("Alagoas", "Nordeste", 27), "AM": ("Amazonas", "Norte", 13),
    "AP": ("Amapá", "Norte", 16), "BA": ("Bahia", "Nordeste", 29), "CE": ("Ceará", "Nordeste", 23),
    "DF": ("Distrito Federal", "Centro-Oeste", 53), "ES": ("Espírito Santo", "Sudeste", 32),
    "GO": ("Goiás", "Centro-Oeste", 52), "MA": ("Maranhão", "Nordeste", 21), "MG": ("Minas Gerais", "Sudeste", 31),
    "MS": ("Mato Grosso do Sul", "Centro-Oeste", 50), "MT": ("Mato Grosso", "Centro-Oeste", 51),
    "PA": ("Pará", "Norte", 15), "PB": ("Paraíba", "Nordeste", 25), "PE": ("Pernambuco", "Nordeste", 26),
    "PI": ("Piauí", "Nordeste", 22), "PR": ("Paraná", "Sul", 41), "RJ": ("Rio de Janeiro", "Sudeste", 33),
    "RN": ("Rio Grande do Norte", "Nordeste", 24), "RO": ("Rondônia", "Norte", 11), "RR": ("Roraima", "Norte", 14),
    "RS": ("Rio Grande do Sul", "Sul", 43), "SC": ("Santa Catarina", "Sul", 42), "SE": ("Sergipe", "Nordeste", 28),
    "SP": ("São Paulo", "Sudeste", 35), "TO": ("Tocantins", "Norte", 17),
}
IBGE_UF = {v[2]: k for k, v in UFS.items()}

IBGE_API = "https://servicodados.ibge.gov.br/api/v3/agregados/9514/periodos/2022/variaveis/93?localidades=N6[all]"


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def ibge_table_sha256(doc):
    """Hash reproduzível do IBGE: a API devolve metadados em ordem variável, então o hash cobre
    só a tabela usada pelo painel, uma linha 'codigo_ibge;populacao' por município, ordenada pelo código."""
    rows = sorted((x["localidade"]["id"], x["serie"]["2022"]) for x in doc[0]["resultados"][0]["series"])
    return hashlib.sha256("".join(f"{i};{p}\n" for i, p in rows).encode("utf-8")).hexdigest(), len(rows)

# Códigos IBGE (7 dígitos) das 27 capitais
CAPITAIS = {
    "1200401", "2704302", "1600303", "1302603", "2927408", "2304400", "5300108", "3205309", "5208707",
    "2111300", "5103403", "5002704", "3106200", "1501402", "2507507", "4106902", "2611606", "2211001",
    "3304557", "2408102", "4314902", "1100205", "1400100", "4205407", "3550308", "2800308", "1721000",
}

# Grafias do TSE que diferem do nome oficial IBGE (chave: UF + nome TSE normalizado)
ALIASES_TSE_IBGE = {
    ("GO", "BOMJESUS"): "Bom Jesus de Goiás",
    ("MG", "BARAODEMONTEALTO"): "Barão do Monte Alto",
    ("MG", "DONAEUSEBIA"): "Dona Euzébia",
    ("MG", "SAOTHOMEDASLETRAS"): "São Tomé das Letras",
    ("MT", "SANTOANTONIODOLEVERGER"): "Santo Antônio de Leverger",
    ("PA", "ELDORADODOSCARAJAS"): "Eldorado do Carajás",
    ("PR", "MUNHOZDEMELLO"): "Munhoz de Melo",
    ("RN", "BOASAUDE"): "Januário Cicco",
    ("RO", "ALVORADADOOESTE"): "Alvorada D'Oeste",
    ("RO", "ESPIGAODOOESTE"): "Espigão D'Oeste",
    ("RR", "SAOLUIZ"): "São Luiz do Anauá",
    ("SE", "AMPARODESAOFRANCISCO"): "Amparo do São Francisco",
    ("SP", "SAOLUISDOPARAITINGA"): "São Luiz do Paraitinga",
}


def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().upper()
    return re.sub(r"[^A-Z0-9]", "", s)


# População por UF = soma municipal (Censo 2022); consistente com a tabela IBGE por UF
pop_uf, pop_mun = {}, {}
for x in ibge[0]["resultados"][0]["series"]:
    nome, uf = x["localidade"]["nome"].rsplit(" - ", 1)
    p = int(x["serie"]["2022"])
    pop_uf[uf] = pop_uf.get(uf, 0) + p
    pop_mun[(uf, norm(nome))] = (nome, p, x["localidade"]["id"])

win = lambda l, f: "PT" if l > f else "PL"
cnt = {}
for m in tse["municipios"]:
    if m["uf"] != "ZZ":
        cnt[m["uf"]] = cnt.get(m["uf"], 0) + 1

lines = []
for uf, (nome, reg, _) in UFS.items():
    a, b = tse["ufs"][uf]["t1"], tse["ufs"][uf]["t2"]
    w1, w2 = win(a["lula"], a["flavio"]), win(b["lula"], b["flavio"])
    lines.append(
        f'  {{ uf: "{uf}", name: "{nome}", region: "{reg}", pop: {pop_uf[uf]}, elec: {b["aptos"]}, municipalities: {cnt[uf]}, '
        f't1Lula: {a["lula"]}, t1Flavio: {a["flavio"]}, t2Lula: {b["lula"]}, t2Flavio: {b["flavio"]}, '
        f't1Outros: {a["outros"]}, t1Brancos: {a["brancos"]}, t1Nulos: {a["nulos"]}, t1Abstencoes: {a["abstencoes"]}, '
        f't2Brancos: {b["brancos"]}, t2Nulos: {b["nulos"]}, t2Abstencoes: {b["abstencoes"]}, '
        f't1Aptos: {a["aptos"]}, t1Comparecimento: {a["comparecimento"]}, t1Validos: {a["validos"]}, '
        f't2Comparecimento: {b["comparecimento"]}, t2Validos: {b["validos"]}, '
        f'winT1: "{w1}", winT2: "{w2}", virada: {"true" if w1 != w2 else "false"} }}'
    )

# Municípios: todos os do TSE (exceto exterior), cruzados com o Censo pelo nome oficial
muns, unmatched = [], []
for m in tse["municipios"]:
    if m["uf"] == "ZZ":
        continue
    k = (m["uf"], norm(m["nome"]))
    if k in ALIASES_TSE_IBGE:
        k = (m["uf"], norm(ALIASES_TSE_IBGE[k]))
    if k in pop_mun:
        nm, p, cod = pop_mun[k]
    else:
        # Município instalado após o Censo 2022: mantém votos, sem população
        nm = " ".join(w if w in ("de", "da", "do", "das", "dos", "e") else w.capitalize() for w in m["nome"].lower().split())
        p, cod = None, None
        unmatched.append(f'{m["uf"]}/{m["nome"]}')
    muns.append((p or 0, nm, p, cod, m))
muns.sort(key=lambda t: -t[0])
js = lambda v: "null" if v is None else (f'"{v}"' if isinstance(v, str) else str(v))
mlines = []
for _, nm, p, cod, m in muns:
    a, b = m["t1"], m["t2"]
    nm = "Brasília" if m["uf"] == "DF" else nm
    mlines.append(
        f'  {{ ibge: {js(cod)}, tse: "{m["uf"]}-{m["cd"]}", name: {json.dumps(nm, ensure_ascii=False)}, uf: "{m["uf"]}", capital: {"true" if cod in CAPITAIS else "false"}, '
        f'pop: {js(p)}, elec: {b["aptos"]}, '
        f't1Lula: {a["lula"]}, t1Flavio: {a["flavio"]}, t1Outros: {a["outros"]}, t1Validos: {a["validos"]}, '
        f't1Brancos: {a["brancos"]}, t1Nulos: {a["nulos"]}, t1Abstencoes: {a["abstencoes"]}, t1Aptos: {a["aptos"]}, t1Comparecimento: {a["comparecimento"]}, '
        f't2Lula: {b["lula"]}, t2Flavio: {b["flavio"]}, t2Validos: {b["validos"]}, '
        f't2Brancos: {b["brancos"]}, t2Nulos: {b["nulos"]}, t2Abstencoes: {b["abstencoes"]}, t2Comparecimento: {b["comparecimento"]}, '
        f'winT1: "{win(a["lula"], a["flavio"])}", winner: "{win(b["lula"], b["flavio"])}" }}'
    )

# Prova de origem: SHA-256 dos CSVs brutos (registrado por build_tse_dataset.py ao gerar o JSON),
# do JSON intermediário e da tabela do IBGE; divergência conhecida entre arquivos do TSE documentada
ibge_path = ROOT / "data/ibge_raw_pop_munic.json"
ibge_hash, ibge_rows = ibge_table_sha256(ibge)
t1_div = sum(m["t1"]["validos"] - (m["t1"]["lula"] + m["t1"]["flavio"] + m["t1"]["outros"]) for m in tse["municipios"])
provenance = {
    "geradoEm": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "tse": [{"arquivo": f["arquivo"], "pacote": f["pacote"], "sha256": f["sha256"], "bytes": f["bytes"], "obtidoEm": f["obtido_em"]}
            for f in tse["meta"]["fontes"]],
    "tseDataset": {"arquivo": "data/tse_2026_presidente.json", "sha256": sha256_file(ROOT / "data/tse_2026_presidente.json"),
                   "geradoEm": tse["meta"]["gerado_em"]},
    "ibge": {"tabela": "SIDRA 9514, variável 93 (População residente, Censo 2022)", "api": IBGE_API,
             "sha256Tabela": ibge_hash, "municipios": ibge_rows, "sha256Arquivo": sha256_file(ibge_path),
             "obtidoEm": datetime.fromtimestamp(ibge_path.stat().st_mtime, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")},
    "divergencias": {"t1ValidosAcimaDaSomaDosCandidatos": t1_div},
}
(ROOT / "data/provenance.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

ext_keys = ("aptos", "comparecimento", "validos", "lula", "flavio", "outros", "brancos", "nulos", "abstencoes")
ext = {t: ", ".join(f"{k}: {tse['ufs']['ZZ'][t][k]}" for k in ext_keys) for t in ("t1", "t2")}

out = f'''/**
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
{(","+chr(10)).join(lines)}
]);

export const EXTERIOR_DATA = Object.freeze({{
  t1: Object.freeze({{ {ext["t1"]} }}),
  t2: Object.freeze({{ {ext["t2"]} }})
}});

/** Prova de origem das fontes (mesmo conteúdo de data/provenance.json) */
export const PROVENANCE = Object.freeze({json.dumps(provenance, ensure_ascii=False, indent=2)});
'''
mout = f'''/**
 * Votação do 1º e do 2º turno (TSE 2026) de todos os municípios, cruzada com o Censo IBGE 2022.
 * winT1 = vencedor do 1º turno; winner = vencedor do 2º turno.
 * ARQUIVO GERADO por scripts/build_app_data.py - não editar à mão.
 * ibge = código IBGE de 7 dígitos; pop/ibge = null para municípios instalados após o Censo 2022.
 */
export const MUNICIPALITIES_DATA = Object.freeze([
{(","+chr(10)).join(mlines)}
]);
'''
# Zonas eleitorais: chave "UF-codigoTSE"; cada turno vira um vetor na ordem de ZONE_FIELDS
ZONE_FIELDS = ["aptos", "comparecimento", "abstencoes", "validos", "brancos", "nulos", "lula", "flavio", "outros"]
zone_map = {}
for m in tse["municipios"]:
    if m["uf"] == "ZZ":
        continue
    zs = {}
    for z in m["zonas"]:
        zs.setdefault(z["zona"], {})[f't{z["turno"]}'] = [z[f] for f in ZONE_FIELDS]
    zone_map[f'{m["uf"]}-{m["cd"]}'] = [{"z": zn, **t} for zn, t in sorted(zs.items())]
zout = f'''/**
 * Zonas eleitorais de cada município (TSE 2026, Presidente), por turno.
 * ARQUIVO GERADO por scripts/build_app_data.py - não editar à mão.
 * Chave: "UF-codigoTSE" (campo tse dos municípios). t1/t2 = valores na ordem de ZONE_FIELDS.
 */
export const ZONE_FIELDS = Object.freeze({json.dumps(ZONE_FIELDS)});
export const ZONES_DATA = Object.freeze({json.dumps(zone_map, separators=(",", ":"))});
'''

data_dir = ROOT / "src/infrastructure/data"
(data_dir / "BrazilZonesData.js").write_text(zout, encoding="utf-8")
(data_dir / "BrazilElectionData.js").write_text(out, encoding="utf-8")
(data_dir / "BrazilMunicipalitiesData.js").write_text(mout, encoding="utf-8")
print("UFs:", len(lines), "| municípios no app:", len(mlines), "| sem população no Censo 2022:", unmatched)
