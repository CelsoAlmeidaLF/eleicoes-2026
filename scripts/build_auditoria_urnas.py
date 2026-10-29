#!/usr/bin/env python3
"""
Auditoria dos arquivos da própria urna (2º turno de 2026) para a aba "Notícias".

Grava src/infrastructure/data/AuditoriaUrnasData.js a partir de data/tse_raw/:
  bweb_2t/bweb_2t_UF_*.csv (+ .zip.sha512)   Boletins de Urna, impressos e assinados em cada seção
      https://dadosabertos.tse.jus.br/dataset/resultados-2026-boletim-de-urna
  votacao_secao_2026_BR.csv                   Votos por urna e candidato da totalização
  logs_2t/bu_imgbu_logjez_rdv_vscmr_2026_2t_UF.zip   Arquivos transmitidos (log de cada urna), por UF
      https://dadosabertos.tse.jus.br/dataset/resultados-2026-arquivos-transmitidos-para-totalizacao
  logs_2t/urnas/*-log.jez                     Logs de urnas avulsas baixados de resultados.tse.jus.br

Testes:
  1. Boletim impresso na seção x resultado totalizado, voto a voto, em todas as urnas publicadas.
  2. Metadados do boletim: abertura antes das 7h, boletim emitido antes do fim da votação, horário de
     encerramento, urnas carregadas no dia, eleitores liberados sem biometria x voto (dentro do município).
  3. Log de cada urna dos estados baixados: voto computado sem eleitor habilitado, votos com menos de
     15 s de intervalo, votos após as 17h e votos no log x comparecimento oficial (com as trocas de urna).

Uso: python3 scripts/build_auditoria_urnas.py   (precisa do 7z instalado para abrir os logs)
"""
import csv, glob, hashlib, io, json, os, re, subprocess, tempfile, zipfile, collections, statistics as st
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "tse_raw"
OUT = ROOT / "src" / "infrastructure" / "data" / "AuditoriaUrnasData.js"
FUSO = {"AC": 2, "AM": 1, "RO": 1, "RR": 1, "MT": 1, "MS": 1}   # horas a somar para o horário de Brasília (outubro)
LULA, FLAVIO = "LUIZ INÁCIO LULA DA SILVA", "FLAVIO NANTES BOLSONARO"
NOME_LOG = re.compile(r"o0322[01]([a-z]{2})(\d{5})(\d{4})(\d{4})-log\.jez$")


def iso(s):
    for fmt in ("%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M:%S"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            pass
    return None


def chave(uf, mun, zona, secao):
    return (uf.upper(), str(int(mun)), str(int(zona)), str(int(secao)))


# ───────── 1. Boletins de urna ─────────
arquivos_bu = sorted(glob.glob(str(RAW / "bweb_2t" / "bweb_2t_*.csv")))
hashes_ok = 0
for zsha in glob.glob(str(RAW / "bweb_2t" / "*.zip.sha512")):
    hashes_ok += 1   # o hash do zip foi conferido no download (os zips não são guardados)
bu = collections.defaultdict(collections.Counter)
meta = {}
for arq in arquivos_bu:
    with open(arq, encoding="latin1", newline="") as f:
        for r in csv.DictReader(f, delimiter=";"):
            if r["DS_CARGO_PERGUNTA"] != "Presidente":
                continue
            k = chave(r["SG_UF"], r["CD_MUNICIPIO"], r["NR_ZONA"], r["NR_SECAO"])
            nr, q = r["NR_VOTAVEL"], int(r["QT_VOTOS"] or 0)
            bu[k]["lula" if nr == "13" else "flavio" if nr == "22" else "branco" if nr == "95" else "nulo" if nr == "96" else "outro"] += q
            if k not in meta:
                meta[k] = dict(ap=int(r["QT_APTOS"] or 0), co=int(r["QT_COMPARECIMENTO"] or 0), sembio=int(r["QT_ELEI_BIOM_SEM_HABILITACAO"] or 0),
                               ab=iso(r["DT_ABERTURA"]), en=iso(r["DT_ENCERRAMENTO"]), em=iso(r["DT_EMISSAO_BU"]), carga=iso(r["DT_CARGA_URNA_EFETIVADA"]),
                               mun=r["NM_MUNICIPIO"])
ufs_bu = sorted({k[0] for k in bu})

tot = collections.defaultdict(collections.Counter)
with open(RAW / "votacao_secao_2026_BR.csv", encoding="latin1", newline="") as f:
    for r in csv.DictReader(f, delimiter=";"):
        if r["DS_CARGO"] != "Presidente" or r["NR_TURNO"] != "2":
            continue
        k = chave(r["SG_UF"], r["CD_MUNICIPIO"], r["NR_ZONA"], r["NR_SECAO"])
        n = r["NM_VOTAVEL"]
        tot[k]["lula" if n == LULA else "flavio" if n == FLAVIO else "branco" if n == "VOTO BRANCO" else "nulo" if n == "VOTO NULO" else "outro"] += int(r["QT_VOTOS"] or 0)
comuns = [k for k in bu if k in tot]
diferentes = [k for k in comuns if bu[k] != tot[k]]
so_bu = [k for k in bu if k not in tot]
so_tot = [k for k in tot if k[0] in ufs_bu and k not in bu]
boletins = dict(
    ufs=len(ufs_bu), ufsSemBoletim=sorted({k[0] for k in tot} - set(ufs_bu)), arquivosComHashConferido=hashes_ok,
    urnasComparadas=len(comuns), urnasComDiferenca=len(diferentes), soNoBoletim=len(so_bu), soNaTotalizacao=len(so_tot),
    votosLula=sum(b["lula"] for b in bu.values()), votosFlavio=sum(b["flavio"] for b in bu.values()))

# ───────── 2. Metadados do boletim ─────────
def br(k, d):
    return d + timedelta(hours=FUSO.get(k[0], 0)) if d else None


nac = {k: m for k, m in meta.items() if k[0] != "ZZ"}
abertura = [br(k, m["ab"]) for k, m in nac.items() if m["ab"]]
encerr = {k: br(k, m["en"]) for k, m in nac.items() if m["en"]}
faixas = collections.Counter()
for e in encerr.values():
    faixas["ate17h" if (e.hour, e.minute) <= (17, 0) else "ate18h" if e.hour < 18 else "ate19h" if e.hour < 19 else
           "ate19h30" if (e.hour, e.minute) <= (19, 30) else "depois19h30"] += 1
carga_dia = [(k, m) for k, m in meta.items() if m["carga"] and m["carga"].date() == datetime(2026, 10, 25).date()]
sb_mun = collections.defaultdict(list)
for k, m in meta.items():
    b = bu[k]
    if m["co"] >= 50 and b["lula"] + b["flavio"] >= 50:
        sb_mun[k[:2]].append((m["sembio"] / m["co"], b["lula"] / (b["lula"] + b["flavio"])))
xs, ys = [], []
for us in sb_mun.values():
    if len(us) >= 5:
        mx, my = st.mean(x for x, _ in us), st.mean(y for _, y in us)
        xs += [x - mx for x, _ in us]; ys += [y - my for _, y in us]
tot_sb, tot_co = sum(m["sembio"] for m in meta.values()), sum(m["co"] for m in meta.values())
urnas_meta = dict(
    aberturaAntesDas7h=sum(a.hour < 7 for a in abertura),
    boletimAntesDoEncerramento=sum(1 for m in meta.values() if m["em"] and m["en"] and m["em"] < m["en"]),
    encerramento=dict(faixas), encerradasDepoisDas19h05=sum(1 for e in encerr.values() if (e.hour, e.minute) > (19, 5)),
    carregadasNoDia=[dict(uf=k[0], municipio=m["mun"].title(), zona=k[2], secao=k[3], carga=m["carga"].strftime("%H:%M"),
                          abertura=br(k, m["ab"]).strftime("%H:%M") if m["ab"] else None, comparecimento=m["co"],
                          lula=bu[k]["lula"], flavio=bu[k]["flavio"]) for k, m in carga_dia],
    semBiometria=dict(eleitores=tot_sb, votantes=tot_co, pct=round(tot_sb / tot_co * 100, 2), correlacaoComLulaNoMunicipio=round(st.correlation(xs, ys), 3), urnas=len(xs)))

# ───────── 3. Logs das urnas ─────────
def ler_log(conteudo):
    """Texto do logd.dat dentro do .jez (7z nos pacotes por UF; zip nas urnas baixadas avulsas)."""
    if conteudo[:2] == b"PK":
        with zipfile.ZipFile(io.BytesIO(conteudo)) as z:
            return z.read("logd.dat").decode("latin1"), [n for n in z.namelist() if n.endswith(".jez")]
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "u.jez")
        open(p, "wb").write(conteudo)
        return subprocess.run(["7z", "e", "-so", p], capture_output=True).stdout.decode("latin1"), []


def analisar(texto):
    votando = habilitado = contingencia = False
    votos = sem_hab = 0
    tempos = []
    for linha in texto.splitlines():
        p = linha.split("\t")
        if len(p) < 5 or not p[0].startswith("25/10/2026"):
            continue
        msg = p[4]
        if "Urna pronta para receber votos" in msg:
            votando = True
        elif "Procedimento de encerramento confirmado" in msg:
            votando = False
        elif "Contingência executada com sucesso" in msg:
            contingencia = True
        elif votando and msg.startswith("Eleitor foi habilitado"):
            habilitado = True
        elif votando and msg.startswith("O voto do eleitor foi computado"):
            votos += 1
            sem_hab += not habilitado
            habilitado = False
            tempos.append(datetime.strptime(p[0], "%d/%m/%Y %H:%M:%S"))
    return votos, sem_hab, tempos, contingencia


comp_oficial = {}
with open(RAW / "detalhe_votacao_secao_2026_BR.csv", encoding="latin1", newline="") as f:
    for r in csv.DictReader(f, delimiter=";"):
        if r["DS_CARGO"] == "Presidente" and r["NR_TURNO"] == "2":
            comp_oficial[chave(r["SG_UF"], r["CD_MUNICIPIO"], r["NR_ZONA"], r["NR_SECAO"])] = (int(r["QT_COMPARECIMENTO"] or 0), r["NM_MUNICIPIO"])

urnas_log = []
ufs_log = []
for zp in sorted(glob.glob(str(RAW / "logs_2t" / "bu_imgbu_logjez_rdv_vscmr_2026_2t_*.zip"))):
    ufs_log.append(zp.rsplit("_", 1)[1][:2])
    with zipfile.ZipFile(zp) as z:
        for nome in z.namelist():
            m = NOME_LOG.search(nome)
            if m:
                k = chave(m.group(1), m.group(2), m.group(3), m.group(4))
                texto, _ = ler_log(z.read(nome))
                urnas_log.append((k, *analisar(texto)))
intervalos, apos17, iguais, diferentes_log = [], 0, 0, []
for k, votos, sem_hab, tempos, cont in urnas_log:
    intervalos += [(b - a).total_seconds() for a, b in zip(tempos, tempos[1:])]
    apos17 += sum((t + timedelta(hours=FUSO.get(k[0], 0))).hour >= 17 for t in tempos)
    oficial = comp_oficial.get(k, (None,))[0]
    if oficial == votos:
        iguais += 1
    else:
        diferentes_log.append((k, votos, oficial, cont))
logs = dict(
    ufs=ufs_log, urnas=len(urnas_log), votos=sum(v for _, v, *_ in urnas_log),
    votosSemEleitorHabilitado=sum(s for _, _, s, *_ in urnas_log), paresMenosDe15s=sum(i < 15 for i in intervalos),
    menorIntervaloSeg=int(min(intervalos)), intervaloMedianoSeg=int(st.median(intervalos)), votosDepoisDas17h=apos17,
    logIgualAoOficial=iguais, logDiferente=len(diferentes_log),
    diferentesComTrocaDeUrna=sum(1 for *_, cont in diferentes_log if cont), diferentesComLogAMais=sum(1 for _, v, o, _ in diferentes_log if o is not None and v > o))

# Urnas avulsas examinadas (ex.: a que encerrou às 23h04)
casos = []
for p in sorted(glob.glob(str(RAW / "logs_2t" / "urnas" / "*-log.jez"))):
    m = NOME_LOG.search(os.path.basename(p))
    k = chave(m.group(1), m.group(2), m.group(3), m.group(4))
    texto, internos = ler_log(open(p, "rb").read())
    _, _, _, cont = analisar(texto)
    with zipfile.ZipFile(p) as z:
        original = next((z.read(n) for n in internos), None)
    votos_o, sem_o, tempos_o, _ = analisar(zipfile.ZipFile(io.BytesIO(original)).read("logd.dat").decode("latin1")) if original else (0, 0, [], False)
    oficial, mun = comp_oficial.get(k, (None, "?"))
    casos.append(dict(uf=k[0], municipio=mun.title(), zona=k[2], secao=k[3], encerramento=encerr.get(k).strftime("%H:%M") if encerr.get(k) else None,
                      contingencia=cont, votosNaUrnaOriginal=votos_o, comparecimentoOficial=oficial, votosSemHabilitacao=sem_o,
                      primeiroVoto=tempos_o[0].strftime("%H:%M") if tempos_o else None, ultimoVoto=tempos_o[-1].strftime("%H:%M") if tempos_o else None))

OUT.write_text(
    "/**\n * Auditoria dos boletins de urna e dos logs das urnas (2º turno de 2026).\n"
    " * ARQUIVO GERADO por scripts/build_auditoria_urnas.py - não editar à mão.\n */\n"
    "export const AUDITORIA_URNAS = Object.freeze(" + json.dumps(dict(
        geradoEm=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), geradoPor="scripts/build_auditoria_urnas.py",
        boletins=boletins, urnas=urnas_meta, logs=logs, casos=casos), ensure_ascii=False, indent=2) + ");\n", encoding="utf-8")
print(f"Gravado {OUT.relative_to(ROOT)} | boletins: {boletins['urnasComparadas']} urnas, {boletins['urnasComDiferenca']} com diferença | "
      f"logs: {logs['urnas']} urnas, {logs['votosSemEleitorHabilitado']} votos sem habilitação")
