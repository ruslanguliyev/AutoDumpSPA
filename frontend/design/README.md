# design/

Design system handoff for the AutoBaz rebuild.

| File | What it is |
|---|---|
| `tokens.css` | Colours, radii, shadows and the font for both themes. Replaces the colour block in `src/app/index.css`. Keeps the existing RGB-triple + `@theme inline` convention. |
| `components.md` | Anatomy and rules for every shared component: buttons, inputs, badges, the five entity cards, reviews block, filters, layout primitives. |
| `pages.md` | Section-by-section structure of all 15 pages, plus the mobile rules. |
| `CLAUDE-CODE-PROMPT.md` | Staged prompts to hand to Claude Code, in order, with the standing rules. |
| `screenshots/` | Artboard screenshots from the design canvas. **Add these yourself** — they do more for the rebuild than any of the text above. |

The source of truth for how things look is the design canvas; this folder is
its written form. If the two disagree, the canvas wins and this folder gets
updated.

## Open decisions

1. **Premium colour** — amber here, purple in the current `premium` token.
   Pick one; the whole system follows the token.
2. **Bootstrap** — the pack assumes it is removed. If something depends on its
   JS, that has to be found before Stage 0.
3. **Forced themes** — `AuthLayout` pins dark, the specialist page pins light.
   Both pins are removed in the rebuild.
