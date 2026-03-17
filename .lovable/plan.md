

# Premium Redesign — Daniela Alves Healing & Wellness (2026 Best Practices)

## Research Summary

Based on 2026 wellness web design trends research (SMPLY Studio, BethanyWorks, Elementor, and reference site pur.vamtam.com), the key patterns for premium wellness sites are:

1. **Full-screen immersive hero** with video background (not side-by-side split)
2. **Oversized serif typography** with generous letter-spacing and whitespace
3. **Scroll-driven micro-animations** — parallax, reveal-on-scroll, staggered entrances
4. **Storytelling visual hierarchy** — guide the visitor through a narrative journey
5. **Organic flowing layouts** — asymmetric grids, overlapping elements, curved shapes
6. **Glassmorphism + layered depth** — frosted glass cards, soft shadows, depth layers
7. **Immersive booking experience** — prominent, repeated CTAs
8. **Muted earthy/calming palette** with gradient transitions
9. **Editorial magazine feel** — large images, generous padding, typographic hierarchy
10. **Social proof integrated naturally** — not isolated in a section

---

## What Changes

### 1. Hero — Full-Screen Cinematic

**Current**: Split 60/40 layout with video left, text right.
**New**: Full-viewport hero with video background (darkened overlay). S.E.R. text centered over video in oversized serif (6-8rem). Subtle scroll-down indicator with animated chevron. Text fades in with staggered letter animation. The quote sits below the S.E.R. words in a delicate line.

### 2. Navigation — Refined Luxury

**Current**: Standard glassmorphism nav.
**New**: Initially fully transparent with white text over hero video. On scroll, transitions to frosted glass with a thinner profile. Logo uses a refined layout. Add a subtle gold underline hover effect on links.

### 3. Trust Strip — Integrated Elegance

**Current**: Basic bar with text items.
**New**: Floating glass card overlapping the hero bottom edge (negative margin). Slightly elevated with shadow. Gold separator dots instead of lines. Smaller, more refined typography.

### 4. Services — Editorial Card Grid

**Current**: Standard 3-column cards.
**New**: Asymmetric editorial layout. Each card gets a decorative gold line accent at the top. Hover reveals a subtle gradient overlay. Icons get a refined line-art style. Cards use more padding (p-10-12) with extra breathing room. Add a subtle parallax offset between cards on scroll. The modal gets a full redesign: larger, with a left accent bar in gold.

### 5. Space Harmony — Immersive Banner

**Current**: Simple card.
**New**: Full-width section with a soft botanical background pattern (CSS-generated). The card becomes an asymmetric layout with decorative elements — a gold ornamental divider and oversized serif pull-quote.

### 6. Gift Voucher — Magazine Spread

**Current**: Two-column basic layout.
**New**: Overlapping image that breaks out of its column slightly. Gold gradient border on the image. Text side gets a large decorative quotation mark as background element. More dramatic typography hierarchy.

### 7. About — Storytelling Layout

**Current**: Basic two-column.
**New**: Image with an artistic frame — double border effect (inner gold, outer transparent gap). Text uses drop cap on first paragraph. Add a subtle decorative botanical SVG element. Staggered paragraph reveal on scroll.

### 8. Testimonials — Immersive Carousel

**Current**: Basic card carousel.
**New**: Full-width section with a soft gradient background. Larger testimonial card with oversized quotation marks as decorative elements. Auto-play with smooth crossfade transition. Avatar gets a gold ring border. Add a world map dotted illustration showing client locations.

### 9. FAQ — Refined Accordion

**Current**: Basic accordion.
**New**: Each item gets a subtle left border that transitions to gold on open. More padding, refined plus/minus icon animation. Section gets decorative serif header with an ornamental divider.

### 10. Footer — Editorial Magazine Style

**Current**: Standard 3-column.
**New**: Dark gradient background (not solid). Add a decorative gold line separator at top. Logo area gets more prominence. Add a small embedded Google Maps iframe or link. More refined spacing.

---

## New Technical Elements

### Scroll Animations Upgrade
- Add CSS `@keyframes` for: text reveal (clip-path), parallax offset, counter-scroll elements
- Implement a `useParallax` hook for depth effects on scroll
- Add staggered children animation with configurable delays

### Decorative SVG Elements
- Create reusable botanical line-art SVG components (leaf, branch, flower)
- Gold ornamental dividers between sections
- Large decorative quotation marks for testimonials

### Typography Upgrade
- Hero text: 6-8rem with `font-weight: 200`
- Section titles: add a subtle animated gold underline
- Add `text-balance` for headings, `text-pretty` for body paragraphs

### CSS Enhancements
- Smooth gradient transitions between sections (no hard color breaks)
- Subtle noise texture overlay on hero for film-grain effect
- Gold shimmer animation for CTAs on hover

---

## Implementation Order

1. Update CSS variables, add new keyframes and utility classes
2. Redesign Hero (full-screen video background, centered text)
3. Refine Navigation (transparent initial state, gold hover effects)
4. Redesign Trust Strip (floating glass card overlapping hero)
5. Upgrade Services section (editorial cards, enhanced modals)
6. Upgrade SpaceHarmony, GiftVoucher, About sections
7. Redesign Testimonials (immersive carousel with decorative elements)
8. Refine FAQ and Footer
9. Add decorative botanical SVG elements throughout
10. Polish scroll animations and micro-interactions

All content, links, and functionality remain identical. This is purely a visual/UX elevation.

