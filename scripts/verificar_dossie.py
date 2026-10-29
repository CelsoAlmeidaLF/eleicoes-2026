#!/usr/bin/env python3
"""
Reproduz, com os arquivos públicos do TSE, as alegações do "Relatório Pericial Independente"
(2º turno de 2026). Só lê arquivos; não grava nada. Python 3.10+, sem bibliotecas extras.

Arquivos em data/tse_raw/ (ou na pasta passada como argumento):
  bweb_2t/bweb_2t_UF_*.csv            Boletins de Urna do 2º turno, um por UF
      https://dadosabertos.tse.jus.br/dataset/resultados-2026-boletim-de-urna
  votacao_secao_2026_BR.csv           Votos por seção e candidato (1º turno)
      https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2026_BR.zip
  detalhe_votacao_secao_2026_BR.csv   Comparecimento por seção (1º turno)
      https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2026.zip

Uso:  python3 scripts/verificar_dossie.py [pasta]

O ponto central: cada seção é comparada com ela mesma no 1º turno. Uma seção que fechou tarde ou tem
muitos eleitores sem biometria só é suspeita se o voto nela mudou entre os turnos de um jeito diferente
das outras; votar mais em Lula nos dois turnos é geografia, não fraude.
"""
import collections
import csv
import glob
import math
import statistics as st
import sys
from datetime import datetime, timedelta
from pathlib import Path

RAW = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "data" / "tse_raw"
FUSO = {"AC": 2, "AM": 1, "RO": 1, "RR": 1, "MT": 1, "MS": 1}  # horas a somar para chegar ao horário de Brasília
LULA, FLAVIO = "LUIZ INÁCIO LULA DA SILVA", "FLAVIO NANTES BOLSONARO"
NUMERO = {"13": "l", "22": "f", "95": "b", "96": "n"}


def chave(r):
    return (r["SG_UF"], str(int(r["CD_MUNICIPIO"])), str(int(r["NR_ZONA"])), str(int(r["NR_SECAO"])))


def ler(arquivo):
    with open(arquivo, encoding="latin1", newline="") as f:
        yield from csv.DictReader(f, delimiter=";")


def br(n):
    return f"{n:,}".replace(",", ".")


def pct(a, b):
    return a / b * 100 if b else 0.0


# 2º turno: boletins de urna
bu = {}
for arq in sorted(glob.glob(str(RAW / "bweb_2t" / "bweb_2t_*.csv"))):
    for r in ler(arq):
        if r["DS_CARGO_PERGUNTA"] != "Presidente":
            continue
        d = bu.setdefault(chave(r), collections.Counter(
            co=int(r["QT_COMPARECIMENTO"] or 0), sb=int(r["QT_ELEI_BIOM_SEM_HABILITACAO"] or 0)))
        d.setdefault("en", r["DT_ENCERRAMENTO"])
        d[NUMERO.get(r["NR_VOTAVEL"], "x")] += int(r["QT_VOTOS"] or 0)
if not bu:
    sys.exit(f"Nenhum boletim em {RAW / 'bweb_2t'}; veja os arquivos no início do script.")

# 1º turno: votos e comparecimento por seção
t1 = collections.defaultdict(collections.Counter)
for r in ler(RAW / "votacao_secao_2026_BR.csv"):
    if r["DS_CARGO"] == "Presidente" and r["NR_TURNO"] == "1":
        n = r["NM_VOTAVEL"]
        t1[chave(r)]["l" if n == LULA else "f" if n == FLAVIO else "bn" if n in ("VOTO BRANCO", "VOTO NULO") else "o"] += int(r["QT_VOTOS"] or 0)
comp1 = {chave(r): int(r["QT_COMPARECIMENTO"] or 0) for r in ler(RAW / "detalhe_votacao_secao_2026_BR.csv")
         if r["DS_CARGO"] == "Presidente" and r["NR_TURNO"] == "1"}


def encerramento(k, d):
    try:
        return datetime.strptime(d["en"], "%Y-%m-%d %H:%M:%S") + timedelta(hours=FUSO.get(k[0], 0))
    except ValueError:
        return None


def lula(ks, turno):
    fonte = (lambda k: bu[k]) if turno == 2 else (lambda k: t1[k])
    return pct(sum(fonte(k)["l"] for k in ks), sum(fonte(k)["l"] + fonte(k)["f"] for k in ks))


nac = {k: d for k, d in bu.items() if k[0] != "ZZ"}
print(f"Boletins lidos: {br(len(bu))} seções de {len({k[0] for k in bu})} UFs (Roraima não foi publicado pelo TSE)\n")

print("== Alegação 2: seções que encerraram às 19h ou depois (horário de Brasília)")
pos19 = [k for k, d in nac.items() if (h := encerramento(k, d)) and h.hour >= 19]
print(f"   seções: {br(len(pos19))} | votos dessas seções no DIA INTEIRO: {br(sum(nac[k]['co'] for k in pos19))}")
print("   (é o comparecimento total da seção, não quantos votaram depois das 19h)")

print("\n== Alegação 3: % Lula por horário de encerramento, 2º turno x 1º turno nas MESMAS seções")
faixas = collections.defaultdict(list)
for k, d in nac.items():
    if h := encerramento(k, d):
        m = h.hour * 60 + h.minute
        faixas["até 17h00" if m <= 1020 else "17h01–17h15" if m <= 1035 else "17h16–18h59" if m < 1140 else "19h00 ou depois"].append(k)
for fx in ["até 17h00", "17h01–17h15", "17h16–18h59", "19h00 ou depois"]:
    ks = faixas[fx]
    print(f"   {fx:16s} {br(len(ks)):>8} seções | 2º turno {lula(ks, 2):5.2f}% | 1º turno {lula(ks, 1):5.2f}% | ganho {lula(ks, 2) - lula(ks, 1):+.2f} pp")

print("\n== Alegação 4: seções após 19h por UF x demais seções dos mesmos municípios")
pos19_set = set(pos19)
for uf in ["BA", "PE", "MA", "SP"]:
    tarde = [k for k in pos19 if k[0] == uf]
    muns = {k[1] for k in tarde}
    resto = [k for k in nac if k[0] == uf and k[1] in muns and k not in pos19_set]
    print(f"   {uf}: {br(len(tarde))} seções | após 19h {lula(tarde, 2):.2f}% (1º turno {lula(tarde, 1):.2f}%)"
          f" | demais seções dos mesmos municípios {lula(resto, 2):.2f}% (1º turno {lula(resto, 1):.2f}%)")

print("\n== Alegações 5 e 6: eleitores sem biometria")
sb, co = sum(d["sb"] for d in bu.values()), sum(d["co"] for d in bu.values())
margem = sum(d["l"] - d["f"] for d in bu.values())
print(f"   {br(sb)} de {br(co)} ({pct(sb, co):.2f}%) | margem nos boletins {br(margem)} | razão {sb / margem:.2f}")

print("\n== Alegação 7: % sem biometria x % Lula por seção (seções com 50+ votos)")
por_mun = collections.defaultdict(list)
for k, d in nac.items():
    v1 = t1[k]["l"] + t1[k]["f"]
    if d["co"] >= 50 and d["l"] + d["f"] >= 50 and v1 >= 50:
        por_mun[k[:2]].append((d["sb"] / d["co"], d["l"] / (d["l"] + d["f"]), t1[k]["l"] / v1))
todas = [s for ss in por_mun.values() for s in ss]
dx, dy, dg = [], [], []
for ss in por_mun.values():
    if len(ss) >= 5:
        mx, my, m1 = (st.mean(s[i] for s in ss) for i in range(3))
        dx += [s[0] - mx for s in ss]
        dy += [s[1] - my for s in ss]
        dg += [(s[1] - s[2]) - (my - m1) for s in ss]
print(f"   sem controle: {st.correlation([s[0] for s in todas], [s[1] for s in todas]):+.3f}"
      f" | dentro do município: {st.correlation(dx, dy):+.3f}"
      f" | contra o ganho de Lula entre os turnos: {st.correlation(dx, dg):+.3f}")

print("\n== Alegação 8: Benford nos votos por seção — observado % (esperado por Benford %)")
benford1 = {str(d): math.log10(1 + 1 / d) * 100 for d in range(1, 10)}
benford2 = {str(d): sum(math.log10(1 + 1 / (10 * i + d)) for i in range(1, 10)) * 100 for d in range(10)}
for nome, c in (("Lula", "l"), ("Flávio", "f")):
    for pos, esperado in ((0, benford1), (1, benford2)):
        digitos = collections.Counter(str(d[c])[pos] for d in bu.values() if d[c] > 0 and len(str(d[c])) > pos)
        total = sum(digitos.values())
        print(f"   {nome:6s} {pos + 1}º dígito " + " ".join(f"{g}:{digitos[g] / total * 100:.1f}({p:.1f})" for g, p in esperado.items()))
print("   (uma seção tem no máximo ~400 eleitores: o 1º dígito não segue Benford para nenhum candidato)")

print("\n== Alegação 10: seções com votos para um só candidato")
so_l = [k for k, d in bu.items() if d["l"] > 0 and d["f"] == 0]
so_f = [k for k, d in bu.items() if d["f"] > 0 and d["l"] == 0]
print(f"   só Lula: {len(so_l)} | só Flávio: {len(so_f)} | UFs (só Lula): {collections.Counter(k[0] for k in so_l).most_common(6)}")

print("\n== Pista P4: o ganho de Lula entre os turnos cabe no que havia em cada seção?")
estouradas, comparadas = [], 0
for k, d in nac.items():
    if k not in t1 or k not in comp1:
        continue
    comparadas += 1
    ganho = d["l"] - t1[k]["l"]
    disponivel = t1[k]["o"] + t1[k]["bn"] + max(0, d["co"] - comp1[k]) + max(0, t1[k]["f"] - d["f"])
    if ganho > disponivel:
        estouradas.append(k)
print(f"   seções comparadas: {br(comparadas)} | seções em que o ganho supera terceiros + brancos/nulos"
      f" + novos votantes + votos perdidos por Flávio: {len(estouradas)}")
for k in estouradas[:10]:
    print("     ", k)
