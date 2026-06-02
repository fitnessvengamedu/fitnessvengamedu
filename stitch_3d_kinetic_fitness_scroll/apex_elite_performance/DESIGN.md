---
name: Apex Elite Performance
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c6c9ac'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#909378'
  outline-variant: '#454932'
  surface-tint: '#b8d300'
  primary: '#ffffff'
  on-primary: '#2c3400'
  primary-container: '#d2f100'
  on-primary-container: '#5c6b00'
  inverse-primary: '#576500'
  secondary: '#ffb3b2'
  on-secondary: '#680012'
  secondary-container: '#ff525c'
  on-secondary-container: '#5b000f'
  tertiary: '#ffffff'
  on-tertiary: '#1b343b'
  tertiary-container: '#cce7f1'
  on-tertiary-container: '#4f6871'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d2f100'
  primary-fixed-dim: '#b8d300'
  on-primary-fixed: '#191e00'
  on-primary-fixed-variant: '#414c00'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b2'
  on-secondary-fixed: '#410008'
  on-secondary-fixed-variant: '#92001e'
  tertiary-fixed: '#cce7f1'
  tertiary-fixed-dim: '#b0cbd4'
  on-tertiary-fixed: '#031f26'
  on-tertiary-fixed-variant: '#324a52'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  electric-lime: '#DFFF11'
  apex-crimson: '#FF003C'
  deep-obsidian: '#050505'
  graphite-surface: '#1A1A1A'
  glass-stroke: rgba(255, 255, 255, 0.12)
typography:
  display-xl:
    fontFamily: sora
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  body-md:
    fontFamily: geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  telemetry-label:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter-sm: 16px
  gutter-md: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  max-width: 1440px
---

## Brand & Style

The design system embodies the "Apex Elite" philosophy: a high-octane, premium environment for athletes who demand technical precision and peak performance. The visual identity is aggressive, cinematic, and engineering-focused.

The style is a hybrid of **High-Contrast Digitalism** and **Glassmorphism**. It utilizes a deep, multi-layered dark mode as the canvas, allowing vibrant, neon-tinted accents to cut through the interface like performance-tracking lasers. 

### Key Visual Pillars
- **Technical Precision:** Use of grid-based layouts, micro-copy inspired by telemetry, and sharp, geometric lines.
- **Elite Performance:** High-contrast visuals that favor "speed" through motion and "strength" through bold typography.
- **Immersive Depth:** Extensive use of translucency (glassmorphism) and Z-axis layering to create a sense of advanced technology.
- **Agility:** Smooth, non-linear transitions and 3D element integration (WebGL) to provide a fluid, premium experience.

## Colors

The palette is anchored in a multi-tone dark spectrum to create depth and focus. **Electric Lime** is the primary driver for "go" actions, progress tracking, and performance highlights. **Apex Crimson** serves as a secondary accent for high-energy alerts, power-states, and intense workout metrics.

### Implementation Notes
- **Surface Strategy:** Use `deep-obsidian` for the base background. Use `graphite-surface` for cards and floating containers.
- **Accents:** Use gradients sparingly, primarily transitioning from `electric-lime` to a slightly more transparent version of itself to simulate light glow.
- **Contrast:** Maintain a minimum 4.5:1 contrast ratio for all functional labels, though decorative telemetry text may use lower opacity for stylistic depth.

## Typography

The typographic system balances futuristic geometry with technical utility. 

- **Sora (Headlines):** Used for high-impact branding and section titles. Its wide, geometric stance evokes modern athletic apparel and tech.
- **Geist (Body):** A highly legible, professional sans-serif that maintains the "developer-grade" precision requested for the Apex feel.
- **JetBrains Mono (Labels/Data):** Reserved for technical data, BMI results, telemetry, and time-stamps. It reinforces the "Elite Performance" tracking aesthetic.

**Formatting:** Headlines should predominantly use "Sentence case" but specific high-level labels (like CTA buttons or telemetry) must use "UPPERCASE" with increased letter spacing.

## Layout & Spacing

This design system uses a **Fluid-Fixed Hybrid Grid**. Content is contained within a 1440px max-width wrapper, centered on the screen, but utilizes fluid percentages for internal column widths.

### Grid Model
- **Desktop:** 12-column grid with 24px gutters. Large 80px side margins to provide "breathing room" that highlights 3D assets.
- **Mobile:** 4-column grid with 16px gutters and 20px side margins.

### Spacing Rhythm
The system follows a 4px baseline. Components should utilize spacing increments of 8px, 16px, 24px, 32px, 48px, and 64px to maintain a rhythmic, structured feel. High-performance "Elite" sections should prioritize generous vertical whitespace (padding-top/bottom) to allow WebGL visuals to bleed into the content areas.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism**, rather than traditional shadows.

1.  **Level 0 (Base):** `#050505` (Deep Obsidian).
2.  **Level 1 (Card/Container):** `#1A1A1A` with a 1px `glass-stroke` border.
3.  **Level 2 (Glass Overlays):** Semi-transparent surfaces using `backdrop-filter: blur(20px)` and 40% opacity of the surface color. This is used for navigation bars and dashboard widgets.

### Visual Depth
- **Borders:** Instead of heavy shadows, use thin, 1px high-contrast borders (using the primary or secondary color at 20% opacity) to define component edges.
- **Shadows:** If used, they must be "Glows" rather than "Shadows." A soft `0px 0px 20px` drop-shadow using the `electric-lime` color at 15% opacity can be applied to active state elements.

## Shapes

The shape language is **Soft-Technical**. While the brand is aggressive, hard 90-degree corners feel dated. We use a subtle 4px (`0.25rem`) radius for standard components to maintain a precision-machined look.

- **Primary Buttons:** Subtle rounding (4px) to look like industrial hardware.
- **Input Fields:** Sharp but with 4px corner radius.
- **Dashboard Widgets:** 8px (`rounded-lg`) to differentiate structural UI from interactive elements.
- **3D Elements:** Should be framed in containers with no overflow-hide to allow parts of the 3D model to "break the plane" of the container.

## Components

### Buttons
- **Primary:** Background `electric-lime`, text `deep-obsidian`, 0.25rem radius. Bold `telemetry-label` typography. On hover, apply a subtle glow effect.
- **Secondary:** Transparent background, 1px border of `electric-lime`, text `electric-lime`. 
- **Ghost:** No background, `glass-stroke` border, text `white`.

### Input Fields
- Dark background (`#111`), 1px border (`glass-stroke`). On focus, border changes to `electric-lime` with a subtle outer glow. Text should be `geist`.

### Cards
- Background is `graphite-surface` at 80% opacity with `backdrop-filter: blur(12px)`.
- Include a 1px border at the top and left edges to simulate a light source hitting a physical edge.

### Chips/Badges
- Small, uppercase `jetbrainsMono`. For "Active" status, use `electric-lime` text with a 10% opacity background of the same color. For "Intense" or "Alert", use `apex-crimson`.

### Dashboard Progress
- Progress bars should be sleek, 4px height, using `electric-lime` on a dark-grey track. Transitions should be ease-in-out with a 400ms duration to feel "mechanical."

### Digital Membership Card
- High-gloss glassmorphism. Use a subtle gradient mesh background (Crimson to Obsidian) with a high blur (60px) and a sharp QR code container.