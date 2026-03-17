

# Daniela Alves Healing & Wellness — Implementation Plan

## Overview
A premium, single-page bilingual (PT/EN) wellness website for a holistic therapy practice in Sintra, Portugal. Luxury editorial spa aesthetic with serif+sans typography, glassmorphism, and organic shapes.

## Foundation
- **Fonts**: Google Fonts — Cormorant Garamond (headings) + DM Sans (body)
- **Colors**: Lilac (#985F97), Gold (#D1B073), White/Cream/Mist backgrounds, WhatsApp green (#25D366)
- **Language System**: React Context with PT as default, localStorage persistence, PT/EN toggle in nav
- **Animations**: IntersectionObserver fade-in/slide-up, staggered card reveals, respects `prefers-reduced-motion`

## Sections (Top to Bottom)

### 1. Fixed Navigation
Glassmorphism on scroll, logo left, section links, PT/EN pill toggle, WhatsApp CTA button. Mobile hamburger with full-screen overlay.

### 2. Hero — S.E.R. Concept
60/40 split: pill-shaped video (left) with fallback poster, animated "Serenar / Equilibrar / Relaxar" text (right) with enlarged first letters, quote, and CTA button.

### 3. Trust Strip
Thin bar: 5.0★ Google (23 reviews) · 15+ years · Sintra, Portugal

### 4. "Cuidar de Ti" — 3 Service Cards
Gold icons, serif titles, descriptions, italic quotes, "Saber mais" → modal with full details, duration, price, WhatsApp CTA. Hover lift + shadow.

### 5. "Cuidar do Teu Espaço" — Featured Card
Single wide card for Home Harmony space harmonization service, cream/botanical background.

### 6. Cheque-Oferta (Gift Voucher)
Two-column: gift image left, copy + gold WhatsApp CTA right. Warm cream gradient.

### 7. Sobre Mim (About)
Two-column: bio text left, pill-shaped photo with gold border right.

### 8. Testimonials Carousel
Glassmorphism cards, 7 testimonials with avatars, stars, Google badge. Prev/next + dots. Lilac background.

### 9. FAQ Accordion
5 questions with expand/collapse, light gray background.

### 10. Footer
3-column: brand + tagline, contact info (phone/email/address/maps), social links. Copyright.

## Global Elements
- **Floating WhatsApp button** — fixed bottom-right, green, pulse animation
- **Cookie consent banner** — RGPD compliant, localStorage, accept/reject
- **Service modals** — rich content, WhatsApp CTA, close on overlay/escape
- **SEO** — meta tags, Schema.org HealthAndBeautyBusiness + FAQPage JSON-LD

## Technical Notes
- All content sourced from the GitHub repo (images, video)
- Single-page with smooth scroll navigation
- Fully responsive (mobile-first)
- No backend needed — static site with localStorage for language + cookie preferences

