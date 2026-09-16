#!/usr/bin/env python3
"""GRNT APEX — complete operating book (CPO + AMM + rails + LTS)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether, ListFlowable, ListItem,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

NAVY = HexColor("#0B1220")
TEAL = HexColor("#5EEAD4")
MUTED = HexColor("#5C6B7A")
RULE = HexColor("#D6D1C7")
INK = HexColor("#1A1A1A")
W, H = A4
MARGIN = 16 * mm


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, H - 12 * mm, W, 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(MARGIN, H - 7.5 * mm, "GRNT PARTNERS")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(W - MARGIN, H - 7.5 * mm, "APEX COMPLETE BOOK  ·  v1.0")
    canvas.setFillColor(TEAL)
    canvas.rect(0, H - 12 * mm - 1.5, W, 1.5, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, W, 10 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(MARGIN, 4 * mm, "16 Sep 2026  ·  Model, not a term sheet")
    canvas.drawRightString(W - MARGIN, 4 * mm, str(doc.page))
    canvas.restoreState()


def styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle(name="H1", fontName="Helvetica-Bold", fontSize=18, leading=22,
                         textColor=NAVY, spaceAfter=6))
    s.add(ParagraphStyle(name="H2", fontName="Helvetica-Bold", fontSize=12, leading=16,
                         textColor=NAVY, spaceAfter=6, spaceBefore=12))
    s.add(ParagraphStyle(name="H3", fontName="Helvetica-Bold", fontSize=10, leading=14,
                         textColor=NAVY, spaceAfter=4, spaceBefore=8))
    s.add(ParagraphStyle(name="Body", fontName="Helvetica", fontSize=9.5, leading=13.5,
                         textColor=INK, spaceAfter=7))
    s.add(ParagraphStyle(name="Meta", fontName="Helvetica", fontSize=9, leading=13,
                         textColor=MUTED, spaceAfter=8))
    s.add(ParagraphStyle(name="Eq", fontName="Courier", fontSize=8.5, leading=12,
                         textColor=INK, backColor=HexColor("#F4F1EA"),
                         leftIndent=6, rightIndent=6, spaceBefore=3, spaceAfter=8))
    s.add(ParagraphStyle(name="Cell", fontName="Helvetica", fontSize=7.5, leading=10.5,
                         textColor=INK))
    s.add(ParagraphStyle(name="CellB", fontName="Helvetica-Bold", fontSize=7.5, leading=10.5,
                         textColor=white))
    s.add(ParagraphStyle(name="Note", fontName="Helvetica-Oblique", fontSize=8.5, leading=12,
                         textColor=MUTED, spaceAfter=8))
    s.add(ParagraphStyle(name="Rule", fontName="Helvetica", fontSize=9, leading=13,
                         textColor=INK, leftIndent=10, spaceAfter=3))
    s.add(ParagraphStyle(name="TOC", fontName="Helvetica", fontSize=10, leading=16,
                         textColor=INK, leftIndent=4, spaceAfter=2))
    return s


def tbl(data, col_w):
    t = Table(data, colWidths=col_w, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("BACKGROUND", (0, 1), (-1, -1), white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, RULE),
        ("BOX", (0, 0), (-1, -1), 0.3, RULE),
    ]))
    return t


def eur(n, d=0):
    s = f"{abs(n):,.{d}f}".replace(",", " ")
    return f"{'−' if n < 0 else ''}{s} €"


def run_model(mau, deposit, lev, hold, rev_share, brands):
    LEGACY_HOLD, NGR_HAIRCUT, GRNT_NGR_SHARE = 0.045, 0.1, 0.15
    SAAS, LOCK = 6_000, 50
    LEGACY_CAC, APEX_CAC, REVOLUT_CAC = 180, 95, 55
    deposits = mau * deposit
    revolut_users = round(mau * rev_share)
    revolut_float = revolut_users * LOCK
    apex_vol = deposits * lev
    legacy_ggr = deposits * LEGACY_HOLD
    apex_ggr = apex_vol * hold
    legacy_ngr = legacy_ggr * (1 - NGR_HAIRCUT)
    apex_ngr = apex_ggr * (1 - NGR_HAIRCUT)
    casino_keep = apex_ngr * (1 - GRNT_NGR_SHARE)
    grnt_ngr = apex_ngr * GRNT_NGR_SHARE
    saas = brands * SAAS
    grnt_month = saas + grnt_ngr
    legacy_cac = mau * LEGACY_CAC
    apex_cac = revolut_users * REVOLUT_CAC + (mau - revolut_users) * APEX_CAC
    return dict(
        deposits=deposits, revolut_users=revolut_users, revolut_float=revolut_float,
        apex_vol=apex_vol, legacy_ggr=legacy_ggr, apex_ggr=apex_ggr,
        ggr_x=apex_ggr / legacy_ggr if legacy_ggr else 0,
        legacy_ngr=legacy_ngr, apex_ngr=apex_ngr, casino_keep=casino_keep,
        grnt_ngr=grnt_ngr, saas=saas, grnt_month=grnt_month, grnt_arr=grnt_month * 12,
        cac_saved=legacy_cac - apex_cac,
    )


def main():
    # --- AMM canonical numbers ---
    L, p, a, spread0 = 10_000_000, 0.62, 1_250_000, 0.02
    q_yes, q_no = L * (1 - p), L * p
    k = q_yes * q_no
    q_no2 = q_no + a
    q_yes2 = k / q_no2
    yes_swap = q_yes - q_yes2
    yes_out = a + yes_swap
    p_exec = a / yes_out
    p_quote = min(0.99, p_exec * (1 + spread0))
    impact = p_exec / p - 1
    p_t2 = min(0.99, p * 1.02)
    q_no_t2 = (p_t2 * k / (1 - p_t2)) ** 0.5
    depth2 = max(0, q_no_t2 - q_no)
    lam = 2 * (1 - p) / L
    sqrt_i = 0.5 * 0.02 * (a / 80_000_000) ** 0.5

    n_cas, handle_each = 10, 40_000_000
    monthly = n_cas * handle_each
    weekly = monthly / (365 / 7 / 12)
    peak = weekly * 0.08
    R = peak * (1 - 0.02) / 0.02
    need = R / 0.72
    facility, rate, commit, drawn_pct, lp_take = 500_000_000, 0.065, 0.0075, 0.40, 0.007
    drawn = facility * drawn_pct
    cost = drawn * rate + (facility - drawn) * commit
    lp_rev = monthly * 12 * lp_take
    event_line, group_line = facility * 0.02, facility * 0.04
    silo, net = 10 * event_line, group_line

    N, lev, vault, junior = 8_000_000, 5, 3_000_000, 1_000_000
    margin = N / lev
    hole = N * (1 - p)
    uncovered = max(0, hole - max(0, vault - margin) - junior)

    presets = {
        "Bear": (3_000, 120, 2.0, 0.10, 0.08, 1),
        "Base": (10_000, 200, 3.5, 0.165, 0.18, 5),
        "Bull": (40_000, 280, 5.0, 0.18, 0.28, 12),
    }
    models = {k: run_model(*v) for k, v in presets.items()}

    path = "/workspace/artifacts/GRNT_APEX_Complete.pdf"
    doc = SimpleDocTemplate(
        path, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=20 * mm, bottomMargin=16 * mm,
        title="GRNT APEX Complete Book", author="GRNT Partners",
    )
    S = styles()

    def C(t):
        return Paragraph(str(t), S["Cell"])

    def CB(t):
        return Paragraph(str(t), S["CellB"])

    story = []

    # COVER
    story.append(Paragraph("GRNT APEX", S["H1"]))
    story.append(Paragraph("Complete operating book", S["H1"]))
    story.append(Paragraph(
        "CPO sales deck, player→casino cascade, scenario math, Revolut partnership, "
        "Pay N Play rails, dual-mode wedge, binary CPMM, 500m lender, vAMM risk, "
        "and AMM vs exchange formulae. One file. Formula beats the deck.", S["Meta"]))
    story.append(HRFlowable(width="100%", thickness=1.8, color=TEAL, spaceAfter=10))
    story.append(Paragraph(
        "Working name eGRIND is retired. Public product name is <b>GRNT APEX</b>. "
        "Figures are a model — not live P&L, not a credit approval, not a quote. "
        "If a number in a slide conflicts with a formula here, the formula wins.", S["Body"]))

    story.append(Paragraph("Contents", S["H2"]))
    for line in [
        "1. Name, thesis, LTS",
        "2. CPO deck — pain, cascade, ask",
        "3. Player → casino feature map",
        "4. Scenario math (bear / base / bull)",
        "5. CPO matrix",
        "6. Revolut Metal partner",
        "7. Pay N Play rails",
        "8. Dual-mode wedge (A/B)",
        "9. AMM layers and CPMM fill",
        "10. Facility, netting, isolated margin",
        "11. vAMM risk and halt tape",
        "12. AMM vs CLOB / Betfair / house",
        "13. Operating rules and source of truth",
    ]:
        story.append(Paragraph(line, S["TOC"]))

    story.append(PageBreak())

    # 1 NAME / LTS
    story.append(Paragraph("1. Name, thesis, LTS", S["H2"]))
    names = [[CB("Candidate"), CB("Use"), CB("Verdict")]]
    for r in [
        ("GRNT APEX", "Product + B2B widget", "Primary."),
        ("GRNT TAPE", "Screener / live feed", "Module only."),
        ("GRNT RING", "Consumer skin", "Backup."),
        ("GRNT EDGE", "Quant / EV engine", "Engine, not the product."),
        ("eGRIND", "Prior working title", "Do not use externally."),
    ]:
        names.append([C(x) for x in r])
    story.append(tbl(names, [40*mm, 70*mm, 64*mm]))
    story.append(Paragraph(
        "<b>Thesis.</b> MMA fans will sit in a finance-grade terminal if v0.1 is paper money plus a route "
        "to a real book. Do not build an MGA book or an AMM until that conversion is measured.", S["Body"]))

    phase = [[CB("Phase"), CB("Window"), CB("What ships"), CB("Money"), CB("Risk")]]
    for r in [
        ("1 Aggregator", "Mo 1–3", "Paper book, EV screener, copy feed, smart-route CPA. KPI: 500 users, >8 min, >15% CTR.",
         "CPA 100–150 €", "No licence, no float"),
        ("2 B2B widget", "Mo 4–12", "White-label iFrame / SDK. Revolut Metal 50 € lock. Operator owns KYC.",
         "SaaS from 6 k€/mo + 15% NGR", "Operator licence"),
        ("3 AMM Type 2", "Mo 12–24", "Own pool, liquidation. Mode A or B. Casino-wedge as production config.",
         "Volume skim 70 bps", "Licence + capital"),
        ("4 Overlay", "Y3+", "Stream HUD, wallet ingress, multi-sport. DAZN stays here.",
         "Rev-share / M&A", "Scale, not product"),
    ]:
        phase.append([C(x) for x in r])
    story.append(tbl(phase, [28*mm, 22*mm, 68*mm, 36*mm, 20*mm]))
    story.append(Paragraph(
        "Casino wedge is sold from Phase 1 so the lawyer has an answer. It ships as production in Phase 3. "
        "Do not put DAZN, live AMM, or MGA Type 2 on the Phase 1 sprint.", S["Note"]))

    cut = [[CB("Layer"), CB("Full vision"), CB("MVP 0.1")]]
    for r in [
        ("Cash", "Fiat/crypto wallets", "Virtual 10 000 €. Real stake via affiliate."),
        ("Risk", "Live AMM + liquidation", "Static margin formula on the client."),
        ("Odds", "Monte Carlo HPC", "Historical heuristic + The-Odds-API."),
        ("UX", "In-book widget", "Standalone PWA, dark terminal."),
        ("Social", "Paid copy book", "Public PnL board + 1-click copy of paper books."),
    ]:
        cut.append([C(x) for x in r])
    story.append(tbl(cut, [28*mm, 72*mm, 74*mm]))

    # 2 CPO
    story.append(Paragraph("2. CPO deck", S["H2"]))
    story.append(Paragraph(
        "APEX is the trading terminal the sportsbook is missing. Players already live in Robinhood and eToro. "
        "You still show them a 2010 coupon. APEX sits on your UI, turns a bet into a book, and routes the stake "
        "to you. Revolut Metal is the funded on-ramp. Plug-in widget — no backend rewrite. Phase 1 is paper + CPA.", S["Body"]))
    pain = [[CB("Pain"), CB("Fact")]]
    for r in [
        ("Your product", "Same Kambi/SBTech lines as every neighbour."),
        ("Your acquisition", "Bonus war. CPA 150–250 €. Player leaves after the free bet."),
        ("Your tase", "You are the counterparty on every slip. One-sided UFC card hurts."),
        ("Your session", "~45 s. No book, no heatmap, no reason to stay."),
    ]:
        pain.append([C(x) for x in r])
    story.append(tbl(pain, [40*mm, 134*mm]))
    story.append(Paragraph(
        "<b>The ask.</b> Widget. Same 20x terminal. Dual-mode vault. GRNT senior revolver behind junior first-loss. "
        "Commercial: SaaS from €6 000/mo + 15% of APEX-routed NGR. Trustly/Zimpler/Brite stay on the cashier.", S["Body"]))

    story.append(PageBreak())

    # 3 CASCADE
    story.append(Paragraph("3. Player → casino feature map", S["H2"]))
    story.append(Paragraph(
        "Every player feature is only on the deck if it moves an operator KPI. Do not sell UX.", S["Body"]))
    feat = [[CB("Player sees"), CB("Does"), CB("Casino gets"), CB("KPI")]]
    for r in [
        ("EV screener, true vs market, Kelly bar", "Builds a book before staking. Stays on the card.", "Session 45 s → 12–18 min", "Session / touches"),
        ("1x–20x isolated margin + liq band", "Same deposit, more notional. Ruin capped to margin.", "Volume velocity ~3.5x on unchanged deposits", "Handle / GGR"),
        ("Live risk band, open position not a coupon", "Hedges and flash stakes during the fight.", "More tx per event, less bounce after one slip", "ARPU"),
        ("1-click copy of verified paper books", "Follows a quant instead of a bonus banner.", "Organic invite loop. Lower CPA dependence", "CAC / K-factor"),
        ("Smart route to best combined price", "One CTA after the book is built.", "Inbound stake on the operator book", "Conversion"),
        ("Revolut Metal: 50 € locked margin", "Opens a leveraged seat without a form.", "Premium cohort, instant KYC, funded wallet", "FTD / CAC"),
        ("Same 20x UI in Mode A or B", "No product change when licence rules bite.", "Tase 0%. Host of the pool is a config flag", "Variance / capital"),
    ]:
        feat.append([C(x) for x in r])
    story.append(tbl(feat, [48*mm, 50*mm, 50*mm, 26*mm]))

    # 4 SCENARIOS
    story.append(Paragraph("4. Scenario math", S["H2"]))
    story.append(Paragraph(
        "Assumptions labelled. Not live evidence. Hold mix is an assumption — do not paste facility NPV into a first CPO mail. "
        "Legacy hold 4.5%. APEX hold 10 / 16.5 / 18% by scenario. NGR haircut 10%. GRNT take 15% of APEX NGR. "
        "SaaS €6 000/brand. CAC: legacy 180 €, APEX 95 €, Revolut Metal 55 €. Lock 50 €.", S["Body"]))
    inp = [[CB("Input"), CB("Bear"), CB("Base"), CB("Bull")]]
    labels = [
        ("MAU", "3 000", "10 000", "40 000"),
        ("Deposit / MAU / mo", "120 €", "200 €", "280 €"),
        ("Leverage", "2.0×", "3.5×", "5.0×"),
        ("APEX hold", "10%", "16.5%", "18%"),
        ("Revolut share", "8%", "18%", "28%"),
        ("Brands", "1", "5", "12"),
    ]
    for r in labels:
        inp.append([C(x) for x in r])
    story.append(tbl(inp, [50*mm, 41*mm, 41*mm, 42*mm]))
    story.append(Spacer(1, 3*mm))

    out = [[CB("Output / month"), CB("Bear"), CB("Base"), CB("Bull")]]
    def row(label, key, money=True, x=False):
        cells = [C(label)]
        for name in ("Bear", "Base", "Bull"):
            v = models[name][key]
            if x:
                cells.append(C(f"{v:.1f}×"))
            elif money:
                cells.append(C(eur(v)))
            else:
                cells.append(C(f"{v:,.0f}".replace(",", " ")))
        out.append(cells)
    row("Deposits", "deposits")
    row("APEX notional", "apex_vol")
    row("Legacy GGR", "legacy_ggr")
    row("APEX GGR", "apex_ggr")
    row("GGR multiple", "ggr_x", money=False, x=True)
    row("Casino keeps (after 15%)", "casino_keep")
    row("GRNT NGR share", "grnt_ngr")
    row("SaaS", "saas")
    row("GRNT month", "grnt_month")
    row("GRNT ARR", "grnt_arr")
    row("Revolut users", "revolut_users", money=False)
    row("Revolut float (50 €)", "revolut_float")
    row("CAC saved vs legacy", "cac_saved")
    story.append(tbl(out, [50*mm, 41*mm, 41*mm, 42*mm]))
    story.append(Paragraph(
        f"Base case: {eur(models['Base']['grnt_month'])}/mo GRNT ({eur(models['Base']['grnt_arr'])} ARR), "
        f"casino keeps {eur(models['Base']['casino_keep'])}/mo after the 15% share, GGR {models['Base']['ggr_x']:.1f}× "
        f"legacy on the same deposits because leverage × hold. Hold mix is the swing factor — treat as a range, not a promise.", S["Note"]))

    story.append(PageBreak())

    # 5 MATRIX
    story.append(Paragraph("5. CPO matrix", S["H2"]))
    mx = [[CB("Metric"), CB("Legacy"), CB("APEX"), CB("P&L")]]
    for r in [
        ("UX", "1X2 coupon", "Leverage, heatmap, copy feed", "Stops bonus-only acquisition"),
        ("Hold", "4–6% singles", "15–25% packaged books", "Only if parlays actually convert"),
        ("Session", "~45 s", "12–18 min target", "More touches per card"),
        ("Tase", "House vs player", "AMM pool · Mode A or B", "Wedge: host changes, curve does not"),
        ("Integrate", "Backend swap", "iFrame / SDK", "Days, not quarters"),
        ("Cashier", "Form + card", "Existing PnP + Revolut Metal door", "FTD without a form. Do not rip the rail"),
        ("CAC", "150–250 € bonus war", "95 € APEX / 55 € Revolut Metal", "Lower CPA, higher LTV (~3.8×)"),
        ("Churn (mo)", "~65%", "~22% target", "Session length is the leading indicator"),
    ]:
        mx.append([C(x) for x in r])
    story.append(tbl(mx, [28*mm, 48*mm, 52*mm, 46*mm]))

    # 6 REVOLUT
    story.append(Paragraph("6. Revolut Metal — partner, not a rail", S["H2"]))
    story.append(Paragraph(
        "Two different products. (1) Revolut as a bank inside Trustly/TrueLayer lists — already there, not the deal. "
        "(2) Metal hook for APEX: Open Banking-style seat, Metal KYC reused, <b>50 € locked as isolated margin</b>, "
        "instant on/off-ramp to the same balance. Needed for leveraged round-trips. Phase 2 on-ramp. "
        "Never sold as Pay N Play. Operator still owns the licence file.", S["Body"]))
    rev = [[CB("Item"), CB("APEX treatment")]]
    for r in [
        ("What it is", "Bank + wallet + 21–35 cohort. Partnership, not a cashier plugin."),
        ("KYC", "Metal KYC reused. Not bank-login PnP."),
        ("Margin", "50 € lock. Isolated. Ruin capped to the lock × lev."),
        ("Speed", "Instant in and out to Revolut balance."),
        ("Fee", "Interchange / FX. Not a 1% PSP take on GGR."),
        ("Phase", "Phase 2. Phase 1 FTD rides the operator’s existing Trustly."),
        ("Do not", "Do not replace Trustly. Do not tell the CPO Revolut is Pay N Play."),
    ]:
        rev.append([C(x) for x in r])
    story.append(tbl(rev, [36*mm, 138*mm]))

    # 7 PNP
    story.append(Paragraph("7. Pay N Play rails", S["H2"]))
    story.append(Paragraph(
        "Figures as of 2026 public operator briefings — not quotes. APEX does not rip the cashier.", S["Body"]))
    rails = [[CB("Rail"), CB("Fit"), CB("Markets / banks"), CB("Fee / contract"), CB("APEX")]]
    for r in [
        ("Trustly", "Primary PnP", "30+ EU. 6 300+ EU banks. Invented PnP 2016.",
         "~0–1.2% in. High bar ~$300k/mo, 12 mo.", "Keep for FTD. Widget on top."),
        ("Zimpler GO", "Alt PnP", "SE, FI, DE, Baltics, BR Pix. TrueLayer closed Mar 2026.",
         "~0.6–1.1%. Easier mid-market.", "Second PnP if already on TrueLayer."),
        ("Brite Play", "Alt PnP", "~27 EU. 3 800+ banks. Fastest cash-out tests (~4 s).",
         "~0.5–1.5% in / 0.5% out. ~$200k/mo, 6 mo.", "Pricing lever. Not first unless mid-market."),
        ("TrueLayer", "Stack", "UK + EU. Zimpler is the Nordic iGaming face.",
         "Infra pricing.", "If the UK book is already TrueLayer."),
        ("Nuvei", "PSP", "US+EU+LATAM. 720+ methods. Not PnP.",
         "~1.5–3.5% + reserve.", "Keep for cards. Not the FI identity rail."),
        ("Swish", "SE only", "Spelinspektionen sites.", "Bank scheme.", "Ignore unless SE-local."),
        ("Viljo / Trumo", "Out", "FI challenger, 5–10 casinos.", "Unpublished.", "Coverage risk. Do not build on it."),
        ("Revolut Metal", "Partner", "EEA+UK. Bank inside Trustly and a wallet.",
         "Partnership.", "Phase 2 on-ramp. Never a Trustly replacement."),
    ]:
        rails.append([C(x) for x in r])
    story.append(tbl(rails, [28*mm, 22*mm, 48*mm, 40*mm, 36*mm]))
    story.append(Paragraph(
        "If they have Trustly: keep it, put APEX on top, Revolut Metal as a second door for the leverage cohort. "
        "If new: Trustly for coverage, or Brite if the volume floor is the blocker. "
        "Never sell Revolut as Pay N Play. Never pull Nuvei as the Nordic identity rail.", S["Note"]))

    story.append(PageBreak())

    # 8 WEDGE
    story.append(Paragraph("8. Dual-mode wedge", S["H2"]))
    story.append(Paragraph(
        "The curve does not change. <b>Mode A</b>: GRNT hosts the vault (operator is a broker). "
        "<b>Mode B</b>: the same CPMM sits inside the licensed casino vault; the 500m facility is a hedge line, "
        "not a sweep of player funds. Sell Mode B to MGA/UKGC. Flip a flag. Tase 0% if the book is the pool "
        "and the house is not the taker.", S["Body"]))
    wedge = [[CB("Mode"), CB("Who holds cash"), CB("Who is counterparty"), CB("Sell to")]]
    for r in [
        ("A — GRNT hosted", "GRNT vault", "The pool. Operator is a broker.", "Unlicensed / aggregator path"),
        ("B — Casino vault", "Licensed operator vault", "The pool. Facility is a hedge line.", "MGA / UKGC / local"),
    ]:
        wedge.append([C(x) for x in r])
    story.append(tbl(wedge, [40*mm, 44*mm, 50*mm, 40*mm]))

    # 9 AMM
    story.append(Paragraph("9. AMM — five layers and the fill", S["H2"]))
    layers = [[CB("L"), CB("Name"), CB("Job"), CB("Must not")]]
    for r in [
        ("L0", "Senior facility", "€500m revolving @ 6.5%, 7–30 day", "Sit in one fight as k"),
        ("L1", "Junior first-loss", "GRNT + operator. Halt lives here", "Let senior pay winners"),
        ("L2", "Event line", "Cap per fight / brand / group", "Silo the same main 10 times"),
        ("L3", "CPMM book", "q_yes · q_no = k. Real cash layer", "Set virtual L above the vault"),
        ("L4", "Isolated margin", "Player posts m. Book sees m·lev", "Cross-margin or portfolio net"),
    ]:
        layers.append([C(x) for x in r])
    story.append(tbl(layers, [14*mm, 38*mm, 68*mm, 54*mm]))

    story.append(Paragraph("Seed and buy YES (complete set)", S["H3"]))
    story.append(Paragraph(
        "q_yes = L · (1 − p)    q_no = L · p    k = q_yes · q_no<br/>"
        "mid p_yes = q_no / (q_yes + q_no) = p<br/>"
        "q_no′ = q_no + a    q_yes′ = k / q_no′<br/>"
        "YES out = a + (q_yes − q_yes′)    p_exec = a / YES_out<br/>"
        "p_quote = min(0.99, p_exec · (1 + s))    odds = 1 / p_quote", S["Eq"]))

    fill = [[CB("Worked fill — L = 10m, p = 0.62, a = 1.25m"), CB("Value")]]
    for r in [
        ("q_yes / q_no at seed", f"{eur(q_yes)} / {eur(q_no)}"),
        ("k", f"{k/1e12:.3f} × 10¹²"),
        ("YES out", f"{eur(yes_out)}  (a + swap {eur(yes_swap)})"),
        ("p_exec  (mid was 0.62)", f"{p_exec:.4f}   impact {impact*100:.1f}%"),
        ("p_quote at 2% spread", f"{p_quote:.4f}  →  odds {1/p_quote:.3f}"),
        ("Cash to move mid +2%", eur(depth2)),
        ("Kyle λ = 2(1−p)/L", f"{lam:.2e}  per €"),
        ("Same clip on OMX √Q (Y=0.5, σ=2%, ADV=80m)", f"{sqrt_i*100:.2f}%   AMM/equity ≈ {impact/sqrt_i:.0f}×"),
    ]:
        fill.append([C(x) for x in r])
    story.append(tbl(fill, [100*mm, 74*mm]))
    story.append(Paragraph(
        "€1.25m notional on a €10m line is a whale. Isolated 5x on €250k margin looks small to the player "
        "and large to the book. Cap notional against L, not against the deposit. "
        "λ overstates large clips (convexity) — use the exact CPMM for fills.", S["Note"]))

    story.append(Paragraph("Inventory spread. Do not use 8h funding on a live fight.", S["H3"]))
    story.append(Paragraph(
        "s = s0 + κ · |skew|     skew = (q_no − q_yes) / (q_yes + q_no)<br/>"
        "funding_8h = f · skew     (f = 8 bps at |skew| = 1)", S["Eq"]))
    story.append(Paragraph(
        "A fight is over in minutes. Funding is a skew tax between events, not a hedge during the round.", S["Body"]))

    story.append(PageBreak())

    # 10 FACILITY
    story.append(Paragraph("10. Facility, netting, isolated margin", S["H2"]))
    story.append(Paragraph(
        "monthly = n · H     weekly = monthly / (365/7/12)<br/>"
        "q_peak = weekly · peak_share     R = q_peak · (1 − s) / s     need = R / target_util", S["Eq"]))
    fac = [[CB("Input / output"), CB("Base case")]]
    for r in [
        ("10 casinos × 40m handle / mo", eur(monthly) + " combined"),
        ("Weekly / peak 8% one-sided", f"{eur(weekly)}  /  {eur(peak)}"),
        ("R at 2% impact / need at 72% util", f"{eur(R)}  /  {eur(need)}"),
        ("Facility F / avg drawn 40%", f"{eur(facility)}  /  {eur(drawn)}"),
        ("Interest 6.5% + commit 0.75%", eur(cost) + " / year"),
        ("LP take 0.70% of handle", eur(lp_rev) + " / year"),
        ("Coverage LP / carry", f"{lp_rev / cost:.2f}×"),
        ("Event line 2% / group 4% / brand 15%", f"{eur(event_line)}  /  {eur(group_line)}  /  {eur(facility*0.15)}"),
        ("Siloed 10 books vs netting hub", f"{eur(silo)}  vs  {eur(net)}   saved {eur(silo-net)}"),
    ]:
        fac.append([C(x) for x in r])
    story.append(tbl(fac, [90*mm, 84*mm]))
    story.append(Paragraph(
        "€500m is the right senior size if H ≈ €40m/month per brand and peak is ~8% of weekly. "
        "If H is €80m+ or peak is 15% without a wider spread, add junior — do not enlarge the 6.5% loan. "
        "Tenor is 7–30 day revolving. Combat settles in hours. Not a five-year loan. "
        "Same UFC main on ten brands is one inventory. Siloed vAMMs multiply the one-sided hole.", S["Note"]))
    story.append(Paragraph(
        "Isolated margin: m = N / lev, lev ∈ [1, 20]. Book sees notional. Ruin capped to m. "
        "Liquidation unwinds into the CPMM; the house is not the taker. Queue >30s or gap >2%: reject new 10x+, ADL. "
        "Cross-margin forbidden. A parlay is a packaged book, not pooled margin. "
        "liq_odds ≈ o · (1 − 1/λ) (haircut for spread/fees in production).", S["Body"]))

    # 11 VAMM
    story.append(Paragraph("11. vAMM risk and halt tape", S["H2"]))
    story.append(Paragraph(
        "A pure vAMM sets k virtually and holds cash in a vault. Open interest can be all YES. "
        "Perpetual Protocol abandoned this and rebuilt v2 on real Uniswap v3 liquidity. "
        "A 15-minute fight is a worse vAMM than a BTC perp: funding cannot mean-revert before the bell, "
        "settlement is binary, recreational flow is structurally long the favourite.", S["Body"]))
    risk = [[CB("Risk"), CB("House"), CB("Pure vAMM"), CB("Real CPMM"), CB("APEX")]]
    for r in [
        ("Counterparty", "The house", "Fund / protocol", "Other token in k", "Cash nets; lev ≤ junior"),
        ("Depth", "Liability cap", "Fake. k > vault", "Slippage = cash", "L ≤ 2% F and L ≤ vault"),
        ("Funding", "—", "Hours–days", "Not for solvency", "Do not use on a fight"),
        ("Settlement", "House pays", "Must return to pin", "YES=1 from cash", "Official result + ADL"),
        ("One-sided", "Tase spike", "Core death", "Price moves, backed", "Spread, halt, group cap"),
        ("Oracle", "Own traders", "Mark ⊕ oracle", "Pool is the price", "Halt if lag > 2s"),
        ("Liquidation", "Lose the stake", "Cascade / bad debt", "No lev in base", "Isolated; 30s / 2% halt"),
        ("Backstop", "Equity", "Print token", "Complete-set", "Junior. Senior freeze"),
    ]:
        risk.append([C(x) for x in r])
    story.append(tbl(risk, [26*mm, 28*mm, 36*mm, 38*mm, 46*mm]))

    story.append(Paragraph(
        "Favourite-win hole (pure vAMM, all YES):  margin = N/lev    payout = N·(1−p)    "
        "uncovered = max(0, payout − (vault − margin) − junior)", S["Body"]))
    hole_t = [[CB("Stressed example"), CB("Value")]]
    for r in [
        ("N = 8m YES, p = 0.62, 5×, vault 3m, junior 1m", "—"),
        ("Margin posted", eur(margin)),
        ("Winner payout (1−p)·N", eur(hole)),
        ("Uncovered", eur(uncovered) + "  HALT. Cut N, cut lev, or add first-loss. Do not widen k."),
    ]:
        hole_t.append([C(x) for x in r])
    story.append(tbl(hole_t, [90*mm, 84*mm]))

    story.append(PageBreak())

    tape = [[CB("Code"), CB("Trigger"), CB("Action")]]
    for r in [
        ("SKEW", "One side >70% of a market book", "Widen spread, hike funding, invite other side"),
        ("UTIL", "Inventory >80% of the allocated line", "Halt new leverage on that event"),
        ("NAV", "Pool NAV −5% day or −8% event", "Kill switch. Junior absorbs. Senior frozen"),
        ("LIQ", "Liquidation queue >30s or gap >2%", "Auto-deleverage, reject new 10x+"),
        ("ORACLE", "Odds lag >2s vs feed", "Quote only, no fill"),
        ("CORR", "Same-direction flow across ≥4 brands", "Group cap. Treat as one book"),
        ("TENOR", "Position open >24h", "Force funding or close — facility is short"),
        ("CAPACITY", "Need > 1.05 × F", "Widen s, cut lev, or add junior"),
        ("CARRY", "LP take / carry < 1.0×", "Raise skim or cut undrawn"),
        ("VAMM", "Uncovered hole > 0 on favourite win", "Not a book. Reduce N or add first-loss"),
    ]:
        tape.append([C(x) for x in r])
    story.append(KeepTogether([Paragraph("Halt tape", S["H3"]), tbl(tape, [28*mm, 72*mm, 74*mm])]))

    # 12 EXCHANGE
    story.append(Paragraph("12. AMM vs exchange math", S["H2"]))
    story.append(Paragraph(
        "A CPMM is not a CLOB and not Betfair. Same €1.25m clip is a rounding error on OMX and a whale on a 10m fight line. "
        "Do not tell a CPO the fight book trades like a stock.", S["Body"]))
    form = [[CB("Desk calc"), CB("Exchange / CLOB / futures"), CB("APEX CPMM")]]
    for r in [
        ("Mid", "(bid + ask) / 2, last, or index", "p = q_no / (q_yes + q_no)"),
        ("Kyle λ", "dP/dQ estimated from flow. Unstable", "λ = 2(1−p)/L at seed. Public"),
        ("Impact", "I ≈ Y · σ · √(Q / ADV)  (Almgren)", "p_exec = a / YES_out. Closed form"),
        ("Depth", "Shares inside 1 / 5 / 10 bps of mid", "a(i) that moves mid by i"),
        ("VWAP", "Σ P_t Q_t / Σ Q_t vs the tape", "The curve is the tape. No hidden size"),
        ("Reservation", "Avellaneda: r = s − q γ σ² τ", "s = s0 + κ|skew|. No time-to-close"),
        ("Margin", "SPAN / portfolio. Cross-net, VM daily", "Isolated m = N / lev. No SPAN"),
        ("Clearing", "CCP novation, IM + VM", "Complete set YES+NO = €1. Self-clears"),
        ("Close", "Auction, then T+1 / T+2", "Binary 0/1 at the bell. No unwind to pin"),
    ]:
        form.append([C(x) for x in r])
    story.append(tbl(form, [28*mm, 78*mm, 68*mm]))
    story.append(Spacer(1, 3*mm))
    ven = [[CB(""), CB("Equity CLOB"), CB("Betfair"), CB("Sportsbook"), CB("APEX")]]
    for r in [
        ("Who is the book", "MM + the crowd", "Back vs lay", "The operator", "The pool"),
        ("A large clip", "Walks the book", "May rest unmatched", "Limit or reject", "Always fills. Price moves"),
        ("Edge", "Spread − adverse sel.", "2–5% commission", "Hold ~4.5–8%", "Spread + IL + 70 bps skim"),
        ("Leverage", "Broker / futures", "None in the match", "Stake = max loss", "Isolated 1–20x"),
        ("Clock", "Hours, then T+1", "Until the event", "Until the event", "Minutes. Funding cannot save it"),
    ]:
        ven.append([C(x) for x in r])
    story.append(tbl(ven, [32*mm, 36*mm, 34*mm, 36*mm, 36*mm]))

    # 13 RULES
    story.append(Paragraph("13. Operating rules (non-negotiable)", S["H2"]))
    for i, r in enumerate([
        "Never set virtual L above the vault on that line.",
        "Never use funding as the solvency tool on a live fight.",
        "Net the ten brands. Siloed vAMMs multiply the one-sided hole.",
        "Cap OI so favourite-win payout ≤ junior. Senior does not pay winners.",
        "Complete-set cash for unlevered flow. Leverage is bounded vAMM, not free k.",
        "One event, one allocated line. Never one 500m Uniswap pool.",
        "Mode A/B changes the legal host only. The curve is identical.",
        "Phase 1 ships paper + CPA. Do not put DAZN, live AMM, or MGA Type 2 on the sprint.",
        "Do not paste facility NPV into a first CPO mail. Hold mix is an assumption.",
        "Do not replace Trustly. Do not sell Revolut as Pay N Play.",
        "Do not tell a CPO the fight book trades like a stock.",
        "If any halt code trips, stop new leverage. Do not wait through a main event.",
    ], 1):
        story.append(Paragraph(f"{i}.  {r}", S["Rule"]))

    story.append(Paragraph("Source of truth", S["H2"]))
    story.append(Paragraph(
        "Code: src/lib/model.ts (scenarios), liquidity.ts (CPMM), lender.ts (facility), "
        "vamm-risk.ts (hole), pnp.ts (rails), exchange.ts (λ and √Q). "
        "Interactive: APEX app — CPO deck, Lender pool, Pay N Play, Scenarios. "
        "Public read: github.com/isomarkkupentti/grnt-apex and github.com/isomarkkupentti/grnt-apex-playbook. "
        "Live snapshot: isomarkkupentti.github.io/grnt-apex. "
        "If the app and this PDF diverge, fix the PDF in the same commit as the code.", S["Body"]))
    story.append(HRFlowable(width="100%", thickness=1.6, color=TEAL, spaceBefore=10, spaceAfter=8))
    story.append(Paragraph(
        "GRNT Partners  ·  Helsinki  ·  APEX Complete Book v1.0  ·  16 September 2026", S["Meta"]))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(path)


if __name__ == "__main__":
    main()
