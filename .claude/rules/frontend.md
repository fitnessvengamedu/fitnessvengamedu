paths:
- "components/**/*.tsx"
- "components/**/*.ts"
- "app/**/*.tsx"
- "app/**/*.ts"
---

# Frontend Architecture and Design Rules

Ensure all frontend code adheres to these styling, performance, structural, and user experience rules:

## 1. Components & Architecture
- **Hooks & Functional Components Only**: Use React functional components (`const ComponentName = () => {}`) with hooks. Never use class components.
- **State Management**: Use Zustand for global shared state. Avoid prop drilling beyond 2 levels.
- **Class Merging**: Always use the `cn(...)` utility (combining `clsx` and `tailwind-merge`) for dynamic and conditional tailwind class lists.
- **Custom Hooks**: Extract stateful logic that is shared or complex into separate custom hooks (`hooks/use-*.ts`).

## 2. Styling & Design Tokens (Dark-First Glassmorphism)
- **Dark Mode First**: The system should be optimized for a premium dark mode layout. Use deep, soft slates and charcoal colors (e.g. `bg-slate-950` or custom HSL H:222 S:47 L:5) rather than pure black.
- **Color Palettes**: Avoid generic colors. Utilize curated, harmonious HSL palettes (e.g., tailwind variable colors `bg-primary`, `text-secondary`).
- **Glassmorphic Card Base**: Use semi-transparent backgrounds with borders and blurs to build premium components:
  - Tailwind template: `bg-white/5 backdrop-blur-md border border-white/10 shadow-xl`
  - Hover states: `hover:bg-white/10 hover:border-white/20 transition-all duration-300`
- **Micro-Animations**: Implement hover transitions (`transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg`) on all cards, buttons, and links.

## 3. SEO & Semantic HTML Best Practices
- **Unique IDs**: Ensure all interactive elements (buttons, inputs, links, forms) have a unique, descriptive `id` attribute to support automated browser testing and accessibility.
- **Heading Structure**: Use exactly one `<h1>` per page. Follow a logical heading hierarchy (`<h2>`, `<h3>`, etc.).
- **HTML5 Semantic Elements**: Use tags like `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<aside>`, and `<article>` instead of plain `<div>`s where applicable.
- **Next.js Metadata**: Configure page title tags, meta descriptions, and OpenGraph/SEO parameters on all main page templates.

## 4. Performance Optimization
- **Image Performance**: Always use `next/image` (`Image` component) with appropriate `width`, `height`, and `alt` tags. Never use raw `<img>` tags.
- **Font Rendering**: Load typography (e.g. Google Fonts like Outfit or Inter) using `next/font` to eliminate layout shifts (CLS).
- **Memoization**: Protect components from expensive re-renders using `React.memo`, `useMemo`, and `useCallback` when handling complex calculations or long list components.

## 5. Visual Inspection & Testing
- **Comet Browser Verification**: Before completing any UI task, run a visual test using the Comet Browser through browser agent tools. Take screenshots or capture videos to check layouts, fonts, responsive states, and alignment.
