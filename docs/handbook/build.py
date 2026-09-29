#!/usr/bin/env python3
"""
AlgoViz 2.0 — Complete Technical Interview Handbook
Renderer: Markdown-subset  ->  ReportLab Platypus  ->  PDF
"""
import os
import re
import sys
import glob
import html

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, StyleSheet1
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Preformatted, Flowable, CondPageBreak, NextPageTemplate,
)
from reportlab.platypus.tableofcontents import TableOfContents

REPO = "/home/user/Algoviz-2.0"
CONTENT_DIR = "/tmp/handbook/content"
OUT = os.path.join(REPO, "ALGOVIZ_2_0_COMPLETE_TECHNICAL_INTERVIEW_HANDBOOK.pdf")

# ----------------------------------------------------------------------------
# fonts
# ----------------------------------------------------------------------------
FD = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("Body", f"{FD}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Body-Bold", f"{FD}/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Mono", f"{FD}/DejaVuSansMono.ttf"))
pdfmetrics.registerFont(TTFont("Mono-Bold", f"{FD}/DejaVuSansMono-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Serif", f"{FD}/DejaVuSerif.ttf"))
pdfmetrics.registerFont(TTFont("Serif-Bold", f"{FD}/DejaVuSerif-Bold.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("Body", normal="Body", bold="Body-Bold", italic="Body", boldItalic="Body-Bold")
registerFontFamily("Mono", normal="Mono", bold="Mono-Bold", italic="Mono", boldItalic="Mono-Bold")

# ----------------------------------------------------------------------------
# palette
# ----------------------------------------------------------------------------
INK        = colors.HexColor("#16202B")
NAVY       = colors.HexColor("#0B2A4A")
NAVY_D     = colors.HexColor("#07192C")
ACCENT     = colors.HexColor("#0E7C86")
ACCENT_L   = colors.HexColor("#E3F2F3")
GREY       = colors.HexColor("#5B6874")
GREY_L     = colors.HexColor("#F3F5F7")
GREY_M     = colors.HexColor("#E2E6EA")
RED        = colors.HexColor("#A02020")
RED_L      = colors.HexColor("#FBEDEC")
GREEN      = colors.HexColor("#166A38")
GREEN_L    = colors.HexColor("#EAF5EE")
AMBER      = colors.HexColor("#92590A")
AMBER_L    = colors.HexColor("#FDF4E3")
PURPLE     = colors.HexColor("#4E3A82")
PURPLE_L   = colors.HexColor("#F0EDF9")
CODE_BG    = colors.HexColor("#F6F8FA")
CODE_BAR   = colors.HexColor("#C9D3DC")
WHITE      = colors.white

BOX_KINDS = {
    # kind: (label, border/bar colour, background, label colour)
    "q":      ("INTERVIEW QUESTION", NAVY,   colors.HexColor("#EEF3F8"), NAVY),
    "danger": ("DANGER ZONE — WHERE CANDIDATES DIE", RED, RED_L, RED),
    "must":   ("MUST KNOW", GREEN, GREEN_L, GREEN),
    "trap":   ("TRAP", colors.HexColor("#8A1C1C"), RED_L, colors.HexColor("#8A1C1C")),
    "answer": ("MODEL ANSWER", GREEN, GREEN_L, GREEN),
    "note":   ("NOTE", GREY, GREY_L, GREY),
    "key":    ("KEY TAKEAWAY", ACCENT, ACCENT_L, ACCENT),
    "proposed": ("PROPOSED — NOT IMPLEMENTED", PURPLE, PURPLE_L, PURPLE),
    "verified": ("SOURCE EVIDENCE", GREEN, GREEN_L, GREEN),
    "notverified": ("NOT VERIFIED BY SOURCE", AMBER, AMBER_L, AMBER),
    "inference": ("INFERENCE", ACCENT, ACCENT_L, ACCENT),
    "weak":   ("WEAKNESS / LIMITATION", AMBER, AMBER_L, AMBER),
    "script": ("SAY THIS OUT LOUD", ACCENT, ACCENT_L, ACCENT),
    "debug":  ("DEBUGGING", PURPLE, PURPLE_L, PURPLE),
    "check":  ("CHECKLIST", NAVY, colors.HexColor("#EEF3F8"), NAVY),
    "mock":   ("MOCK INTERVIEW", NAVY_D, colors.HexColor("#EDF1F5"), NAVY_D),
    "resume": ("RESUME CLAIM", NAVY, colors.HexColor("#EEF3F8"), NAVY),
    "day":    ("STUDY PLAN", ACCENT, ACCENT_L, ACCENT),
    "code":   ("CODE NOTE", GREY, GREY_L, GREY),
}

# ----------------------------------------------------------------------------
# styles
# ----------------------------------------------------------------------------
S = StyleSheet1()
S.add(ParagraphStyle("Body", fontName="Body", fontSize=9.6, leading=13.4,
                     textColor=INK, alignment=TA_JUSTIFY, spaceAfter=5.2))
S.add(ParagraphStyle("BodyC", parent=S["Body"], alignment=TA_LEFT))
S.add(ParagraphStyle("H1", fontName="Body-Bold", fontSize=20, leading=23.5,
                     textColor=WHITE, spaceBefore=0, spaceAfter=0))
S.add(ParagraphStyle("H1sub", fontName="Body", fontSize=9.5, leading=13,
                     textColor=colors.HexColor("#AFC3D6")))
S.add(ParagraphStyle("Eyebrow", fontName="Body-Bold", fontSize=7.6, leading=10,
                     textColor=colors.HexColor("#7FB6C6")))
S.add(ParagraphStyle("H2", fontName="Body-Bold", fontSize=13.2, leading=16.5,
                     textColor=NAVY, spaceBefore=13, spaceAfter=5))
S.add(ParagraphStyle("H3", fontName="Body-Bold", fontSize=10.8, leading=14,
                     textColor=NAVY, spaceBefore=10, spaceAfter=4))
S.add(ParagraphStyle("H4", fontName="Body-Bold", fontSize=9.6, leading=13,
                     textColor=ACCENT, spaceBefore=8, spaceAfter=3))
S.add(ParagraphStyle("Bullet", parent=S["Body"], leftIndent=12, bulletIndent=3,
                     spaceAfter=2.6, alignment=TA_LEFT))
S.add(ParagraphStyle("Bullet2", parent=S["Bullet"], leftIndent=24, bulletIndent=14))
S.add(ParagraphStyle("Bullet3", parent=S["Bullet"], leftIndent=36, bulletIndent=26))
S.add(ParagraphStyle("Check", parent=S["Body"], leftIndent=14, bulletIndent=2,
                     spaceAfter=2.2, alignment=TA_LEFT))
S.add(ParagraphStyle("Quote", parent=S["Body"], leftIndent=12, rightIndent=6,
                     textColor=GREY, fontName="Body", spaceBefore=3, spaceAfter=5))
S.add(ParagraphStyle("Code", fontName="Mono", fontSize=7.0, leading=8.9,
                     textColor=INK, spaceBefore=0, spaceAfter=0))
S.add(ParagraphStyle("CodeCaption", fontName="Body-Bold", fontSize=7.4, leading=9.6,
                     textColor=GREY, spaceBefore=1.5, spaceAfter=3))
S.add(ParagraphStyle("TblH", fontName="Body-Bold", fontSize=7.9, leading=10.2,
                     textColor=WHITE))
S.add(ParagraphStyle("Tbl", fontName="Body", fontSize=7.9, leading=10.2,
                     textColor=INK))
S.add(ParagraphStyle("TblB", parent=S["Tbl"], fontName="Body-Bold"))
S.add(ParagraphStyle("BoxBody", parent=S["Body"], fontSize=9.3, leading=12.8,
                     spaceAfter=4))
S.add(ParagraphStyle("BoxH", fontName="Body-Bold", fontSize=8.2, leading=11,
                     textColor=NAVY, spaceAfter=2.5))
S.add(ParagraphStyle("BoxTbl", fontName="Body", fontSize=7.5, leading=9.7))
S.add(ParagraphStyle("BoxTblH", fontName="Body-Bold", fontSize=7.5, leading=9.7,
                     textColor=WHITE))
S.add(ParagraphStyle("BoxBullet", parent=S["BoxBody"], leftIndent=12, bulletIndent=3,
                     spaceAfter=2.0, alignment=TA_LEFT))
S.add(ParagraphStyle("BoxBullet2", parent=S["BoxBullet"], leftIndent=22, bulletIndent=12))
S.add(ParagraphStyle("TOCH", fontName="Body-Bold", fontSize=10.5, leading=15,
                     textColor=NAVY, spaceBefore=7))
S.add(ParagraphStyle("TOC1", fontName="Body-Bold", fontSize=8.6, leading=12.4,
                     textColor=INK, leftIndent=0))
S.add(ParagraphStyle("TOC2", fontName="Body", fontSize=8.1, leading=11.4,
                     textColor=GREY, leftIndent=12))
S.add(ParagraphStyle("CoverT", fontName="Body-Bold", fontSize=31, leading=35,
                     textColor=WHITE, alignment=TA_LEFT))
S.add(ParagraphStyle("CoverS", fontName="Body", fontSize=13, leading=18,
                     textColor=colors.HexColor("#B9D2E4"), alignment=TA_LEFT))
S.add(ParagraphStyle("CoverMeta", fontName="Body", fontSize=9.2, leading=13.5,
                     textColor=colors.HexColor("#8FA9BE")))
S.add(ParagraphStyle("PartEyebrow", fontName="Body-Bold", fontSize=9, leading=12,
                     textColor=colors.HexColor("#7FB6C6")))
S.add(ParagraphStyle("PartT", fontName="Body-Bold", fontSize=25, leading=29,
                     textColor=WHITE))
S.add(ParagraphStyle("PartD", fontName="Body", fontSize=10.5, leading=15,
                     textColor=colors.HexColor("#C6D6E4")))

PAGE_W, PAGE_H = A4
LM = RM = 60
TM = 58
BM = 52
FRAME_W = PAGE_W - LM - RM

# ----------------------------------------------------------------------------
# inline markup
# ----------------------------------------------------------------------------
XML_SAFE = re.compile(r"[&<>]")

def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

CODE_SPLIT = re.compile(r"(`[^`]+`)")

def inline(text, base_size=None):
    """Convert a markdown inline string to ReportLab paragraph markup."""
    out = []
    for part in CODE_SPLIT.split(text):
        if part.startswith("`") and part.endswith("`") and len(part) > 1:
            body = esc(part[1:-1])
            sz = f' size="{base_size}"' if base_size else ""
            out.append(f'<font name="Mono"{sz} color="#1F4E79">{body}</font>')
        else:
            s = esc(part)
            s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
            s = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r'<font color="#0E7C86">\1</font>', s)
            out.append(s)
    return "".join(out)


def strip_md(text):
    """Plain text version (for headers/bookmarks)."""
    t = re.sub(r"`([^`]+)`", r"\1", text)
    t = t.replace("**", "").replace("*", "")
    return t.strip()


# ----------------------------------------------------------------------------
# flowables
# ----------------------------------------------------------------------------
class SplitPreformatted(Preformatted):
    """Preformatted text that can split across pages, line by line."""
    def __init__(self, text, style, maxWidth):
        Preformatted.__init__(self, text, style, maxLineLength=None)
        self.maxWidth = maxWidth

    def split(self, availWidth, availHeight):
        style = self.style
        lines = self.lines
        n = max(1, int((availHeight - 4) // style.leading))
        if n >= len(lines):
            return []
        head = lines[:n]
        tail = lines[n:]
        f1 = SplitPreformatted("\n".join(head), style, self.maxWidth)
        f2 = SplitPreformatted("\n".join(tail), style, self.maxWidth)
        return [f1, f2]


def _code_table(chunk_text, st, avail):
    inner = SplitPreformatted(chunk_text, st, avail)
    t = Table([[inner]], colWidths=[FRAME_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CODE_BG),
        ("LINEBEFORE", (0, 0), (0, -1), 2.4, CODE_BAR),
        ("BOX", (0, 0), (-1, -1), 0.4, GREY_M),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def code_block(text, caption=None):
    """Monospace block with a left accent bar, pre-chunked to fit a page."""
    raw_lines = text.split("\n")
    maxlen = max((len(l) for l in raw_lines), default=1)
    avail = FRAME_W - 16
    size = min(7.0, avail / (0.6023 * max(1, maxlen)))
    size = max(4.9, size)
    leading = size * 1.27
    st = ParagraphStyle("codeX", parent=S["Code"], fontSize=size, leading=leading)
    # keep each chunk comfortably below the usable frame height
    per = max(8, int(600.0 // leading))
    chunks = ["\n".join(raw_lines[i:i + per]) for i in range(0, len(raw_lines), per)]
    res = []
    if caption:
        res.append(Paragraph(inline(f"`{caption}`"), S["CodeCaption"]))
    for i, ch in enumerate(chunks):
        if i:
            res.append(Paragraph(
                inline(f"`… continued ({i + 1}/{len(chunks)})`"), S["CodeCaption"]))
        res.append(_code_table(ch, st, avail))
        if i < len(chunks) - 1:
            res.append(Spacer(1, 3))
    res.append(Spacer(1, 6))
    return res


def _col_widths(grid, total):
    """Estimate column widths from content length, then normalise to `total`."""
    ncol = max(len(r) for r in grid)
    weights = []
    for c in range(ncol):
        mx = 0
        for r in grid:
            if c < len(r):
                txt = strip_md(r[c])
                # longest single word dominates the minimum width
                word = max((len(w) for w in txt.split()), default=1)
                mx = max(mx, min(len(txt), 60) * 0.62 + word * 0.38 + 2)
        weights.append(max(6.0, mx))
    s = sum(weights)
    widths = [total * w / s for w in weights]
    # clamp: no column below 9% or above 46% of the table
    widths = [min(max(w, total * 0.085), total * 0.46) for w in widths]
    s = sum(widths)
    return [w * total / s for w in widths]


def parse_table_block(rows, box=False, total=None):
    """rows: list of raw '| a | b |' strings -> Table flowable."""
    grid = []
    for i, raw in enumerate(rows):
        cells = raw.strip()
        if cells.startswith("|"):
            cells = cells[1:]
        if cells.endswith("|"):
            cells = cells[:-1]
        # split on UNESCAPED pipes so a literal \| can live inside a cell
        parts = [c.replace("\\|", "|").strip() for c in re.split(r"(?<!\\)\|", cells)]
        if i == 1 and all(re.fullmatch(r":?-{2,}:?", p) for p in parts):
            continue
        grid.append(parts)
    if not grid:
        return Spacer(1, 1)
    ncol = max(len(r) for r in grid)
    grid = [r + [""] * (ncol - len(r)) for r in grid]
    tot = total if total else FRAME_W
    hs = S["BoxTblH"] if box else S["TblH"]
    bs = S["BoxTbl"] if box else S["Tbl"]
    data = []
    for ri, row in enumerate(grid):
        st = hs if ri == 0 else bs
        data.append([Paragraph(inline(c, base_size=7.1 if box else 7.5), st) for c in row])
    widths = _col_widths(grid, tot)
    t = Table(data, colWidths=widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY if not box else colors.HexColor("#20344A")),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.35, GREY_M),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4.5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4.5),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
    for ri in range(1, len(data)):
        if ri % 2 == 0:
            style.append(("BACKGROUND", (0, ri), (-1, ri), colors.HexColor("#F4F7F9")))
    t.setStyle(TableStyle(style))
    return t


def make_box(kind, title, flowables):
    """Tinted box with accent bar; auto-splits if taller than a page."""
    _, bar, bg, _lab = BOX_KINDS.get(kind, (kind.upper(), GREY, GREY_L, GREY))
    label = BOX_KINDS.get(kind, (kind.upper(),))[0]
    head_txt = title.strip() if title.strip() else label
    head = Paragraph(inline(head_txt.upper()), ParagraphStyle(
        "bxh", parent=S["BoxH"], textColor=bar))
    # a kind label above the custom title, so every box is scannable by type
    lab_style = ParagraphStyle("bxl", parent=S["BoxH"], fontSize=6.9, leading=8.4,
                               textColor=bar, spaceAfter=1.6)
    lab = (Paragraph(inline(label), lab_style)
           if title.strip() and label.lower() != head_txt.lower() else None)

    def build(chunk, first):
        if first:
            content = ([lab] if lab is not None else []) + [head] + chunk
        else:
            content = [Paragraph(
                inline(head_txt.upper() + " (continued)"),
                ParagraphStyle("bxh2", parent=S["BoxH"], textColor=bar))] + chunk
        cellw = FRAME_W - 4 - 16
        t = Table([["", content]], colWidths=[4, FRAME_W - 4])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), bar),
            ("BACKGROUND", (1, 0), (1, 0), bg),
            ("LEFTPADDING", (0, 0), (0, 0), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 0),
            ("TOPPADDING", (0, 0), (0, 0), 0),
            ("BOTTOMPADDING", (0, 0), (0, 0), 0),
            ("LEFTPADDING", (1, 0), (1, 0), 9),
            ("RIGHTPADDING", (1, 0), (1, 0), 8),
            ("TOPPADDING", (1, 0), (1, 0), 6),
            ("BOTTOMPADDING", (1, 0), (1, 0), 6),
            ("BOX", (1, 0), (1, 0), 0.4, bar),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        return t

    # measure and chunk
    cellw = FRAME_W - 4 - 29
    heights = []
    for f in flowables:
        try:
            w, h = f.wrap(cellw, 10000)
            heights.append(h)
        except Exception:
            heights.append(20)
    chunks, cur, curh = [], [], 0
    for f, h in zip(flowables, heights):
        if cur and curh + h > 560:
            chunks.append(cur)
            cur, curh = [], 0
        cur.append(f)
        curh += h + 2
    if cur:
        chunks.append(cur)
    out = []
    for i, ch in enumerate(chunks):
        out.append(build(ch, i == 0))
        if i < len(chunks) - 1:
            out.append(Spacer(1, 5))
    return out


class HRule(Flowable):
    def __init__(self, width, color=GREY_M, thickness=0.6, space=3):
        Flowable.__init__(self)
        self.width = width
        self.color = color
        self.thickness = thickness
        self.space = space
        self.height = thickness + space

    def wrap(self, aw, ah):
        return (aw, self.height)

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.space, self.width, self.space)


class RuleNum(Flowable):
    """Chapter eyebrow: 'CHAPTER 07' + a rule."""
    def __init__(self, label, color=ACCENT, width=FRAME_W):
        Flowable.__init__(self)
        self.label = label
        self.color = color
        self.width = width
        self.height = 16

    def wrap(self, aw, ah):
        self.width = aw
        return (aw, self.height)

    def draw(self):
        c = self.canv
        c.setFont("Body-Bold", 7.6)
        c.setFillColor(self.color)
        c.drawString(0, 6, self.label)
        tw = c.stringWidth(self.label, "Body-Bold", 7.6)
        c.setStrokeColor(self.color)
        c.setLineWidth(0.8)
        c.line(tw + 7, 8.6, self.width, 8.6)


class TitleBar(Flowable):
    """Full-width navy title bar used for chapter headings."""
    def __init__(self, title, subtitle="", width=FRAME_W):
        Flowable.__init__(self)
        self.title = title
        self.subtitle = subtitle
        self.width = width
        self.pad = 13
        ts = ParagraphStyle("t", parent=S["H1"])
        sub = ParagraphStyle("s", parent=S["H1sub"])
        self.p_title = Paragraph(esc(self.title), ts)
        self.p_sub = Paragraph(inline(self.subtitle), sub) if self.subtitle else None
        aw = width - 2 * self.pad
        w1, h1 = self.p_title.wrap(aw, 10000)
        h2 = 0
        if self.p_sub:
            _, h2 = self.p_sub.wrap(aw, 10000)
            h2 += 4
        self.height = h1 + h2 + 2 * self.pad

    def wrap(self, aw, ah):
        self.width = aw
        return (aw, self.height)

    def draw(self):
        c = self.canv
        c.setFillColor(NAVY)
        c.rect(0, 0, self.width, self.height, stroke=0, fill=1)
        c.setFillColor(ACCENT)
        c.rect(0, 0, self.width, 3.2, stroke=0, fill=1)
        aw = self.width - 2 * self.pad
        y = self.height - self.pad
        w, h = self.p_title.wrap(aw, 10000)
        y -= h
        self.p_title.drawOn(c, self.pad, y)
        if self.p_sub:
            y -= 4
            w, h = self.p_sub.wrap(aw, 10000)
            y -= h
            self.p_sub.drawOn(c, self.pad, y)


# ----------------------------------------------------------------------------
# document template
# ----------------------------------------------------------------------------
class Book(BaseDocTemplate):
    def __init__(self, filename, **kw):
        BaseDocTemplate.__init__(self, filename, pagesize=A4,
                                 leftMargin=LM, rightMargin=RM,
                                 topMargin=TM, bottomMargin=BM,
                                 title="AlgoViz 2.0 — Complete Technical Interview Handbook",
                                 author="Prepared for Siva Charan K.G.",
                                 subject="Source-grounded interview preparation for the AlgoViz 2.0 project",
                                 creator="AlgoViz Handbook Builder", **kw)
        frame = Frame(LM, BM, FRAME_W, PAGE_H - TM - BM, id="body",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[frame], onPage=self.cover_page),
            PageTemplate(id="body", frames=[frame], onPage=self.deco),
        ])
        self.cur_part = "AlgoViz 2.0"
        self.cur_chapter = "Table of contents"

    # Each multi-build pass starts with the running header set to the TOC title,
    # so the first TOC page never inherits the last heading of the previous pass.
    def build(self, flowables, *a, **k):
        self.cur_chapter = "Table of contents"
        return BaseDocTemplate.build(self, flowables, *a, **k)

    # ---- page furniture -------------------------------------------------
    def deco(self, canv, doc):
        canv.saveState()
        canv.setFont("Body", 7.2)
        canv.setFillColor(GREY)
        left = f"AlgoViz 2.0 — Complete Technical Interview Handbook"
        canv.drawString(LM, PAGE_H - TM + 24, left)
        canv.setFillColor(ACCENT)
        canv.setFont("Body-Bold", 7.2)
        chap = self.cur_chapter[:74]
        canv.drawRightString(PAGE_W - RM, PAGE_H - TM + 24, chap)
        canv.setStrokeColor(GREY_M)
        canv.setLineWidth(0.5)
        canv.line(LM, PAGE_H - TM + 18, PAGE_W - RM, PAGE_H - TM + 18)
        canv.line(LM, BM - 15, PAGE_W - RM, BM - 15)
        canv.setFont("Body-Bold", 8.4)
        canv.setFillColor(NAVY)
        canv.drawCentredString(PAGE_W / 2, BM - 28, str(doc.page))
        canv.setFont("Body", 6.8)
        canv.setFillColor(GREY)
        canv.drawString(LM, BM - 28, "AlgoViz 2.0 Handbook")
        canv.drawRightString(PAGE_W - RM, BM - 28, "Source-grounded • verified against the repository")
        canv.restoreState()

    def cover_page(self, canv, doc):
        canv.saveState()
        canv.setFillColor(NAVY_D)
        canv.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        canv.setFillColor(colors.HexColor("#102A44"))
        canv.rect(0, PAGE_H * 0.52, PAGE_W, PAGE_H * 0.20, stroke=0, fill=1)
        canv.setFillColor(ACCENT)
        canv.rect(0, PAGE_H * 0.52, 7, PAGE_H * 0.48, stroke=0, fill=1)
        canv.setFillColor(ACCENT)
        canv.rect(LM, 132, 120, 3.4, stroke=0, fill=1)
        canv.restoreState()

    # ---- toc / bookmarks / header tracking ------------------------------
    @staticmethod
    def _toc_text(s):
        t = strip_md(s)
        # reportlab embeds the toc label inside a single-quoted python literal,
        # so ASCII quotes and backslashes must not survive
        t = t.replace('"', "\u201d").replace("'", "\u2019").replace("\\", "/")
        t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        return t

    def afterFlowable(self, flowable):
        if isinstance(flowable, TitleBar):
            t = self._toc_text(flowable.title)
            self.cur_chapter = t
            key = f"ch{self.page}{t}"
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(t, key, level=0, closed=False)
            self.notify("TOCEntry", (0, t, self.page, key))
        elif isinstance(flowable, PartDivider):
            t = self._toc_text(flowable.title)
            self.cur_part = t
            self.cur_chapter = t
            key = f"pt{self.page}{t}"
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(t, key, level=0, closed=True)
            self.notify("TOCEntry", (0, t, self.page, key))
        elif isinstance(flowable, Paragraph):
            sn = flowable.style.name
            txt = self._toc_text(flowable.getPlainText())
            if sn == "H2":
                self.cur_chapter = txt
                key = f"h2{self.page}{txt}"
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(txt, key, level=1, closed=True)
                self.notify("TOCEntry", (1, txt, self.page, key))
            elif sn == "H3":
                key = f"h3{self.page}{txt}"
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(txt, key, level=2, closed=True)
                self.notify("TOCEntry", (2, txt, self.page, key))


class PartDivider(Flowable):
    def __init__(self, title, blurb="", part_no=""):
        Flowable.__init__(self)
        self.title = title
        self.blurb = blurb
        self.part_no = part_no
        self.height = 150

    def wrap(self, aw, ah):
        self.width = aw
        return (aw, self.height)

    def draw(self):
        c = self.canv
        w = self.width
        c.setFillColor(NAVY_D)
        c.rect(0, 0, w, self.height, stroke=0, fill=1)
        c.setFillColor(ACCENT)
        c.rect(0, self.height - 4, w, 4, stroke=0, fill=1)
        c.setFillColor(colors.HexColor("#7FB6C6"))
        c.setFont("Body-Bold", 8.6)
        c.drawString(14, self.height - 26, self.part_no.upper())
        c.setFillColor(WHITE)
        c.setFont("Body-Bold", 19)
        words = self.title.split()
        lines, cur = [], ""
        for wd in words:
            t = (cur + " " + wd).strip()
            if c.stringWidth(t, "Body-Bold", 19) > w - 28:
                lines.append(cur); cur = wd
            else:
                cur = t
        lines.append(cur)
        y = self.height - 48
        for ln in lines[:3]:
            c.drawString(14, y, ln)
            y -= 23
        if self.blurb:
            c.setFillColor(colors.HexColor("#AFC3D6"))
            c.setFont("Body", 8.8)
            yy = y - 8
            for ln in re.findall(r".{1,88}(?:\s|$)", self.blurb):
                c.drawString(14, yy, ln.strip())
                yy -= 12
        c.setFillColor(ACCENT)
        c.rect(14, 12, 90, 2.6, stroke=0, fill=1)


class DividerFlow(Flowable):
    """Marker flowable that switches to a fresh page & draws nothing."""
    def __init__(self, height=1):
        Flowable.__init__(self)
        self.height = height

    def wrap(self, aw, ah):
        return (aw, self.height)

    def draw(self):
        pass


# ----------------------------------------------------------------------------
# markdown -> flowables
# ----------------------------------------------------------------------------
def read_include(arg):
    """@@code <path> [start] [end]  -> (text, caption)"""
    parts = arg.split()
    rel = parts[0]
    path = os.path.join(REPO, rel)
    with open(path, encoding="utf-8") as fh:
        lines = fh.read().rstrip("\n").split("\n")
    if len(parts) == 3:
        a, b = int(parts[1]), int(parts[2])
        lines = lines[a - 1:b]
        cap = f"{rel}  ·  lines {a}\u2013{b} (verbatim)"
    elif len(parts) == 2:
        a = int(parts[1])
        lines = lines[a - 1:]
        cap = f"{rel}  ·  from line {a} (verbatim)"
    else:
        cap = f"{rel}  (verbatim, {len(lines)} lines)"
    return "\n".join(lines), cap


class Parser:
    def __init__(self):
        self.flow = []

    # -- helpers
    def paras(self, text):
        return text

    def emit_para(self, buf, style="Body"):
        txt = " ".join(x.strip() for x in buf).strip()
        if txt:
            self.flow.append(Paragraph(inline(txt), S[style]))

    def parse_lines(self, lines, mode="top", box_kind=None):
        """Return list of flowables for a block of lines."""
        out = []
        i = 0
        n = len(lines)
        B = S["BoxBullet"] if mode == "box" else S["Bullet"]
        B2 = S["BoxBullet2"] if mode == "box" else S["Bullet2"]
        P = S["BoxBody"] if mode == "box" else S["Body"]
        while i < n:
            raw = lines[i]
            line = raw.rstrip()
            s = line.strip()

            # blank
            if not s:
                i += 1
                continue

            # part divider
            if s.startswith("%PART:"):
                spec = s[len("%PART:"):].strip()
                title = spec
                blurb = ""
                pno = ""
                if "|" in spec:
                    chunks = [c.strip() for c in spec.split("|")]
                    title = chunks[0]
                    pno = chunks[1] if len(chunks) > 1 else ""
                    blurb = chunks[2] if len(chunks) > 2 else ""
                out.append(NextPageTemplate("body"))
                out.append(PageBreak())
                out.append(PartDivider(title, blurb, pno))
                out.append(Spacer(1, 12))
                # frame for part blurb text follows as normal markdown
                i += 1
                continue

            # code fence
            if s.startswith("```"):
                i += 1
                buf = []
                while i < n and not lines[i].strip().startswith("```"):
                    buf.append(lines[i])
                    i += 1
                i += 1
                out.extend(code_block("\n".join(buf)))
                continue

            # include directive
            if s.startswith("@@code"):
                arg = s[len("@@code"):].strip()
                txt, cap = read_include(arg)
                out.extend(code_block(txt, cap))
                i += 1
                continue

            # directive box
            m = re.match(r"^:::(\w+)\s*(.*)$", s)
            if m:
                kind = m.group(1)
                title = m.group(2).strip()
                i += 1
                buf = []
                while i < n and lines[i].strip() != ":::":
                    buf.append(lines[i])
                    i += 1
                i += 1
                sub = self.parse_lines(buf, mode="box", box_kind=kind)
                out.extend(make_box(kind, title, sub))
                out.append(Spacer(1, 5))
                continue

            # headings
            if s.startswith("#### "):
                out.append(Paragraph(inline(s[5:]), S["H4"]))
                i += 1
                continue
            if s.startswith("### "):
                out.append(Paragraph(inline(s[4:]), S["H3"]))
                i += 1
                continue
            if s.startswith("## "):
                out.append(CondPageBreak(70))
                out.append(Paragraph(inline(s[3:]), S["H2"]))
                i += 1
                continue
            if s.startswith("# "):
                title = s[2:].strip()
                i += 1
                sub = ""
                if i < n and lines[i].strip().startswith("> "):
                    sub = lines[i].strip()[2:].strip()
                    i += 1
                out.append(NextPageTemplate("body"))
                out.append(PageBreak())
                # keep the eyebrow and the title bar on the same page
                out.append(KeepTogether([
                    RuleNum(f"CHAPTER {title.split('·')[0].strip()}"),
                    TitleBar(strip_md(title), strip_md(sub)),
                ]))
                out.append(Spacer(1, 8))
                continue

            # horizontal rule
            if re.fullmatch(r"-{3,}|\*{3,}", s):
                out.append(Spacer(1, 3))
                out.append(HRule(FRAME_W))
                out.append(Spacer(1, 3))
                i += 1
                continue

            # table
            if s.startswith("|"):
                rows = []
                while i < n and lines[i].strip().startswith("|"):
                    rows.append(lines[i])
                    i += 1
                out.append(Spacer(1, 2))
                out.append(parse_table_block(rows, box=(mode == "box"),
                                            total=(FRAME_W - 33 if mode == "box" else None)))
                out.append(Spacer(1, 6))
                continue

            # quote
            if s.startswith("> "):
                buf = []
                while i < n and lines[i].strip().startswith("> "):
                    buf.append(lines[i].strip()[2:])
                    i += 1
                txt = " ".join(buf)
                sty = ParagraphStyle("q", parent=S["Quote"],
                                     fontSize=8.8, leading=12.2)
                out.append(Paragraph(inline(txt), sty))
                continue

            # checklist
            if re.match(r"^- \[[ xX]\] ", s) or s == "- [ ]":
                buf = []
                while i < n and re.match(r"^\s*- \[[ xX]?\] ?", lines[i]):
                    item = re.sub(r"^\s*- \[[ xX]?\] ?", "", lines[i]).strip()
                    buf.append(item)
                    i += 1
                for it in buf:
                    out.append(Paragraph(inline(it), S["Check"], bulletText="\u2610"))
                continue

            # bullets
            if re.match(r"^\s*[-*] ", raw):
                indent = len(raw) - len(raw.lstrip())
                item = re.sub(r"^\s*[-*] ", "", raw).strip()
                sty = B if indent < 2 else (B2 if indent < 4 else (S["BoxBullet2"] if mode == "box" else S["Bullet3"]))
                bul = "\u2022" if indent < 2 else ("\u2013" if indent < 4 else "\u25aa")
                out.append(Paragraph(inline(item), sty, bulletText=bul))
                i += 1
                continue

            # numbered
            if re.match(r"^\s*\d+[.)] ", raw):
                item = re.sub(r"^\s*\d+[.)] ", "", raw).strip()
                num = re.match(r"^\s*(\d+)[.)] ", raw).group(1)
                out.append(Paragraph(inline(item), B, bulletText=f"{num}."))
                i += 1
                continue

            # paragraph (gather until blank)
            buf = [s]
            i += 1
            while i < n:
                nxt = lines[i]
                ns = nxt.strip()
                if (not ns or ns.startswith("```") or ns.startswith("#") or
                        ns.startswith("|") or ns.startswith(":::") or ns.startswith("> ") or
                        ns.startswith("@@code") or ns.startswith("%PART:") or
                        re.match(r"^\s*[-*] ", nxt) or re.match(r"^\s*\d+[.)] ", nxt) or
                        re.fullmatch(r"-{3,}", ns)):
                    break
                buf.append(ns)
                i += 1
            out.append(Paragraph(inline(" ".join(buf)), P))
        return out


def front_matter():
    fl = []
    fl.append(Spacer(1, 120))
    fl.append(Paragraph("ALGOVIZ 2.0", S["CoverS"]))
    fl.append(Spacer(1, 6))
    fl.append(Paragraph("COMPLETE TECHNICAL", S["CoverT"]))
    fl.append(Paragraph("INTERVIEW HANDBOOK", S["CoverT"]))
    fl.append(Spacer(1, 16))
    fl.append(Paragraph(
        "A source-grounded defence manual for the algorithm visualisation platform: "
        "architecture, recorded-frame playback, the reducer, comparison mode, "
        "persistence, the 150 &amp; 768 verification cases, CI, weaknesses and "
        "resume defence.", S["CoverS"]))
    fl.append(Spacer(1, 40))
    fl.append(Paragraph(
        "<b>Every claim in this book is classified:</b><br/>"
        "[VERIFIED] from the repository &nbsp;·&nbsp; [INFERENCE] reasoned from the code<br/>"
        "[GENERAL KNOWLEDGE] required background &nbsp;·&nbsp; [NOT VERIFIED] the source does not establish it<br/>"
        "[PROPOSED] a future idea, not an existing feature", S["CoverMeta"]))
    fl.append(Spacer(1, 60))
    fl.append(Paragraph("Built by reading the repository at commit "
                        "<font name='Mono' size='8'>80f9862</font> — "
                        "61 JavaScript/JSX modules under src/, 14 automated test groups, 69 chapters, 42 handbook parts.", S["CoverMeta"]))
    fl.append(Spacer(1, 8))
    fl.append(Paragraph("Prepared for: Siva Charan K.G.  ·  Project: AlgoViz 2.0 — live URL per README: algoviz-2-0.vercel.app", S["CoverMeta"]))
    fl.append(NextPageTemplate("body"))
    fl.append(PageBreak())
    return fl


def toc_pages():
    fl = []
    fl.append(Spacer(1, 8))
    fl.append(TitleBar("Table of contents", "Chapters, sections and the page where each one starts."))
    fl.append(Spacer(1, 12))
    toc = TableOfContents()
    toc.levelStyles = [S["TOC1"], S["TOC2"]]
    toc.dotsMinLevel = 0
    fl.append(toc)
    fl.append(PageBreak())
    return fl


def main():
    files = sorted(glob.glob(os.path.join(CONTENT_DIR, "*.md")))
    if not files:
        print("no content"); sys.exit(1)
    story = []
    story.extend(front_matter())
    story.extend(toc_pages())
    p = Parser()
    for f in files:
        with open(f, encoding="utf-8") as fh:
            lines = fh.read().split("\n")
        story.extend(p.parse_lines(lines))
        print(f"  + {os.path.basename(f)}  ({len(lines)} lines)")
    doc = Book(OUT)
    doc.multiBuild(story)
    print("PDF pages:", doc.page)
    print("written:", OUT, os.path.getsize(OUT) // 1024, "KB")


if __name__ == "__main__":
    main()
