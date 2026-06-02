# Frontend Design Skill

A skill for creating and auditing premium-grade, state-of-the-art user interfaces. This skill ensures that all user interfaces built look stunning, feel responsive, and follow the design guidelines.

## Core Design Principles

1. **Rich Aesthetics & Color Palettes**:
   - Never use plain browser default colors or basic primaries (e.g., pure red, blue, green).
   - Use curated, cohesive color palettes. HSL is preferred to easily scale shades and opacities (e.g., dark slate background with neon emerald, violet, or electric indigo accents).
   - Implement dark mode by default unless specified otherwise. Keep background shades soft and deep (not pure black `#000000` but deep slates like `#0b0f19` or HSL darks).

2. **Glassmorphism**:
   - Use frosted glass panels for cards and containers.
   - Mix background opacity, blur, and border colors:
     ```css
     background: rgba(255, 255, 255, 0.03);
     backdrop-filter: blur(12px);
     border: 1px solid rgba(255, 255, 255, 0.08);
     ```

3. **Typography**:
   - Use high-quality Google Fonts (e.g., Inter, Outfit, Roboto, Cabinet Grotesk).
   - Enforce distinct font-weight hierarchies and line-heights to keep layout readable.

4. **Smooth Gradients & Lighting**:
   - Utilize linear and radial gradients for buttons, hover highlights, and card accents.
   - Use glowing shadows or border gradients to make components look premium.

5. **Micro-Animations & Transitions**:
   - Every interactive element (buttons, cards, links, tabs) must have transition effects (e.g., `transition-all duration-300 ease-in-out`).
   - Use subtle hover translations (e.g., `hover:-translate-y-0.5 hover:shadow-lg`).

6. **Visual Testing (Comet Browser)**:
   - For all frontend reviews, visual tests, or layout validations, **always launch the Comet Browser** using browser tools.
   - Capture screenshots and record videos to review and polish the user interface.

## Component Implementation Checklist

- [ ] Does it use functional components with hooks?
- [ ] Are styles managed through Tailwind CSS and/or standard HSL variables?
- [ ] Is there proper support for responsive layouts (mobile, tablet, desktop)?
- [ ] Are animations smooth and subtle (avoiding jarring transitions)?
- [ ] Is Zustand used for shared global states rather than prop drilling?
- [ ] Are standard primitives from `shadcn/ui` used instead of building basic components from scratch?
- [ ] Are Next.js `next/image` components used for all image elements?
