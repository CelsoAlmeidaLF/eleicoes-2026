#!/usr/bin/env python3
"""
Auditoria estatística dos arquivos oficiais do TSE (presidente, 2026) para a aba "Notícias".

Lê os três arquivos brutos de data/tse_raw/ e grava src/infrastructure/data/AuditoriaData.js:
  detalhe_votacao_secao_2026_BR.csv       (por urna: aptos, comparecimento, votos, modelo, hora do boletim)
  votacao_secao_2026_BR.csv               (por urna e candidato)
    https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2026_BR.zip
  votacao_candidato_munzona_2026_BR.csv   (por zona e candidato, versão totalizada)

Os testes procuram sinais conhecidos de manipulação: contas que não fecham, urnas com comparecimento
perto de 100%, boletins atrasados, efeito do modelo de urna, votações extremas, viradas atípicas,
assinatura de "enchimento" (comparecimento alto junto de voto concentrado) e divergência entre arquivos.
Anomalia estatística não é prova de fraude; os textos da aba dizem isso.

Uso: python3 scripts/build_auditoria.py
"""
import csv, json, hashlib, collections, statistics as st
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "tse_raw"
OUT = ROOT / "src" / "infrastructure" / "data" / "AuditoriaData.js"
DET = RAW / "detalhe_votacao_secao_2026_BR.csv"
VS = RAW / "votacao_secao_2026_BR.csv"
MZ = RAW / "votacao_candidato_munzona_2026_BR.csv"
PACOTES = {
    DET.name: "https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2026.zip",
    VS.name: "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2026_BR.zip",
    MZ.name: "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2026.zip",
}
LULA, FLAVIO = "LUIZ INÁCIO LULA DA SILVA", "FLAVIO NANTES BOLSONARO"
NAO_NOMINAL = {"VOTO BRANCO", "VOTO NULO"}


def linhas(path):
    with open(path, encoding="latin1", newline="") as f:
        for r in csv.DictReader(f, delimiter=";"):
            if r["DS_CARGO"] == "Presidente":
                yield r


def n(r, k):
    return int(r[k] or 0)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 22), b""):
            h.update(chunk)
    return h.hexdigest()


def gerado_em(path):
    r = next(linhas(path))
    return f'{r["DT_GERACAO"]} {r["HH_GERACAO"]}'


def pct(a, b, casas=2):
    return round(a / b * 100, casas) if b else 0.0


# ───────── 1. Arquivo por urna (detalhe) ─────────
urnas = {}           # (t, uf, mun, zona, secao) -> dict
contas = collections.Counter()
origem = collections.Counter()
modelo = collections.defaultdict(lambda: [0, 0, 0])
atraso = collections.defaultdict(list)
for r in linhas(DET):
    t = int(r["NR_TURNO"])
    k = (t, r["SG_UF"], r["CD_MUNICIPIO"], r["NR_ZONA"], r["NR_SECAO"])
    if k in urnas:
        contas[(t, "repetidas")] += 1
        continue
    ap, co, ab = n(r, "QT_APTOS"), n(r, "QT_COMPARECIMENTO"), n(r, "QT_ABSTENCOES")
    soma = sum(n(r, c) for c in ("QT_VOTOS_NOMINAIS", "QT_VOTOS_BRANCOS", "QT_VOTOS_NULOS", "QT_VOTOS_LEGENDA", "QT_VOTOS_ANULADOS_APU_SEP"))
    instalada = r["ST_SECAO_INSTALADA"] == "Sim"
    urnas[k] = dict(ap=ap, co=co, nom=n(r, "QT_VOTOS_NOMINAIS"), inst=instalada, modelo=r["DS_MODELO_URNA"])
    contas[(t, "urnas")] += 1
    contas[(t, "nao_instaladas")] += not instalada
    contas[(t, "comp_maior_aptos")] += co > ap
    contas[(t, "aptos_nao_fecha")] += instalada and ap != co + ab
    contas[(t, "votos_nao_fecham")] += co != soma
    origem[(t, r["DS_ORIGEM_VOTO"])] += 1
    m = modelo[(t, r["DS_MODELO_URNA"])]
    m[0] += 1; m[1] += ap; m[2] += co
    try:
        rec = datetime.strptime(r["DT_RECEBIMENTO_BU_HOR_TSE"], "%d/%m/%Y %H:%M:%S")
        fim = datetime.strptime(r["DT_ELEICAO"] + " 17:00:00", "%d/%m/%Y %H:%M:%S")
        atraso[t].append((rec - fim).total_seconds() / 3600)
    except ValueError:
        pass

# ───────── 2. Arquivo por urna e candidato ─────────
voto = collections.defaultdict(collections.Counter)  # urna -> candidato -> votos
local = {}
for r in linhas(VS):
    k = (int(r["NR_TURNO"]), r["SG_UF"], r["CD_MUNICIPIO"], r["NR_ZONA"], r["NR_SECAO"])
    voto[k][r["NM_VOTAVEL"]] += n(r, "QT_VOTOS")
    local[k[1:]] = (r["NM_MUNICIPIO"], r["NM_LOCAL_VOTACAO"])

nome_zona = {k[:3]: v[0] for k, v in local.items()}   # (uf, mun, zona) -> nome do município

# ───────── 3. Arquivo por zona (totalizado) ─────────
zona_cand = collections.Counter()
nome_urna = {}
for r in linhas(MZ):
    t = int(r["NR_TURNO"])
    zona_cand[(t, r["SG_UF"], r["CD_MUNICIPIO"], r["NR_ZONA"], r["NM_CANDIDATO"])] += n(r, "QT_VOTOS_NOMINAIS")
    nome_urna[r["NM_CANDIDATO"]] = r["NM_URNA_CANDIDATO"]

# ───────── Testes ─────────
res = {}

# Totais e margem
for t in (1, 2):
    lt = sum(v[LULA] for k, v in voto.items() if k[0] == t)
    ft = sum(v[FLAVIO] for k, v in voto.items() if k[0] == t)
    res[f"t{t}"] = dict(
        urnas=contas[(t, "urnas")],
        aptos=sum(u["ap"] for k, u in urnas.items() if k[0] == t),
        comparecimento=sum(u["co"] for k, u in urnas.items() if k[0] == t),
        lula=lt, flavio=ft)
res["margem2"] = res["t2"]["lula"] - res["t2"]["flavio"]

res["contas"] = {f"t{t}": dict(
    repetidas=contas[(t, "repetidas")], comparecimentoMaiorQueAptos=contas[(t, "comp_maior_aptos")],
    aptosNaoFecham=contas[(t, "aptos_nao_fecha")], votosNaoFecham=contas[(t, "votos_nao_fecham")],
    naoInstaladas=contas[(t, "nao_instaladas")]) for t in (1, 2)}

# Comparecimento por urna: distribuição e urnas >= 98%
hist = {}
for t in (1, 2):
    faixas = collections.Counter()
    for k, u in urnas.items():
        if k[0] == t and u["inst"] and u["ap"]:
            faixas[min(int(u["co"] / u["ap"] * 20), 20) * 5] += 1
    tot = sum(faixas.values())
    hist[f"t{t}"] = [[f, pct(faixas[f], tot, 2)] for f in range(40, 101, 5)]
res["comparecimentoHistograma"] = hist
res["urnasComparecimento98"] = {f"t{t}": sum(1 for k, u in urnas.items() if k[0] == t and u["inst"] and u["ap"] >= 50 and u["co"] / u["ap"] >= 0.98) for t in (1, 2)}

# Hora do boletim
res["boletins"] = {f"t{t}": dict(medianaHoras=round(st.median(a), 2), maximoHoras=round(max(a), 1), depoisDe24h=sum(h > 24 for h in a))
                   for t, a in sorted(atraso.items())}
res["origemBoletins"] = {f"t{t}": {o: q for (tt, o), q in origem.items() if tt == t} for t in (1, 2)}

# Modelo de urna: comparecimento e correlação dentro da UF (zona: fração de urnas 2013/2015 x fatia de Flávio)
res["modelos"] = {f"t{t}": {mo: dict(urnas=v[0], comparecimento=pct(v[2], v[1])) for (tt, mo), v in sorted(modelo.items()) if tt == t and v[1]} for t in (1, 2)}
zona = collections.defaultdict(lambda: [0, 0, 0, 0])   # (uf, mun, zona) -> [urnas, antigas, lula, flavio] no 2º turno
for k, u in urnas.items():
    if k[0] != 2:
        continue
    z = zona[k[1:4]]
    z[0] += 1; z[1] += u["modelo"] in ("UE 2013", "UE 2015")
    z[2] += voto[k][LULA]; z[3] += voto[k][FLAVIO]
por_uf = collections.defaultdict(list)
for (uf, *_), (u, a, l, f) in zona.items():
    if l + f >= 1000:
        por_uf[uf].append((a / u, f / (l + f)))
corr = {}
for uf, xs in por_uf.items():
    if len(xs) >= 8 and st.pstdev([x for x, _ in xs]) > 0:
        corr[uf] = round(st.correlation([x for x, _ in xs], [y for _, y in xs]), 2)
res["modeloUrnaCorrelacao"] = dict(porUF=dict(sorted(corr.items())), mediana=round(st.median(corr.values()), 2),
                                   positivas=sum(c > 0 for c in corr.values()), negativas=sum(c < 0 for c in corr.values()))

# Votação extrema: urnas com 100% para um candidato (2º turno, >= 50 votos)
base2 = [(k, v[LULA], v[FLAVIO]) for k, v in voto.items() if k[0] == 2 and v[LULA] + v[FLAVIO] >= 50]
cem = [(k, l, f) for k, l, f in base2 if l == 0 or f == 0]
indig = sum(1 for k, *_ in cem if "INDIGENA" in local[k[1:]][1].upper().replace("Í", "I"))
res["urnas100"] = dict(total=len(cem), base=len(base2), lula=sum(f == 0 for *_, f in cem), flavio=sum(l == 0 for _, l, _ in cem),
                       emEscolaIndigena=indig, porUF=dict(collections.Counter(k[1] for k, *_ in cem).most_common(6)),
                       exemplos=[dict(municipio=local[k[1:]][0], uf=k[1], local=local[k[1:]][1].title(), lula=l, flavio=f)
                                 for k, l, f in sorted(cem, key=lambda x: -(x[1] + x[2]))[:5]])

# Zonas com >= 90% para um candidato (2º turno, >= 1.000 votos)
z90 = []
for (uf, mun, zn), (u, a, l, f) in zona.items():
    if l + f >= 1000 and max(l, f) / (l + f) >= 0.90:
        z90.append(dict(uf=uf, municipio=nome_zona.get((uf, mun, zn), "?"), candidato="Lula" if l > f else "Flávio", pct=pct(max(l, f), l + f, 1)))
res["zonas90"] = dict(total=len(z90), lula=sum(z["candidato"] == "Lula" for z in z90), flavio=sum(z["candidato"] == "Flávio" for z in z90))

# Virada entre turnos por zona (fatia de Flávio em Lula+Flávio) e, nas atípicas, urna a urna
zt = collections.defaultdict(lambda: [0, 0, 0, 0])   # (uf, mun, zona) -> [l1, f1, l2, f2]
for k, v in voto.items():
    z = zt[k[1:4]]
    i = 0 if k[0] == 1 else 2
    z[i] += v[LULA]; z[i + 1] += v[FLAVIO]
var = []
for zk, (l1, f1, l2, f2) in zt.items():
    if l1 + f1 >= 1000 and l2 + f2 >= 1000:
        var.append((f2 / (l2 + f2) - f1 / (l1 + f1), zk))
mu, sd = st.mean(v for v, _ in var), st.pstdev(v for v, _ in var)
atipicas = []
for v, zk in sorted(var, key=lambda x: -abs((x[0] - mu) / sd)):
    if abs((v - mu) / sd) <= 4:
        break
    us = []
    for k, vv in voto.items():
        if k[0] == 1 and k[1:4] == zk:
            v2 = voto.get((2,) + k[1:])
            a1, a2 = vv[LULA] + vv[FLAVIO], (v2[LULA] + v2[FLAVIO]) if v2 else 0
            if a1 and a2:
                us.append(v2[FLAVIO] / a2 - vv[FLAVIO] / a1)
    mesma = max(sum(x > 0 for x in us), sum(x < 0 for x in us))
    atipicas.append(dict(uf=zk[0], municipio=nome_zona.get(zk, "?"), zona=zk[2], variacaoPp=round(v * 100, 1), desvios=round((v - mu) / sd, 1),
                         urnas=len(us), urnasMesmaDirecao=mesma))
res["viradaZonas"] = dict(zonas=len(var), mediaPp=round(mu * 100, 2), desvioPp=round(sd * 100, 2), atipicas=atipicas)

# Virada por urna
vu = []
for k, v in voto.items():
    if k[0] == 1:
        v2 = voto.get((2,) + k[1:])
        if v2 and v[LULA] + v[FLAVIO] >= 100 and v2[LULA] + v2[FLAVIO] >= 100:
            vu.append(v2[FLAVIO] / (v2[LULA] + v2[FLAVIO]) - v[FLAVIO] / (v[LULA] + v[FLAVIO]))
mu_u, sd_u = st.mean(vu), st.pstdev(vu)
res["viradaUrnas"] = dict(urnas=len(vu), mediaPp=round(mu_u * 100, 2), desvioPp=round(sd_u * 100, 2),
                          acimaDe5Desvios=sum(abs((x - mu_u) / sd_u) > 5 for x in vu))

# De onde vieram os votos ganhos no 2º turno (regressão por urna, sem intercepto; inferência ecológica)
GRUPOS = {"AUGUSTO JORGE CURY": "Augusto Cury", "RENAN ANTONIO FERREIRA DOS SANTOS": "Renan Santos",
          "RONALDO RAMOS CAIADO": "Ronaldo Caiado", "ROMEU ZEMA NETO": "Romeu Zema"}
ORIGENS = ["Augusto Cury", "Renan Santos", "Ronaldo Caiado", "Romeu Zema", "Demais candidatos", "Brancos e nulos do 1º turno", "Novos votantes"]
k_ = len(ORIGENS)
XtX = [[0.0] * k_ for _ in range(k_)]; XtL = [0.0] * k_; XtF = [0.0] * k_
total_origem = [0] * k_; ganhoL = ganhoF = 0
for k, v in voto.items():
    if k[0] != 1:
        continue
    v2 = voto.get((2,) + k[1:])
    if not v2:
        continue
    x = [0] * k_
    for c, q in v.items():
        if c in (LULA, FLAVIO):
            continue
        x[5 if c in NAO_NOMINAL else ORIGENS.index(GRUPOS.get(c, "Demais candidatos"))] += q
    x[6] = sum(v2.values()) - sum(v.values())
    dl, df = v2[LULA] - v[LULA], v2[FLAVIO] - v[FLAVIO]
    ganhoL += dl; ganhoF += df
    for i in range(k_):
        if x[i]:
            total_origem[i] += x[i]; XtL[i] += x[i] * dl; XtF[i] += x[i] * df
            for j in range(k_):
                XtX[i][j] += x[i] * x[j]


def resolver(A, b):
    """Mínimos quadrados pelas equações normais: eliminação de Gauss com pivoteamento parcial."""
    m = [row[:] + [b[i]] for i, row in enumerate(A)]
    for c in range(len(b)):
        p = max(range(c, len(b)), key=lambda r: abs(m[r][c]))
        m[c], m[p] = m[p], m[c]
        for r in range(len(b)):
            if r != c and m[c][c]:
                f = m[r][c] / m[c][c]
                m[r] = [a - f * b_ for a, b_ in zip(m[r], m[c])]
    return [m[i][-1] / m[i][i] for i in range(len(b))]


cL, cF = resolver(XtX, XtL), resolver(XtX, XtF)
validos1 = sum(sum(q for c, q in v.items() if c not in NAO_NOMINAL) for k, v in voto.items() if k[0] == 1)
validos2 = sum(sum(q for c, q in v.items() if c not in NAO_NOMINAL) for k, v in voto.items() if k[0] == 2)
outros1 = validos1 - res["t1"]["lula"] - res["t1"]["flavio"]
res["migracao"] = dict(
    ganhoLula=ganhoL, ganhoFlavio=ganhoF, votosTerceiros1=outros1, aumentoValidos=validos2 - validos1,
    disputados=outros1 + validos2 - validos1, fatiaLula=pct(ganhoL, ganhoL + ganhoF, 1),
    origens=[dict(origem=o, votos1=total_origem[i], paraLula=round(cL[i] * 100, 1), paraFlavio=round(cF[i] * 100, 1),
                  votosLula=round(cL[i] * total_origem[i])) for i, o in enumerate(ORIGENS)])

# Assinatura de enchimento: comparecimento x fatia de Lula, dentro do município (2º turno)
mun = collections.defaultdict(list)
for k, u in urnas.items():
    if k[0] == 2 and u["ap"] >= 50:
        l, f = voto[k][LULA], voto[k][FLAVIO]
        if l + f >= 50:
            mun[k[1:3]].append((u["co"] / u["ap"], l / (l + f)))
xs, ys = [], []
for us in mun.values():
    if len(us) >= 5:
        mx, my = st.mean(c for c, _ in us), st.mean(s for _, s in us)
        xs += [c - mx for c, _ in us]; ys += [s - my for _, s in us]
res["comparecimentoVotoMunicipio"] = dict(urnas=len(xs), correlacao=round(st.correlation(xs, ys), 3))

# Divergência entre os arquivos: urnas (26/10) x arquivo por zona totalizado
div = {}
for t in (1, 2):
    cand_urna = collections.Counter()
    for k, v in voto.items():
        if k[0] == t:
            for c, q in v.items():
                if c not in NAO_NOMINAL:
                    cand_urna[c] += q
    cand_zona = collections.Counter()
    for (tt, *_, c), q in zona_cand.items():
        if tt == t:
            cand_zona[c] += q
    difs = {c: cand_urna[c] - cand_zona[c] for c in set(cand_urna) | set(cand_zona) if cand_urna[c] != cand_zona[c]}
    zonas_dif = len({k[1:4] for k, v in voto.items() if k[0] == t for c in difs if v.get(c)})
    det_nom = sum(u["nom"] for k, u in urnas.items() if k[0] == t)
    div[f"t{t}"] = dict(nominaisUrnas=sum(cand_urna.values()), nominaisDetalhe=det_nom, nominaisZona=sum(cand_zona.values()),
                        candidatos=[dict(nome=c, nomeUrna=nome_urna.get(c, ""), diferenca=d) for c, d in difs.items()],
                        zonasComDiferenca=zonas_dif if difs else 0)
res["divergenciaArquivos"] = div

# Eleitores que mudaram de urna entre os turnos (voto em trânsito)
ganho = perda = 0
destino = collections.Counter()
for k, u in urnas.items():
    if k[0] == 1:
        u2 = urnas.get((2,) + k[1:])
        if u2:
            d = u2["ap"] - u["ap"]
            if d > 0:
                ganho += d
                if d >= 20:
                    destino[local.get(k[1:], ("?",))[0]] += 1
            else:
                perda -= d
res["mudancaDeUrna"] = dict(eleitores=ganho, saldo=ganho - perda,
                            urnasQuePerderam=sum(1 for k, u in urnas.items() if k[0] == 1 and (2,) + k[1:] in urnas and urnas[(2,) + k[1:]]["ap"] < u["ap"]),
                            urnasQueGanharam=sum(1 for k, u in urnas.items() if k[0] == 1 and (2,) + k[1:] in urnas and urnas[(2,) + k[1:]]["ap"] > u["ap"]),
                            principaisDestinos=[m for m, _ in destino.most_common(4)])

meta = dict(geradoEm=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), geradoPor="scripts/build_auditoria.py",
            arquivos=[dict(arquivo=p.name, pacote=PACOTES[p.name], geradoPeloTse=gerado_em(p), sha256=sha256(p), bytes=p.stat().st_size)
                      for p in (DET, VS, MZ)])
OUT.write_text(
    "/**\n * Auditoria estatística dos arquivos oficiais do TSE (presidente, 2026).\n"
    " * ARQUIVO GERADO por scripts/build_auditoria.py - não editar à mão.\n */\n"
    f"export const AUDITORIA = Object.freeze({json.dumps(dict(meta=meta, **res), ensure_ascii=False, indent=2)});\n",
    encoding="utf-8")
print(f"Gravado {OUT.relative_to(ROOT)} | margem 2º turno: {res['margem2']:,} | zonas atípicas: {len(atipicas)}".replace(",", "."))
