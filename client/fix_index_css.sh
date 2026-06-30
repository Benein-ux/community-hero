#!/bin/bash
# We'll rewrite client/src/index.css with a flat @theme block

# Backup original
cp '/home/ishar/Documents/CommunityHero/client/src/index.css' '/tmp/index.css.backup'

# Build new flat @theme block
cat > '/home/ishar/Documents/CommunityHero/client/src/index.css' << 'EOF'
@import "tailwindcss";

@theme {
  /* Font families */
  --font-sans: "Inter", system-ui, Avenir, Helvetica, Arial, sans-serif;
  --font-display: "Sora", sans-serif;
  --font-mono: "Space Mono", monospace;

  /* Letter spacing */
  --letter-spacing-tighter: -0.02em;
  --letter-spacing-widest: 0.1em;

  /* Shadow utilities */
  --shadow-card: 0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2);
  --shadow-card-hover: 0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(94,106,210,0.1);
  --shadow-button-glow: 0 0 0 1px rgba(94,106,210,0.5), 0 4px 12px rgba(94,106,210,0.3), inset 0 1px 0 0 rgba(255,255,255,0.2);

  /* Color tokens */
  --bg-deep: var(--bg-deep);
  --bg-base: var(--bg-base);
  --bg-elevated: var(--bg-elevated);
  --surface: var(--surface);
  --surface-hover: var(--surface-hover);
  --fg: var(--fg);
  --fg-muted: var(--fg-muted);
  --fg-subtle: var(--fg-subtle);
  --accent: var(--accent);
  --accent-bright: var(--accent-bright);
  --accent-glow: var(--accent-glow);
  --border-default: var(--border-default);
  --border-hover: var(--border-hover);
  --border-accent: var(--border-accent);
  --red-500: #EF4444;
  --emerald-400: #34D399;
}

@layer base {
  :root {
    --bg-deep: #020203;
    --bg-base: #050506;
    --bg-elevated: #0a0a0c;
    --surface: rgba(255, 255, 255, 0.05);
    --surface-hover: rgba(255, 255, 255, 0.08);
    --fg: #EDEDEF;
    --fg-muted: #8A8F98;
    --fg-subtle: rgba(255, 255, 255, 0.60);
    --accent: #5E6AD2;
    --accent-bright: #6872D9;
    --accent-glow: rgba(94, 106, 210, 0.3);
    --border-default: rgba(255, 255, 255, 0.06);
    --border-hover: rgba(255, 255, 255, 0.10);
    --border-accent: rgba(94, 106, 210, 0.30);

    /* Shadow tokens */
    --shadow-card: 0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2);
    --shadow-card-hover: 0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(94,106,210,0.1);
    --shadow-button-glow: 0 0 0 1px rgba(94,106,210,0.5), 0 4px 12px rgba(94,106,210,0.3), inset 0 1px 0 0 rgba(255,255,255,0.2);

    /* Specific issue/status colors (fixed hex for consistency) */
    --color-critical: #EF4444;
    --color-success: #34D399;
  }

  [data-theme="light"] {
    --bg-deep: #F7F7F8;
    --bg-base: #FFFFFF;
    --bg-elevated: #F0F0F0;
    --surface: rgba(0, 0, 0, 0.03);
    --surface-hover: rgba(0, 0, 0, 0.06);
    --fg: #1A1A1F;
    --fg-muted: #5A6275;
    --fg-subtle: rgba(0, 0, 0, 0.60);
    --accent: #5E6AD2;
    --accent-bright: #6872D9;
    --accent-glow: rgba(94, 106, 210, 0.1);
    --border-default: rgba(0, 0, 0, 0.06);
    --border-hover: rgba(0, 0, 0, 0.10);
    --border-accent: rgba(94, 106, 210, 0.15);

    /* Shadow tokens (light mode) */
    --shadow-card: 0 0 0 1px rgba(0,0,0,0.06), 0 2px 20px rgba(0,0,0,0.1), 0 0 40px rgba(0,0,0,0.05);
    --shadow-card-hover: 0 0 0 1px rgba(0,0,0,0.1), 0 8px 40px rgba(0,0,0,0.15), 0 0 80px rgba(94,106,210,0.05);
    --shadow-button-glow: 0 0 0 1px rgba(94, 106, 210, 0.3), 0 4px 12px rgba(94, 106, 210, 0.2), inset 0 1px 0 0 rgba(255,255,255,0.5);

    /* Specific issue/status colors (fixed hex for consistency) */
    --color-critical: #E2554A;
    --color-success: #2D9684;
  }

  html {
    background-color: var(--bg-deep);
  }

  body {
    background-color: transparent;
    color: var(--fg);
    font-family: "Inter", system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  .card {
    @apply rounded-2xl border border-[var(--border-default)] bg-[var(--surface)];
    box-shadow: var(--shadow-card);
  }
  .card-hover {
    @apply border-[var(--border-hover)] bg-[var(--surface-hover)];
    box-shadow: var(--shadow-card-hover);
  }
}

#root {
  font-size: 16px;
}

EOF

echo "Rewritten index.css with flat @theme block"