# Portfolio page outline

## Narrative

**Context:** Introduce Marco as an AI/ML and full-stack engineer working in Bacolod, with an emphasis on AI systems that support real business operations.

**Question:** What does that work look like when it has to run locally, fit existing healthcare and legal workflows, and remain useful to people doing the work?

**Evidence:** Lead with the offline legal-document system and its CV-reported operational outcomes, then show selected projects and the work history behind those capabilities.

**Resolution:** Connect the engineering practice to computer-vision research, education, and recognition, then offer clear ways to review the CV or start a conversation.

## Reading order

### Shared chrome and interaction support
The page includes persistent top navigation, a compact island treatment after scrolling, mobile menu toggle, theme switch, feedback toggle, and notification toasts. They support navigation/preferences across the outlined sections, not additional narrative sections. The inquiry dialog belongs to Contact; thesis PDF preview to Research & learning; project media controls to Selected work. Scroll reveals belong to Motion below. References: `portfolio-contact-flow` (dialog/toasts), `tactile-theme-modes` (theme), `organic-tactile-ui` (feedback), `portfolio-project-showcase` (media), `antislop-layoutmobile` (responsive navigation).

1. **Opening / profile** (`#about`): name, role, location, concise positioning, source-backed evidence, CV link, contact action. Focal point: the work and its real-world operating constraint, not decorative portrait art.
2. **Selected work** (`#projects`): editorial index plus detail for four projects, led by the offline AI legal workflow. Each entry states what it does, the evidence or limitation, role/stack, and whether visual proof is available. Medical Arts remains explicitly unverified rather than presented as fact.
3. **Experience** (`#experience`): chronological evidence from AI systems, healthcare IT, and freelance product engineering. The strongest operational case leads; earlier roles establish the breadth behind it.
4. **Research & learning** (`#contributions`): seashell computer-vision research, thesis distinction, education, and community recognition. Publication status and distribution are qualified where verification is pending.
5. **Contact** (`#contact`): truthful contact options and a modal-based inquiry flow. The UI clearly says the form is not connected to a delivery endpoint; direct email remains available. Includes shared notification toasts and the footer with social/email links and current CV link. References: `portfolio-contact-flow`, `antislop-copywriting`.

## Signature and composition

**Project signature:** Projects read like an engineering field index: numbered entries, concise evidence, role and stack, and honest media availability, with the operational AI workflow given the most space.

**Archetype:** Editorial index with a featured detail spread. This gives the strongest project hierarchy while keeping four mixed-evidence projects scannable and responsive without inventing screenshots or metrics.

**Visual direction:** Existing organic tactile slate/forest and parchment themes, with brass used only for selected emphasis and primary action. Georgia is the display serif already defined by the shared theme tokens; the system sans remains for readable body and interface text. Ruled, open sections vary their composition to suit content instead of repeating a card grid.

**Motion:** Restrained ScrollTrigger reveals to guide attention through the long-form narrative. Content remains visible without animation; triggers are scoped and cleaned up, and reduced-motion users receive the static layout.
