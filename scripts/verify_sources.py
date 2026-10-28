#!/usr/bin/env python3
"""
Confere as fontes oficiais contra a prova de origem do painel (data/provenance.json).

Uso:
  python3 scripts/verify_sources.py                      # confere os arquivos em data/
  python3 scripts/verify_sources.py --tse-dir PASTA      # CSVs extraídos dos pacotes do TSE baixados por você
  python3 scripts/verify_sources.py --fetch-ibge         # baixa a tabela do IBGE direto da API e confere

TSE: o hash é do CSV exatamente como sai do .zip oficial. O TSE republica os pacotes; um pacote
mais novo que a data "obtidoEm" pode ter outro hash, e isso não indica adulteração do painel.
IBGE: a API devolve metadados em ordem variável, então o hash confere só a tabela usada
(linhas 'codigo_ibge;populacao' ordenadas pelo código).
Sai com código 1 se algum hash não bater.
"""
import argparse, gzip, hashlib, json, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
prov = json.loads((ROOT / "data/provenance.json").read_text(encoding="utf-8"))


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def ibge_table_sha256(doc):
    rows = sorted((x["localidade"]["id"], x["serie"]["2022"]) for x in doc[0]["resultados"][0]["series"])
    return hashlib.sha256("".join(f"{i};{p}\n" for i, p in rows).encode("utf-8")).hexdigest()


ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--tse-dir", type=Path, default=ROOT / "data/tse_raw")
ap.add_argument("--fetch-ibge", action="store_true")
args = ap.parse_args()

ok = True


def report(label, expected, actual):
    global ok
    if actual is None:
        print(f"[--] {label}: arquivo ausente, não conferido")
        return
    match = expected == actual
    ok &= match
    print(f"[{'OK' if match else 'FALHOU'}] {label}\n      esperado {expected}\n      obtido   {actual}")


for src in prov["tse"]:
    path = args.tse_dir / src["arquivo"]
    report(f"TSE {src['arquivo']} (pacote {src['pacote']})", src["sha256"], sha256_file(path) if path.exists() else None)

ds = ROOT / prov["tseDataset"]["arquivo"]
report("JSON intermediário do TSE", prov["tseDataset"]["sha256"], sha256_file(ds) if ds.exists() else None)

if args.fetch_ibge:
    with urllib.request.urlopen(prov["ibge"]["api"], timeout=120) as r:
        raw = r.read()
    if raw[:2] == b"\x1f\x8b":  # a API responde em gzip mesmo sem Accept-Encoding
        raw = gzip.decompress(raw)
    ibge_doc = json.loads(raw.decode("utf-8"))
    label = "IBGE (baixado agora da API)"
else:
    ibge_doc = json.loads((ROOT / "data/ibge_raw_pop_munic.json").read_text(encoding="utf-8"))
    label = "IBGE (data/ibge_raw_pop_munic.json)"
report(label, prov["ibge"]["sha256Tabela"], ibge_table_sha256(ibge_doc))

print("\nResultado:", "todas as fontes conferem" if ok else "há divergências")
sys.exit(0 if ok else 1)
