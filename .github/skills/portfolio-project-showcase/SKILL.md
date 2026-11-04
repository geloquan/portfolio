---
name: portfolio-project-showcase
description: Design the projects / work / case-study section of a personal portfolio website so it looks distinctive instead of like a template. Use this skill whenever the user wants to build, redesign, or improve how projects are displayed on a portfolio, including project grids, selected work lists, case study pages, project cards, or "my work" sections, even if they only say "make my portfolio stand out", "my projects section looks generic", or "design a unique portfolio". Covers choosing a layout archetype, deriving a visual signature from the projects themselves, hover and scroll behavior, case study structure, and an anti-template checklist. Not for hero sections, about pages, contact forms, or non-portfolio sites.
---

# Portfolio Project Showcase

The projects section is where a portfolio is judged. Visitors (recruiters, clients, professors) skim for about ten seconds, so this section has to do two jobs at once: look like nobody else's, and make the work easy to understand fast.

Most portfolios fail the first job in the same way: a three-column grid of identical rounded cards, a gradient heading, a dark theme with one purple or blue accent, and "View Project" buttons. The skill below exists to avoid that outcome by deriving the design from the person's actual work instead of from a default.

## Step 1: Gather the raw material (ask only what you can't infer)

Before designing anything, establish:

1. **The projects**: name, one-line outcome, role, stack, year, and what visual proof exists (screenshots, UI recordings, diagrams, none).
2. **The audience**: hiring managers, clients, academic panel, or peers. This decides how much case-study depth is needed.
3. **The person's tone**: precise and technical, playful, editorial, quiet and minimal.
4. **Constraints**: framework, hosting, performance budget, whether it must work well on mobile.

If screenshots don't exist, say so and design for typography and structure instead of imagery (see "No-screenshot fallback" below). Never invent placeholder project data that looks real.

## Step 2: Find the signature

A signature is one idea that every part of the section obeys. It comes from the work, not from a mood board. Pick one:

| Source | Signature idea | Example |
|---|---|---|
| The domain of the projects | Borrow the visual language of that domain | Healthcare and pharmacy work becomes a prescription label or patient chart layout; point-of-sale work becomes a receipt strip; mobile apps become a device-frame index |
| The medium | Present work the way it is made | Code-heavy work as a file tree or terminal index; design-heavy work as a contact sheet |
| A constraint | One strict rule creates character | Everything on a visible 8-column grid; a single typeface at one weight; two colors only |
| Place or culture | Local references the visitor won't see elsewhere | Signage, jeepney-style lettering, market stall labels, regional palettes |
| Structure of information | Make the data the decoration | Projects as a table with sortable columns (year, stack, role, impact) |

Write the signature as one sentence before coding. Example: "Projects are listed like lines on a pharmacy receipt: monospaced, dotted leaders, totals as outcomes." If the sentence cannot be said in one line, it isn't a signature yet.

## Step 3: Choose a layout archetype

Choose the archetype that fits the number of projects and the signature. Do not default to the card grid.

- **Index list**: large typographic rows (title, year, role, stack) with a preview that follows the cursor or pins to one side on hover. Best for 4 to 10 projects and strong typography. Degrades well on mobile as a stacked list.
- **Editorial spreads**: each project gets a full-width band with alternating asymmetry, oversized numerals, and a pulled outcome statistic. Best for 3 to 5 flagship projects with good visuals.
- **Horizontal reel**: a scroll-snapped track where each project is a tall panel. Best for visually rich work. Needs keyboard and touch support and a visible progress cue.
- **Annotated canvas**: projects placed on a loose board at slight offsets, like a pinboard or workbench, with connecting notes. Best for personality-driven or creative portfolios. Keep a clean linear fallback for mobile and screen readers.
- **Data table**: a dense, sortable, filterable table with expandable rows. Best for developers with many projects across stacks and for academic or capstone lists.
- **Index plus detail split**: a persistent list on one side, a live detail panel on the other that swaps as the visitor selects or scrolls. Best for desktop-first, content-heavy work.

Mixing is fine: for example, editorial spreads for three flagship projects, then a compact index list for everything else. Showing hierarchy (featured versus archive) is itself a sign of editorial judgment.

## Step 4: Build the visual system from the signature

Define these tokens before writing components, and keep the set small.

**Typography**
- Pick one distinctive display face and one workhorse text face. Avoid defaulting to Inter, Roboto, or system fonts for display text. A mono face is a good third voice for metadata (year, stack, role).
- Let scale do the work: very large titles against small metadata creates contrast that card borders never will.

**Color**
- One dominant ground, one ink color, one accent used sparingly. Derive the accent from a real project's UI or from the signature's source, not from a generic palette.
- Consider letting each project carry its own accent color that tints its row, panel, or page. This ties the visual to the work and adds variety without chaos.

**Space and shape**
- Choose one shape language and commit: hard rectangles, pill shapes, or ruled lines. Mixing rounded cards, pills, and sharp tables reads as a template.
- Prefer rules, offsets, and alignment over drop shadows and glassmorphism.

**Imagery**
- Crop screenshots with intent: a single detail, a device frame at an angle, or a UI slice, instead of a full-page shot shrunk into a thumbnail.
- Use consistent treatment across projects (same frame, same shadow logic, same crop ratio) so mixed-quality screenshots still feel curated.

## Step 5: Interaction that explains the work

Motion should help a visitor understand something, not decorate.

- **Hover or focus reveals** should show new information: the stack, the outcome metric, a short loop of the UI. Not just a color change.
- **Scroll behavior** should reveal structure (a project number ticking, a pinned title while details scroll), and must respect `prefers-reduced-motion`.
- **Transitions between list and case study** should preserve context, for example the title morphing into the case study heading. In React, use the View Transitions API or a shared-layout animation library where available.
- Every interaction needs a keyboard path and a focus style that fits the visual system. Hover-only content is invisible on touch devices, so give it a tap equivalent.

## Step 6: Structure each project entry (and case study)

Every project, in any archetype, answers these in this order within the first screen:

1. **What it is**, in one plain sentence.
2. **Outcome or proof**: a number, a shipped status, a user count, a grade, a deployed link. If there is no metric, state the problem solved instead of inventing one.
3. **Role and stack**: what the person actually did and what it was built with.
4. **Visual evidence**.

For a full case-study page, add only what the audience needs:

- **Context and constraint** (the real-world limit, such as Philippine-market connectivity, regulatory needs, or a capstone deadline)
- **Key decision** (one or two design or engineering choices and why, with the rejected alternative)
- **Result and what was learned**
- **Links** (live, repo, paper), with the primary one visually dominant

Cut the generic "problem, solution, results" boilerplate if the content doesn't fill it. A short, specific case study beats a long, padded one. See `references/case-study-patterns.md` for page-level layouts.

## No-screenshot fallback

If projects lack imagery (private repos, in-progress work, capstones without a UI):

- Make typography and structure the hero. The index list and data table archetypes work especially well.
- Use generated-from-data visuals: a commit or activity strip, a stack composition bar, an architecture diagram drawn as clean SVG.
- Mark confidentiality honestly (for example "client work, screenshots withheld") instead of using stock imagery.

## Anti-template checklist

Before delivering, check the design against this list. Each "yes" is a reason to rework that part.

- Could this section be dropped into another person's portfolio by swapping text and still look right?
- Is it a uniform grid of equal cards with the same radius, shadow, and "View Project" button?
- Is there a purple-to-blue gradient, a glow, or a glassmorphism panel with no connection to the work?
- Does every project get the same visual weight even though some are clearly stronger?
- Does hover only change color or lift the card?
- Is a display font doing the job of a system font, or a trendy font used without reason?
- Is any text, metric, or testimonial invented? (Replace with real data or clearly marked placeholders.)

Then check the basics: readable contrast, working keyboard navigation, reduced-motion support, responsive layout down to about 360px, images with dimensions and alt text, and no layout shift as images load.

## Output expectations

When asked to build this section, deliver:

1. The one-sentence signature and the chosen archetype, with a brief reason.
2. The design tokens (fonts, colors, spacing, shape).
3. Working code in the user's stack (default to React with TypeScript and CSS variables, or plain HTML/CSS/JS if no framework is stated), with project data separated into a typed array or JSON file so adding a project is a one-object change.
4. A short note on what to replace with real content (screenshots, metrics, links).

Keep the code self-contained and avoid heavy dependencies unless the archetype truly needs one (for example, a motion library for shared-element transitions).
