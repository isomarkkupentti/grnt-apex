#!/usr/bin/env python3
"""GRNT APEX — AMM Liquidity Handbook (A4)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

NAVY = HexColor("#0E2841")
GOLD = HexColor("#C9A227")
MUTED = HexColor("#5C6B7A")
RULE = HexColor("#D6D1C7")
INK = HexColor("#1A1A1A")
GOOD = HexColor("#1F6B45")
BAD = HexColor("#8B2E2E")
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
    canvas.drawRightString(W - MARGIN, H - 7.5 * mm, "APEX AMM HANDBOOK  ·  INTERNAL")
    canvas.setFillColor(GOLD)
    canvas.rect(0, H - 12 * mm - 1.5, W, 1.5, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, W, 10 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(MARGIN, 4 * mm, "16 Sep 2026  ·  v1.1  ·  Model, not a term sheet")
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
                         leftIndent=6, rightIndent=6, spaceBefore=3, spaceAfter=8,
                         borderPadding=6))
    s.add(ParagraphStyle(name="Cell", fontName="Helvetica", fontSize=8, leading=11,
                         textColor=INK))
    s.add(ParagraphStyle(name="CellB", fontName="Helvetica-Bold", fontSize=8, leading=11,
                         textColor=white))
    s.add(ParagraphStyle(name="Note", fontName="Helvetica-Oblique", fontSize=8.5, leading=12,
                         textColor=MUTED, spaceAfter=8))
    s.add(ParagraphStyle(name="Rule", fontName="Helvetica", fontSize=9, leading=13,
                         textColor=INK, leftIndent=10, spaceAfter=3))
    return s


def tbl(data, col_w):
    t = Table(data, colWidths=col_w, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("BACKGROUND", (0, 1), (-1, -1), white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -2), 0.35, RULE),
        ("BOX", (0, 0), (-1, -1), 0.35, RULE),
    ]))
    return t


def eur(n, d=0):
    s = f"{abs(n):,.{d}f}".replace(",", " ")
    return f"{'−' if n < 0 else ''}{s} €"


def main():
    # --- canonical numbers (same as src/lib) ---
    L = 10_000_000
    p = 0.62
    q_yes = L * (1 - p)
    q_no = L * p
    k = q_yes * q_no
    a = 1_250_000
    q_no2 = q_no + a
    q_yes2 = k / q_no2
    yes_swap = q_yes - q_yes2
    yes_out = a + yes_swap
    p_exec = a / yes_out
    spread0 = 0.02
    p_quote = min(0.99, p_exec * (1 + spread0))
    odds = 1 / p_quote
    impact = p_exec / p - 1
    p_t2 = min(0.99, p * 1.02)
    q_no_t2 = (p_t2 * k / (1 - p_t2)) ** 0.5
    depth2 = max(0, q_no_t2 - q_no)

    n_cas = 10
    handle_each = 40_000_000
    monthly = n_cas * handle_each
    weekly = monthly / (365 / 7 / 12)
    peak_share = 0.08
    peak = weekly * peak_share
    s_max = 0.02
    util = 0.72
    R = peak * (1 - s_max) / s_max
    need = R / util
    facility = 500_000_000
    rate = 0.065
    commit = 0.0075
    drawn_pct = 0.40
    lp_take = 0.007
    drawn = facility * drawn_pct
    cost = drawn * rate + (facility - drawn) * commit
    lp_rev = monthly * 12 * lp_take
    event_line = facility * 0.02
    group_line = facility * 0.04
    brand_line = facility * 0.15
    silo = 10 * event_line
    net = min(group_line, silo)

    N = 8_000_000
    lev = 5
    vault = 3_000_000
    junior = 1_000_000
    margin = N / lev
    hole = N * (1 - p)
    uncovered = max(0, hole - max(0, vault - margin) - junior)

    path = "/workspace/artifacts/GRNT_APEX_AMM_Handbook.pdf"
    doc = SimpleDocTemplate(
        path, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=20 * mm, bottomMargin=16 * mm,
        title="GRNT APEX AMM Liquidity Handbook",
        author="GRNT Partners",
    )
    S = styles()

    def C(t):
        return Paragraph(str(t), S["Cell"])

    def CB(t):
        return Paragraph(str(t), S["CellB"])

    story = []

    # 0 cover
    story.append(Paragraph("GRNT APEX", S["H1"]))
    story.append(Paragraph("AMM Liquidity Handbook", S["H1"]))
    story.append(Paragraph(
        "Operating math for the binary CPMM, the 500m GRNT lender revolver, event lines, "
        "isolated margin, and why a pure vAMM is forbidden on a combat card.", S["Meta"]))
    story.append(HRFlowable(width="100%", thickness=1.6, color=GOLD, spaceAfter=10))
    story.append(Paragraph(
        "This is the calculation book. Figures are a <b>model</b>. They are not live P&L, "
        "not a credit approval, and not a quote to a CPO. If a number in a deck conflicts with "
        "a formula here, the formula wins.", S["Body"]))

    story.append(Paragraph("1. What this system is", S["H2"]))
    story.append(Paragraph(
        "APEX is a leveraged combat-sports terminal. Phase 1 is paper + CPA. The AMM is the "
        "Phase 3 cash engine, sold now so the CPO sees tase = 0. Players trade a <b>binary book</b> "
        "(YES/NO on a fight). The house is not the counterparty. GRNT is the lender of a short, "
        "liquid revolver. Ten brands on the same UFC main are <b>one book</b>.", S["Body"]))

    layers = [[CB("Layer"), CB("Name"), CB("Job"), CB("Must not")]]
    for r in [
        ("L0", "Senior facility", "€500m revolving @ 6.5%, 7–30 day", "Sit in one fight as k"),
        ("L1", "Junior first-loss", "GRNT + operator. Halt lives here", "Let senior pay winners"),
        ("L2", "Event line", "Cap per fight / brand / group", "Silo the same main 10 times"),
        ("L3", "CPMM book", "q_yes · q_no = k. Real cash layer", "Set virtual L above the vault"),
        ("L4", "Isolated margin", "Player posts m. Book sees m·lev", "Cross-margin or portfolio net"),
    ]:
        layers.append([C(x) for x in r])
    story.append(tbl(layers, [18*mm, 38*mm, 68*mm, 50*mm]))

    story.append(Paragraph("Mode A vs Mode B", S["H3"]))
    story.append(Paragraph(
        "The curve does not change. <b>Mode A</b>: GRNT hosts the vault (operator is a broker). "
        "<b>Mode B</b>: the same CPMM sits inside the licensed casino vault; the 500m facility is a "
        "<i>hedge line</i>, not a sweep of player funds. Sell Mode B to MGA/UKGC. Flip a flag.", S["Body"]))

    # 2 notation
    story.append(Paragraph("2. Notation", S["H2"]))
    notat = [[CB("Symbol"), CB("Meaning"), CB("Base case")]]
    for r in [
        ("L", "Event-line virtual+cash size (q_yes + q_no at seed)", "€10m = 2% of 500m"),
        ("p", "Oracle / seed probability of YES", "0.62 favourite"),
        ("q_yes, q_no", "Pool reserves (cash units)", "€3.8m / €6.2m"),
        ("k", "q_yes · q_no, conserved on a fill", "23.56 × 10¹²"),
        ("a", "Cash in on a buy", "€1.25m notional"),
        ("s", "Half-spread (base + inventory)", "2% + 4%·|skew|"),
        ("N", "Notional = margin × leverage", "€250k × 5 = €1.25m"),
        ("F", "Senior facility", "€500m"),
    ]:
        notat.append([C(x) for x in r])
    story.append(tbl(notat, [32*mm, 88*mm, 54*mm]))

    # 3 CPMM
    story.append(Paragraph("3. Binary CPMM — cash layer", S["H2"]))
    story.append(Paragraph(
        "This is a <b>real complete-set AMM</b>, not a perp vAMM. Buying YES with cash a: mint a "
        "YES and a NO (complete set = €1 of collateral), then sell the a NO into the pool. k is unchanged.", S["Body"]))
    story.append(Paragraph("Seed at oracle p", S["H3"]))
    story.append(Paragraph("q_yes = L · (1 − p)<br/>q_no  = L · p<br/>k     = q_yes · q_no = L² · p · (1 − p)<br/>mid p_yes = q_no / (q_yes + q_no) = p<br/>odds_yes  = 1 / p_yes", S["Eq"]))
    story.append(Paragraph("Buy YES with cash a", S["H3"]))
    story.append(Paragraph("q_no′  = q_no + a<br/>q_yes′ = k / q_no′<br/>YES from swap = q_yes − q_yes′<br/>YES out      = a + YES from swap<br/>p_exec       = a / YES_out<br/>p_quote      = min(0.99, p_exec · (1 + s))<br/>odds         = 1 / p_quote", S["Eq"]))
    story.append(Paragraph(
        "Buy NO is the same with the reserves flipped. After a YES buy, q_no rises and q_yes falls: "
        "mid p_yes increases (favourite shortens). That is the inventory signal.", S["Body"]))

    story.append(Paragraph("Worked fill — 10m line, p = 0.62, a = €1.25m", S["H3"]))
    fill = [[CB("Step"), CB("Value")]]
    for r in [
        ("q_yes, q_no at seed", f"{eur(q_yes)} / {eur(q_no)}"),
        ("k", f"{k/1e12:.3f} × 10¹²"),
        ("q_no′ = 6.2m + 1.25m", eur(q_no2)),
        ("q_yes′ = k / q_no′", eur(q_yes2)),
        ("YES out", f"{eur(yes_out)}  (a + swap {eur(yes_swap)})"),
        ("p_exec", f"{p_exec:.4f}  (mid was {p:.2f})"),
        ("impact p_exec/p − 1", f"{impact*100:.1f}%"),
        ("p_quote at 2% spread", f"{p_quote:.4f}  →  odds {odds:.3f}"),
    ]:
        fill.append([C(x) for x in r])
    story.append(tbl(fill, [90*mm, 84*mm]))
    story.append(Paragraph(
        "Lesson: €1.25m notional on a €10m line is a whale. Isolated 5x on €250k margin looks small "
        "to the player and large to the book. Cap notional against L, not against the player’s deposit.", S["Note"]))

    # 4 depth
    story.append(Paragraph("4. Depth — cash that moves mid by i", S["H2"]))
    story.append(Paragraph(
        "For a target mid p* after a YES buy (no spread):", S["Body"]))
    story.append(Paragraph("p* = q_no′² / (k + q_no′²)<br/>q_no′ = √( p* · k / (1 − p*) )<br/>a(i) = q_no′ − q_no<br/>with p* = min(0.99, p · (1 + i))", S["Eq"]))
    story.append(Paragraph(
        f"On the base book, cash to move mid +2% is <b>{eur(depth2)}</b>. That is the number to put "
        "next to “max 2% impact” on an event line. The facility-level shortcut "
        "R ≈ q·(1−s)/s is the same identity for a one-sided peak q against a dedicated reserve.", S["Body"]))

    story.append(Paragraph("Inventory spread and funding", S["H3"]))
    story.append(Paragraph("s = s0 + k_s · |skew|<br/>skew = (q_no − q_yes) / (q_yes + q_no)<br/>funding_8h = f · skew    (f = 8 bps at |skew| = 1)", S["Eq"]))
    story.append(Paragraph(
        "<b>Do not use 8-hour funding as a solvency tool.</b> A fight is over in minutes. Funding is a "
        "skew tax between events, not a hedge during the round. Combat binary is a worse vAMM than a "
        "BTC perp: no time to pull inventory, settlement is 0 or 1, recreational flow sits on the favourite.", S["Body"]))

    story.append(PageBreak())

    # 5 allocation
    story.append(Paragraph("5. Allocation — never one 500m book", S["H2"]))
    story.append(Paragraph(
        "The senior facility is a revolver. It is allocated as lines. The same UFC main on ten "
        "casino brands is one inventory (group cap), not ten siloed AMMs.", S["Body"]))
    caps = [[CB("Cap"), CB("% of F"), CB("On €500m"), CB("Rule")]]
    for r in [
        ("Event line", "2%", eur(event_line), "One fight, one L. Default seed."),
        ("Group / correlated", "4%", eur(group_line), "Same main across brands."),
        ("Brand", "15%", eur(brand_line), "One operator’s total live lines."),
        ("Peak util of F", "72% target", "—", "Halt new lev if a line >80%."),
    ]:
        caps.append([C(x) for x in r])
    story.append(tbl(caps, [40*mm, 28*mm, 36*mm, 70*mm]))
    story.append(Spacer(1, 4*mm))
    netting = [[CB("Topology"), CB("Drawn on 10 brands × one main"), CB("Verdict")]]
    for r in [
        ("Siloed (10 books)", eur(silo), "Forbidden. Multiplies the one-sided hole."),
        ("Netting hub (GRNT)", eur(net), "Required. Inventory nets. Carry falls."),
        ("Saved", eur(silo - net), "This is the point of the GRNT pool."),
    ]:
        netting.append([C(x) for x in r])
    story.append(tbl(netting, [48*mm, 62*mm, 64*mm]))

    # 6 facility
    story.append(Paragraph("6. Facility sizing — ten large sportsbooks", S["H2"]))
    story.append(Paragraph(
        "How large a pool ten large casinos need is not “a month of handle”. It is peak one-sided "
        "flow at a max impact, plus a buffer.", S["Body"]))
    story.append(Paragraph("monthly = n · H<br/>weekly  = monthly / (365/7/12)<br/>q_peak = weekly · peak_share<br/>R      = q_peak · (1 − s) / s<br/>need   = R / target_util", S["Eq"]))
    fac = [[CB("Input / output"), CB("Base case")]]
    for r in [
        ("Casinos n", "10"),
        ("Sports handle H each", eur(handle_each) + " / month"),
        ("Combined monthly", eur(monthly)),
        ("Weekly", eur(weekly)),
        ("Peak one-sided (8% of weekly)", eur(peak)),
        ("R at 2% impact", eur(R)),
        ("Need at 72% util", eur(need)),
        ("Facility F", eur(facility) + "  (covers need)"),
        ("Avg drawn 40%", eur(drawn)),
        ("Interest 6.5% on drawn", eur(drawn * rate) + " / year"),
        ("Commitment 0.75% undrawn", eur((facility - drawn) * commit) + " / year"),
        ("Total carry", eur(cost) + " / year"),
        ("LP take 0.70% of handle", eur(lp_rev) + " / year"),
        ("Coverage LP / carry", f"{lp_rev / cost:.2f}×"),
    ]:
        fac.append([C(x) for x in r])
    story.append(tbl(fac, [90*mm, 84*mm]))
    story.append(Paragraph(
        "€500m is the right senior size if H ≈ €40m/month per brand and peak is ~8% of weekly. "
        "If H is €80m+ or peak is 15% without a wider spread, add junior — do not enlarge the 6.5% loan. "
        "Tenor is 7–30 day revolving. Combat settles in hours. This is not a five-year loan.", S["Note"]))

    # 7 leverage
    story.append(Paragraph("7. Isolated margin (L4)", S["H2"]))
    story.append(Paragraph(
        "margin m = notional / lev, lev ∈ [1, 20]. The book sees notional. Ruin is capped to m. "
        "Liquidation unwinds inventory into the CPMM; the house is not the taker. "
        "If the liquidation queue exceeds 30s or the mark gap exceeds 2%: reject new 10x+, auto-deleverage. "
        "Cross-margin is forbidden. A parlay is a packaged book on the terminal, not a pooled margin.", S["Body"]))
    story.append(Paragraph("Liquidation (approx.) for a YES at odds o, lev λ:", S["Body"]))
    story.append(Paragraph("liq_odds ≈ o · (1 − 1/λ)   (isolated; haircut for spread/fees in production)", S["Eq"]))

    story.append(PageBreak())

    # 8 vAMM
    story.append(Paragraph("8. vAMM risk — why APEX is not Perp v1", S["H2"]))
    story.append(Paragraph(
        "A pure vAMM sets k virtually and holds cash in a vault. There is no natural other side. "
        "Open interest can be all YES. Winners are paid by an insurance fund. Perpetual Protocol "
        "abandoned this and rebuilt v2 on real Uniswap v3 liquidity. NFTPerp and Perp v1 (Luna/CREAM) "
        "are the case file. A 15-minute fight is a worse vAMM than a BTC perp: funding cannot mean-revert "
        "before the bell, settlement is binary, recreational flow is structurally long the favourite.", S["Body"]))
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
    story.append(tbl(risk, [28*mm, 30*mm, 36*mm, 38*mm, 42*mm]))

    story.append(Paragraph("Favourite-win hole (pure vAMM, all YES)", S["H3"]))
    story.append(Paragraph("margin     = N / lev<br/>payout     = N · (1 − p)<br/>uncovered  = max( 0, payout − (vault − margin) − junior )", S["Eq"]))
    hole_t = [[CB("Input"), CB("Stressed example")]]
    for r in [
        ("Net YES notional N", eur(N)),
        ("Entry p", f"{p:.2f}"),
        ("Leverage", f"{lev:.0f}×"),
        ("Vault / line", eur(vault)),
        ("Junior", eur(junior)),
        ("Margin posted", eur(margin)),
        ("Winner payout (1−p)·N", eur(hole)),
        ("Uncovered", eur(uncovered) + "  — HALT. Cut N, cut lev, or add first-loss. Do not widen k."),
    ]:
        hole_t.append([C(x) for x in r])
    story.append(tbl(hole_t, [70*mm, 104*mm]))
    story.append(Paragraph(
        "APEX rule: complete-set cash for unlevered flow. Leverage is a <b>bounded</b> vAMM: max "
        "favourite-win payout ≤ junior. Senior never pays winners. Virtual L never exceeds the vault "
        "on that line.", S["Body"]))

    # 9 tape
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
    story.append(KeepTogether([
        Paragraph("9. Halt tape", S["H2"]),
        tbl(tape, [28*mm, 72*mm, 74*mm]),
    ]))

    story.append(PageBreak())

    # 10 rules
    story.append(Paragraph("10. Operating rules (non-negotiable)", S["H2"]))
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
        "If any halt code trips, stop new leverage. Do not “wait and see” through a main event.",
    ], 1):
        story.append(Paragraph(f"{i}.  {r}", S["Rule"]))

    story.append(Paragraph("11. What the CPO is buying", S["H2"]))
    story.append(Paragraph(
        "A widget. Same 20x terminal. Dual-mode vault. GRNT senior revolver behind a junior first-loss. "
        "Tase 0% if the book is the pool and the house is not the taker. Commercial: SaaS from €6 000/mo "
        "+ 15% of APEX-routed NGR. Revolut Metal is a Phase 2 on-ramp (50 € lock), not a Pay N Play rail. "
        "Trustly/Zimpler/Brite stay on the cashier.", S["Body"]))

    story.append(Paragraph("13. AMM vs the exchange", S["H2"]))
    story.append(Paragraph(
        "A CPMM is a bonding curve, not a CLOB. Do not tell a CPO the fight book trades like a stock.", S["Body"]))
    story.append(Paragraph("Kyle λ at seed (YES buy)", S["H3"]))
    story.append(Paragraph("λ = dp/da at a=0 = 2(1 − p) / L", S["Eq"]))
    story.append(Paragraph(
        "On L = €10m, p = 0.62: λ = 7.6×10⁻⁸ per euro. Linear mid-move λ·Q on a €1.25m clip ≈ 0.095. "
        "Exact CPMM mid-move is smaller (convexity). Always use the curve for fills, λ only as a risk tape.", S["Body"]))
    story.append(Paragraph("Square-root law (Almgren, liquid equity)", S["H3"]))
    story.append(Paragraph("impact ≈ Y · σ · √(Q / ADV)<br/>Y ≈ 0.5    (empirical; not a quote)", S["Eq"]))
    xmap = [[CB(""), CB("Exchange / CLOB / futures"), CB("APEX CPMM")]]
    for r in [
        ("Mid", "(bid+ask)/2, last, or index", "p = q_no / (q_yes + q_no)"),
        ("Book", "Discrete ticks, hidden size", "Infinite infinitesimal bids on the curve"),
        ("Impact", "√Q. Path-dependent vs the tape", "Closed form. ~linear in Q/L, then convex"),
        ("Kyle λ", "Estimated from flow. Unstable", "Known, state-dependent. 2(1−p)/L"),
        ("Depth", "Shares inside 1 / 5 / 10 bps", "Cash a(i) that moves mid by i"),
        ("Spread", "Quoted + rebate. Avellaneda", "s0 + κ|skew|. Same idea, closed"),
        ("VWAP", "Vs the tape", "p_exec = a / YES_out"),
        ("Clearing", "CCP, novation, variation margin", "Complete set YES+NO = €1. Self-clears"),
        ("Netting", "Multilateral at the CCP", "GRNT hub. Ten brands, one book"),
        ("Margin", "SPAN / portfolio. Cross-net", "Isolated only. m = N/lev"),
        ("Halt", "LULD, volatility interruption", "SKEW, UTIL, ORACLE, LIQ"),
        ("Close", "Auction, then T+1/T+2", "Binary 0/1 at the bell. No unwind to pin"),
        ("MM PnL", "Spread − adverse selection", "Spread + IL. No token to print"),
        ("Fake depth", "Icebergs / spoof", "vAMM k >> vault. Forbidden"),
    ]:
        xmap.append([C(x) for x in r])
    story.append(tbl(xmap, [28*mm, 72*mm, 74*mm]))
    story.append(Paragraph("Worked clip — €1.25m", S["H3"]))
    clip_t = [[CB("Venue"), CB("Impact on €1.25m"), CB("Size that moves price 2%")]]
    for r in [
        ("APEX 10m line, p=0.62", "Fill ~6.8%. Mid ~13%", "~€0.17m"),
        ("Nordic large cap, ADV €80m, σ=2%, Y=0.5", "~12.5 bps (√Q)", "~€320m  (not comparable)"),
    ]:
        clip_t.append([C(x) for x in r])
    story.append(tbl(clip_t, [70*mm, 52*mm, 52*mm]))
    story.append(Paragraph(
        "Same euro clip is a rounding error on a cash equity and a whale on a fight line. "
        "That is why event cap is 2% of the 500m facility, not ADV of the sport. "
        "SPAN-style portfolio margin is forbidden: a parlay is a packaged book, not a net.", S["Note"]))

    story.append(Paragraph("14. Source of truth", S["H2"]))
    story.append(Paragraph(
        "Code: src/lib/liquidity.ts, lender.ts, vamm-risk.ts, exchange.ts. "
        "Interactive: APEX app → Lender pool. Public read: github.com/isomarkkupentti/grnt-apex-playbook. "
        "If the app and this PDF diverge, fix the PDF in the same commit as the code.", S["Body"]))
    story.append(HRFlowable(width="100%", thickness=1.6, color=GOLD, spaceBefore=10, spaceAfter=8))
    story.append(Paragraph(
        "GRNT Partners  ·  Helsinki  ·  APEX AMM Handbook v1.1  ·  16 September 2026", S["Meta"]))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(path)


if __name__ == "__main__":
    main()
