#!/usr/bin/env python3
"""
ETL TSE 2026 - Presidente (1º e 2º turnos), por UF > município > zona.
Entrada : data/tse_raw/votacao_candidato_munzona_2026_BR.csv
          data/tse_raw/detalhe_votacao_secao_2026_BR.csv  (agregado por município/zona;
          o detalhe munzona só traz 1º turno)
Saída   : data/tse_2026_presidente.json
Valida  : soma candidatos == votos válidos; comparecimento + abstenção == aptos;
          válidos + brancos + nulos == comparecimento.
"""
import csv, json, sys, collections, hashlib
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "tse_raw"
OUT = ROOT / "data" / "tse_2026_presidente.json"

CAND = {"LULA": "lula", "FLAVIO BOLSONARO": "flavio"}

# Pacotes oficiais de onde cada CSV foi extraído (Portal de Dados Abertos do TSE)
SOURCES = {
    "votacao_candidato_munzona_2026_BR.csv":
        "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2026.zip",
    "detalhe_votacao_secao_2026_BR.csv":
        "https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2026.zip",
}


def provenance(path, url):
    """Prova de origem: SHA-256 do CSV exatamente como extraído do pacote, tamanho e data do arquivo local."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    st = path.stat()
    return dict(arquivo=path.name, pacote=url, sha256=h.hexdigest(), bytes=st.st_size,
                obtido_em=datetime.fromtimestamp(st.st_mtime, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))


def rd(path):
    with open(path, encoding="latin1", newline="") as f:
        yield from csv.DictReader(f, delimiter=";")


def new():
    return collections.defaultdict(int)


# chave: (turno, uf, cd_municipio, zona)
votes = collections.defaultdict(new)
for r in rd(RAW / "votacao_candidato_munzona_2026_BR.csv"):
    if r["DS_CARGO"] != "Presidente":
        continue
    k = (int(r["NR_TURNO"]), r["SG_UF"], int(r["CD_MUNICIPIO"]), int(r["NR_ZONA"]))
    v = int(r["QT_VOTOS_NOMINAIS_VALIDOS"])
    votes[k]["validos_cand"] += v
    votes[k][CAND.get(r["NM_URNA_CANDIDATO"], "outros")] += v
    votes[k]["_nm"] = r["NM_MUNICIPIO"]

det = collections.defaultdict(new)
for r in rd(RAW / "detalhe_votacao_secao_2026_BR.csv"):
    if r["DS_CARGO"] != "Presidente":
        continue
    k = (int(r["NR_TURNO"]), r["SG_UF"], int(r["CD_MUNICIPIO"]), int(r["NR_ZONA"]))
    d = det[k]
    d["aptos"] += int(r["QT_APTOS"])
    d["comparecimento"] += int(r["QT_COMPARECIMENTO"])
    d["abstencoes"] += int(r["QT_ABSTENCOES"])
    d["validos"] += int(r["QT_VOTOS_NOMINAIS"]) + int(r["QT_VOTOS_LEGENDA"])
    d["brancos"] += int(r["QT_VOTOS_BRANCOS"])
    d["nulos"] += int(r["QT_VOTOS_NULOS"])
    d["_nm"] = r["NM_MUNICIPIO"]

errors = []

keys = sorted(set(votes) | set(det))
rows = []
for k in keys:
    t, uf, cd, zn = k
    v, d = votes.get(k, {}), det.get(k, {})
    row = dict(turno=t, uf=uf, cd=cd, zona=zn, nome=(d.get("_nm") or v.get("_nm")),
               aptos=d.get("aptos", 0), comparecimento=d.get("comparecimento", 0),
               abstencoes=d.get("abstencoes", 0), validos=d.get("validos", 0),
               brancos=d.get("brancos", 0), nulos=d.get("nulos", 0),
               lula=v.get("lula", 0), flavio=v.get("flavio", 0), outros=v.get("outros", 0))
    # Invariantes por linha (município/zona)
    if row["comparecimento"] + row["abstencoes"] != row["aptos"]:
        errors.append(f"comp+abst!=aptos {k}")
    if row["validos"] != v.get("validos_cand", 0):
        errors.append(f"validos(detalhe)!={v.get('validos_cand', 0)} (candidatos) {k}")
    if row["validos"] + row["brancos"] + row["nulos"] != row["comparecimento"]:
        errors.append(f"validos+brancos+nulos!=comparecimento {k}")
    rows.append(row)

FIELDS = ["aptos", "comparecimento", "abstencoes", "validos", "brancos", "nulos", "lula", "flavio", "outros"]


def agg(group_key):
    out = collections.defaultdict(lambda: collections.defaultdict(int))
    for r in rows:
        for f in FIELDS:
            out[group_key(r)][f] += r[f]
    return out


ufs = {}
for (t, uf), a in agg(lambda r: (r["turno"], r["uf"])).items():
    ufs.setdefault(uf, {})[f"t{t}"] = dict(a)

muns = {}
for r in rows:
    mk = (r["uf"], r["cd"])
    m = muns.setdefault(mk, dict(uf=r["uf"], cd=r["cd"], nome=r["nome"], t1={}, t2={}, zonas=[]))
    m["zonas"].append({k: r[k] for k in ["turno", "zona"] + FIELDS})
for m in muns.values():
    for t in (1, 2):
        zs = [z for z in m["zonas"] if z["turno"] == t]
        m[f"t{t}"] = {f: sum(z[f] for z in zs) for f in FIELDS}

nat = {t: {f: sum(r[f] for r in rows if r["turno"] == t) for f in FIELDS} for t in (1, 2)}

doc = dict(
    meta=dict(fonte="TSE - Dados Abertos (votacao_candidato_munzona_2026 + detalhe_votacao_secao_2026)",
              fontes=[provenance(RAW / nome, url) for nome, url in SOURCES.items()],
              gerado_em=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
              cargo="Presidente", gerado_por="scripts/build_tse_dataset.py",
              exterior_uf="ZZ", total_municipios=len([m for m in muns.values() if m["uf"] != "ZZ"])),
    nacional={f"t{t}": nat[t] for t in (1, 2)},
    ufs=ufs,
    municipios=sorted(muns.values(), key=lambda m: (m["uf"], m["nome"])),
)
OUT.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

print("linhas mun/zona:", len(rows), "| municipios:", doc["meta"]["total_municipios"], "| UFs:", len(ufs))
print("erros de invariante:", len(errors))
for e in errors[:15]:
    print("  ", e)
for t in (1, 2):
    n = nat[t]
    print(f"T{t} nacional:", n)
print("arquivo:", OUT, OUT.stat().st_size // 1024, "KB")
sys.exit(1 if errors else 0)
