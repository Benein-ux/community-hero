# Design System — Community Hero ("Linear / Modern")

## Philosophy
Precision, depth, and fluidity. Premium developer-tool aesthetic — fast,
responsive, obsessively crafted, like Linear, Vercel, or Raycast. Deep
near-blacks punctuated by soft pools of indigo ambient light. Sophisticated,
never cold. Cinematic meets technical minimalism.

## Color Tokens
- background-deep: #020203
- background-base: #050506
- background-elevated: #0a0a0c
- surface: rgba(255,255,255,0.05)
- surface-hover: rgba(255,255,255,0.08)
- foreground: #EDEDEF
- foreground-muted: #8A8F98
- foreground-subtle: rgba(255,255,255,0.60)
- accent: #5E6AD2
- accent-bright: #6872D9
- accent-glow: rgba(94,106,210,0.3)
- border-default: rgba(255,255,255,0.06)
- border-hover: rgba(255,255,255,0.10)
- border-accent: rgba(94,106,210,0.30)

For Community Hero specifically, map issue severity/category colors as
accent-tinted variants rather than introducing unrelated hues:
- Critical/High severity: red-500 (#EF4444) at reduced saturation, used sparingly
- Verified/Success: emerald-400 (#34D399), used sparingly
- Everything else stays monochromatic with the indigo accent for interactivity

## Background System (apply to all full-page views: Home, Dashboard, Leaderboard, Report, Login)
Layer 1 — radial gradient: `radial-gradient(ellipse at top, #0a0a0f 0%, #050506 50%, #020203 100%)`
Layer 2 — subtle noise texture overlay at opacity 0.015
Layer 3 — 2-3 large blurred gradient blobs (900px+, blur 120-150px) in accent indigo at 12-25% opacity, slowly floating via keyframe animation (8-10s ease-in-out infinite, translateY ±20px + rotate ±1deg)
Layer 4 — 64px grid pattern overlay at opacity 0.02

## Typography
- Font: Inter (already loaded), system-ui fallback
- Display/H1: text-5xl to text-6xl, font-semibold, tracking-tight
- H2: text-3xl to text-4xl, font-semibold, tracking-tight
- H3 (card titles): text-xl to text-2xl, font-semibold, tracking-tight
- Body: text-sm to text-base, font-normal
- Labels/metadata: text-xs, font-mono, tracking-widest
- Headlines use gradient text: `bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent`

## Radius and Borders
- Cards/containers: rounded-2xl (16px), border border-white/[0.06]
- Buttons: rounded-lg (8px)
- Inputs: rounded-lg (8px), border border-white/10
- Badges/pills: rounded-full, border border-accent/30
- Icon containers: rounded-xl (12px), border border-white/10

## Shadows
Card default: `shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]`
Card hover: `shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]`
Primary button glow: `shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]`

## Components
- Primary button: solid #5E6AD2, white text, glow shadow, hover brightens to #6872D9, active scale-[0.98]
- Secondary button: bg-white/[0.05], hover bg-white/[0.08]
- Cards: bg-gradient-to-b from-white/[0.08] to-white/[0.02], border-white/[0.06], rounded-2xl, optional mouse-tracking spotlight on hover
- Inputs: bg-[#0F0F12], border-white/10, focus border-accent with glow ring

## Motion
- Hover transforms: max 4-8px translateY, 200-300ms, expo-out easing [0.16,1,0.3,1]
- Active: scale-[0.98]
- Entrance: fade up (opacity 0→1, y 24px→0), staggered children 0.08s delay
- Background blobs: continuous float animation, 8-10s

## Anti-patterns to avoid
No flat single-color backgrounds. No pure black/white. No bouncy spring animations. No hover movement beyond 8px. No harsh borders (keep at 6-10% white opacity). No accent color overuse — monochromatic base with indigo only for interaction/emphasis.

## Light Mode
This design system is dark-first by nature (it's the entire point of the
aesthetic — ambient light pools only read against near-black). Light mode
should use a much lighter version: background #F7F7F8, surface white with
subtle gray-50 gradient, foreground #1A1A1F, same accent #5E6AD2 (still
works on light backgrounds), reduced/removed blob opacity (blobs barely
visible at 4-6% on light bg), borders rgba(0,0,0,0.06) instead of white.

## Responsiveness
Mobile (<768px): single column, reduced padding, bottom tab nav
Tablet (768-1024px): icon rail nav, 2-column grids
Desktop (1024px+): full sidebar nav, asymmetric grids where relevant
Section/card padding scales with viewport using Tailwind responsive classes