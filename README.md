# GDA course site (Spring 2027)

Public lecture pages for Geospatial Data Analysis. This folder is its own git
repository, separate from the private course-planning folder around it. Only
student-facing material belongs here: no answer keys, grades, or student work.

## Layout

| Path | What it is |
|---|---|
| `_quarto.yml` | Site settings (navbar, theme, output folder) |
| `index.qmd`, `lectures.qmd` | Home page and the auto-built list of lectures |
| `lectures/NN_topic/index.qmd` | One folder per lecture, with any data it needs |
| `styles.css` | Small style tweaks (larger text for projecting, widget boxes) |
| `docs/` | The rendered site. GitHub Pages serves this folder. Don't edit by hand |
| `_freeze/` | Saved R results, so pages aren't re-run unless their source changes |

## Workflow

1. Edit a `.qmd` in RStudio.
2. Render: **Build > Render Website**, or from this folder run
   `quarto render`. (RStudio's bundled Quarto works.)
3. Commit everything, including `docs/` and `_freeze/`, then push. The site
   updates a minute or two later.

## Lecture format

Each lecture is a scrolling page meant to be presented in class and revisited
later. The pattern is: short concept text → **Predict** prompt → interactive
figure (Observable JS, built into Quarto) → real R code with real output →
"In your code" takeaways → collapsible self-check questions.

- R code follows the course's plain-over-clever standard
  (`course_planning/decisions_and_rationale.md` #5 in the planning folder).
- Interactive figures use `{ojs}` cells with `echo: false`. They run in the
  browser, so the site needs no server.
- Map data for the widgets is a local copy of `countries-110m.json` from the
  `world-atlas` npm package (ISC license; Natural Earth data, public domain).
