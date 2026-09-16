#!/usr/bin/env python3
"""GRNT APEX Playbook — A4 PDF, house tokens."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, Color
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, ListFlowable, ListItem, HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

NAVY = HexColor("#0E2841")
GOLD = HexColor("#C9A227")
PAPER = HexColor("#F7F5F0")
MUTED = HexColor("#5C6B7A")
RULE = HexColor("#D6D1C7")
INK = HexColor("#1A1A1A")

W, H = A4
MARGIN = 18 * mm


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, H - 12 * mm, W, 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(MARGIN, H - 7.5 * mm, "GRNT PARTNERS")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(W - MARGIN, H - 7.5 * mm, "APEX PLAYBOOK  ·  CONFIDENTIAL")
    canvas.setFillColor(GOLD)
    canvas.rect(0, H - 12 * mm - 1.5, W, 1.5, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, W, 10 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(MARGIN, 4 * mm, "16 Sep 2026  ·  Internal operating memo")
    canvas.drawRightString(W - MARGIN, 4 * mm, f"{doc.page}")
    canvas.restoreState()


def styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle(name="H1", fontName="Helvetica-Bold", fontSize=16, leading=20,
                         textColor=NAVY, spaceAfter=8, spaceBefore=0))
    s.add(ParagraphStyle(name="H2", fontName="Helvetica-Bold", fontSize=12, leading=16,
                         textColor=NAVY, spaceAfter=6, spaceBefore=14))
    s.add(ParagraphStyle(name="Body", fontName="Helvetica", fontSize=10, leading=16,
                         textColor=INK, spaceAfter=8))
    s.add(ParagraphStyle(name="Meta", fontName="Helvetica", fontSize=9, leading=13,
                         textColor=MUTED, spaceAfter=10))
    s.add(ParagraphStyle(name="Cell", fontName="Helvetica", fontSize=8.5, leading=12,
                         textColor=INK))
    s.add(ParagraphStyle(name="CellW", fontName="Helvetica", fontSize=8.5, leading=12,
                         textColor=white))
    s.add(ParagraphStyle(name="CellB", fontName="Helvetica-Bold", fontSize=8.5, leading=12,
                         textColor=white))
    s.add(ParagraphStyle(name="BulletB", fontName="Helvetica", fontSize=10, leading=15,
                         textColor=INK, leftIndent=12, spaceAfter=3))
    return s


def tbl(data, col_w):
    t = Table(data, colWidths=col_w, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("BACKGROUND", (0, 1), (-1, -1), white),
        ("ALIGN", (0, 0), (-1, 0), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
        ("LINEBELOW", (0, -1), (-1, -1), 0.4, RULE),
        ("BOX", (0, 0), (-1, -1), 0.4, RULE),
    ]))
    return t


def main():
    path = "/home/workdir/artifacts/GRNT_APEX_Playbook.pdf"
    doc = SimpleDocTemplate(
        path, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=20 * mm, bottomMargin=16 * mm, title="GRNT APEX Playbook",
        author="GRNT Partners",
    )
    S = styles()
    def C(t):
        return Paragraph(str(t), S["Cell"])
    def CW(t):
        return Paragraph(str(t), S["CellW"])
    def CB(t):
        return Paragraph(str(t), S["CellB"])
    story = []

    story.append(Paragraph("GRNT APEX Playbook", S["H1"]))
    story.append(Paragraph(
        "One operating book for the MMA paper-trading aggregator that becomes B2B SaaS, then AMM liquidity. "
        "Working name eGRIND is retired.", S["Meta"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=12))

    story.append(Paragraph("Name", S["H2"]))
    story.append(Paragraph(
        "<b>Primary product name: GRNT APEX.</b> Terminal for leveraged combat-sports markets. "
        "eGRIND reads as casino grind and is dropped. Keep APEX for CPO decks and investor one-pagers.", S["Body"]))

    name_rows = [[CB("Candidate"), CB("Use"), CB("Verdict")]]
    names = [
        ("GRNT APEX", "Product + B2B widget", "Primary. Already in the deck language."),
        ("GRNT TAPE", "Screener / live feed module", "Secondary module name only."),
        ("GRNT RING", "Consumer app skin", "Backup if APEX collides."),
        ("GRNT EDGE", "Quant layer / EV engine", "Engine name, not the product."),
        ("eGRIND", "Prior working title", "Do not use externally."),
    ]
    for a, b, c in names:
        name_rows.append([C(a), C(b), C(c)])
    story.append(tbl(name_rows, [40*mm, 70*mm, 64*mm]))

    story.append(Paragraph("Thesis (one line)", S["H2"]))
    story.append(Paragraph(
        "MMA fans will sit in a finance-grade terminal if the first version is paper money plus a route to a real book. "
        "Do not build an MGA book or an AMM until that conversion is measured.", S["Body"]))

    story.append(Paragraph("LTS — four phases", S["H2"]))
    phase = [[CB("Phase"), CB("Window"), CB("What ships"), CB("Money"), CB("Risk")]]
    phases = [
        ("1 Aggregator", "Mo 1–3", "Paper book, EV screener, copy feed, smart-route CPA", "CPA 100–150 €", "No licence, no float"),
        ("2 B2B widget", "Mo 4–12", "White-label iFrame / SDK inside an MGA UI", "SaaS 2–8 k€/mo + 10–20 % NGR", "Operator owns KYC"),
        ("3 AMM / Type 2", "Mo 12–24", "Own pool, funding rate, liquidation", "Volume skim", "Licence + capital"),
        ("4 Overlay / exit", "Y3+", "Stream HUD, wallet ingress, multi-sport", "Rev-share / M&A", "Scale, not product risk"),
    ]
    for r in phases:
        phase.append([C(x) for x in r])
    story.append(tbl(phase, [32*mm, 24*mm, 58*mm, 42*mm, 28*mm]))

    story.append(Paragraph("MVP 0.1 — cut list", S["H2"]))
    cut = [[CB("Layer"), CB("Full vision"), CB("MVP 0.1")]]
    cuts = [
        ("Cash", "Fiat/crypto wallets", "Virtual 10 000. Real stake via affiliate."),
        ("Risk", "Live AMM + liquidation", "Static margin formula on the client."),
        ("Odds", "Monte Carlo HPC", "Historical heuristic + The-Odds-API."),
        ("UX", "In-book widget", "Standalone PWA, dark terminal."),
        ("Social", "Paid copy book", "Public PnL board + 1-click copy of paper books."),
    ]
    for r in cuts:
        cut.append([C(x) for x in r])
    story.append(tbl(cut, [28*mm, 72*mm, 74*mm]))

    story.append(PageBreak())
    story.append(Paragraph("Stack and four-week sprint", S["H1"]))
    story.append(Paragraph(
        "Next.js 14 + Tailwind + Zustand · FastAPI · Supabase (auth, RLS, realtime) · Vercel / Render. "
        "One full-stack owner. No Web3 in phase 1.", S["Body"]))

    week = [[CB("Week"), CB("Done when")]]
    weeks = [
        ("1 Infra", "Schemas live. Odds cron writes market_odds. Google auth + 10 000 virtual."),
        ("2 Quant", "EV + quarter-Kelly. Open/close paper position. Admin resolve after the card."),
        ("3 Terminal", "Screener, trade slip, leverage slider, heatmap, live copy feed, leaderboard."),
        ("4 Route + live", "Best-book CTA with subid. E2E. Vercel prod. First paid X/Telegram test."),
    ]
    for a, b in weeks:
        week.append([C(a), C(b)])
    story.append(tbl(week, [32*mm, 142*mm]))

    story.append(Paragraph("Pay the builder in four milestones: 20 / 30 / 30 / 20. Micro-test 100 € before hire.", S["Body"]))

    story.append(Paragraph("Budget", S["H2"]))
    bud = [[CB("Line"), CB("MVP 0.1 €"), CB("Full book + Type 2 €")]]
    buds = [
        ("Build", "6 000", "50 000+"),
        ("API + infra (2 mo / run-rate)", "300", "5 000 / mo"),
        ("Legal / licence", "0", "~170 000"),
        ("GTM test / networks", "3 000", "95 000+"),
        ("Reserve", "700", "—"),
        ("Total", "< 10 000", "~320 000"),
    ]
    for r in buds:
        bud.append([C(x) for x in r])
    story.append(tbl(bud, [70*mm, 50*mm, 54*mm]))

    story.append(Paragraph("Phase-1 KPIs (first 10 days live)", S["H2"]))
    kpi = [[CB("Metric"), CB("Bar"), CB("Why it matters")]]
    kpis = [
        ("Active paper traders", "500", "Demand for the UX, not the brand."),
        ("Session length", "> 8 min", "CPO argument vs 45-second slip."),
        ("Smart-route CTR", "> 15 %", "Cash proof without a licence."),
    ]
    for r in kpis:
        kpi.append([C(x) for x in r])
    story.append(tbl(kpi, [48*mm, 32*mm, 94*mm]))

    story.append(Paragraph("GTM", S["H2"]))
    story.append(Paragraph(
        "Skip TV and bonus-war affiliates. Hit crypto-MMA overlap on X and Reddit (r/sportsbook, r/mma). "
        "Rev-share with existing tip channels on Telegram. Leaderboard is the organic engine. "
        "CTA only after a paper book is built: best combined price + CPA link.", S["Body"]))

    story.append(Paragraph("Partners", S["H2"]))
    part = [[CB("Seat"), CB("Name / type"), CB("Role in phase 1–2")]]
    parts = [
        ("Odds feed", "The-Odds-API", "Lines only. Not Sportradar until phase 2 volume."),
        ("Book CTA", "Unibet first, then 2–3 MGA books", "CPA. Do not promise exclusivity."),
        ("Auth / cash later", "Revolut Metal", "Phase 2–3 hook: locked 50 € margin + Pay N Play. Not MVP."),
        ("Talent", "EE / PL / RO full-stack, Lemon.io or direct GitHub", "6 k€ + 3–5 % option if B2B converts."),
        ("Do not chase now", "DAZN, Evolution, Kambi", "Phase 4 names. Using them in phase 1 weakens the pitch."),
    ]
    for r in parts:
        part.append([C(x) for x in r])
    story.append(tbl(part, [36*mm, 58*mm, 80*mm]))

    story.append(PageBreak())
    story.append(Paragraph("CPO argument (APEX vs slip)", S["H1"]))
    cpo = [[CB("Metric"), CB("Legacy slip"), CB("APEX"), CB("P&L")]]
    cpos = [
        ("UX", "1X2 coupon", "Leverage, heatmap, copy feed", "Stops bonus-only acquisition"),
        ("Hold", "4–6 % singles", "15–25 % packaged books", "Hold lift if parlays actually convert"),
        ("Session", "~45 s", "12–18 min target", "More touches per card"),
        ("Tase", "House vs player", "Phase 1: zero. Phase 3: AMM", "Do not sell AMM as live in MVP"),
        ("Integrate", "Backend swap", "iFrame / SDK", "Days, not quarters"),
    ]
    for r in cpos:
        cpo.append([C(x) for x in r])
    story.append(tbl(cpo, [28*mm, 42*mm, 52*mm, 52*mm]))

    story.append(Paragraph(
        "Do not put €539 M NPV or 11.6x GGR in a first CPO email. Those numbers are model output, not evidence. "
        "Lead with session time, CTR, and hold mix from a live paper book.", S["Body"]))

    story.append(Paragraph("Rules of engagement", S["H2"]))
    rules = [
        "No player funds on GRNT rails in phase 1.",
        "No MGA application until phase-1 KPIs clear.",
        "True odds in MVP are heuristics, labelled as such. Do not market them as a priced edge.",
        "Affiliate links must disclose. CPA is the only cash line until a signed SaaS.",
        "Copy-trading is paper only until the operator owns the stake.",
        "Revolut, DAZN, yield farming stay on the LTS page, not the sprint board.",
        "One product name in public: APEX.",
    ]
    for r in rules:
        story.append(Paragraph("•  " + r, S["BulletB"]))

    story.append(Paragraph("Next actions", S["H2"]))
    nexts = [
        "Freeze APEX as the name. Archive eGRIND.",
        "Stand up the monorepo and Supabase schema from the existing DEV-book. Do not rewrite it.",
        "Run the 24 h paid micro-test before locking the 6 k€ sprint.",
        "Register 2–3 affiliate accounts (Unibet-class) before week 4.",
        "Write the CPO mail from the matrix above. No valuation slide attached.",
    ]
    for i, r in enumerate(nexts, 1):
        story.append(Paragraph(f"{i}.  {r}", S["BulletB"]))

    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "Source: Gemini thread on MVP 0.1, AMM, DEV-book and APEX deck. This file is the operating cut, not a reprint.",
        S["Meta"]))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("wrote", path)


if __name__ == "__main__":
    main()
