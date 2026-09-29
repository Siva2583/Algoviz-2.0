# Handbook source

This folder holds the **source** of the interview handbook:

- `../ALGOVIZ_2_0_COMPLETE_TECHNICAL_INTERVIEW_HANDBOOK.pdf` — the built 339-page PDF (repo root)
- `build.py` — the renderer (markdown subset → PDF, via ReportLab)
- `content/*.md` — 30 chapter files, read in sorted filename order

## Regenerating the PDF

```bash
python3 -m venv /tmp/hbvenv
/tmp/hbvenv/bin/pip install reportlab pypdf pymupdf
cd docs/handbook && /tmp/hbvenv/bin/python build.py
```

`build.py` writes to `<repo root>/ALGOVIZ_2_0_COMPLETE_TECHNICAL_INTERVIEW_HANDBOOK.pdf` and prints the page count and file size.

## Editing content

Each `content/cNN_*.md` file uses a small markdown subset:

| Syntax | Renders as |
| --- | --- |
| `# NN · Title` + optional `> subtitle` | Chapter heading with a `CHAPTER NN` eyebrow and a navy title bar |
| `%PART: Title \| PART X \| blurb` | Full-page part divider |
| `## NN.N Title` / `###` / `####` | Section headings (levels 2 and 3 are indexed in the TOC) |
| `` ``` fence ``` `` | Monospace block, auto-split across pages |
| `@@code src/path 12 34` | Injects that line range from the repository as a code block |
| `\| a \| b \|` | Table (escape a literal pipe inside a cell as `\|`) |
| `:::kind [title] … :::` | Coloured callout box (see below) |
| `- [ ] item` | Checklist item |
| `> quote` | Pull-quote styling |

### Box kinds for `:::`

`q` interview question · `danger` danger zone · `must` must know · `trap` trap ·
`answer` model answer · `note` note · `key` key takeaway · `proposed` proposed (not implemented) ·
`verified` source evidence · `notverified` not verified · `inference` inference ·
`weak` weakness/limitation · `script` say this out loud · `debug` debugging ·
`check` checklist · `mock` mock interview · `resume` resume claim · `day` study plan · `code` code note

Two build constraints worth knowing before editing:

1. **Boxes must be balanced.** Every `:::kind` needs a matching `:::` before the next `# NN ·` chapter heading, or the whole build fails with an `AttributeError` from the page template.
2. **Never put a `%PART:` or a `# NN ·` heading inside an open box.**

## Claim labels used throughout

`[VERIFIED]` source-supported · `[INFERENCE]` reasoned from the code ·
`[GENERAL KNOWLEDGE]` background · `[NOT VERIFIED]` source does not establish it ·
`[PROPOSED]` future idea, not an implemented feature

The handbook was written against commit `80f9862`. If the code changes, the measured
numbers (frame counts, 150/768 case counts, bundle sizes, duplicate-ID frame counts)
must be re-measured rather than carried over.
