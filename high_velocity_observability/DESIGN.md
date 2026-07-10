---
name: High-Velocity Observability
colors:
  surface: '#10131b'
  surface-dim: '#10131b'
  surface-bright: '#363942'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#181b23'
  surface-container: '#1c1f27'
  surface-container-high: '#272a32'
  surface-container-highest: '#32353d'
  on-surface: '#e0e2ed'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#e0e2ed'
  inverse-on-surface: '#2d3039'
  outline: '#8b90a0'
  outline-variant: '#414754'
  surface-tint: '#aec6ff'
  primary: '#aec6ff'
  on-primary: '#002e6b'
  primary-container: '#0070f3'
  on-primary-container: '#ffffff'
  inverse-primary: '#0059c5'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#a66900'
  on-tertiary-container: '#ffffff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004397'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#10131b'
  on-background: '#e0e2ed'
  surface-variant: '#32353d'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.02em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.6'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for high-performance technical environments where precision and data density are paramount. It draws inspiration from modern developer-centric platforms, blending the clinical efficiency of an IDE with the sleek, high-end finish of a premium SaaS product.

The aesthetic is **Modern Engineering**, characterized by:
- **High Information Density:** Maximizing screen real estate to show complex datasets without visual clutter.
- **Precision Detailing:** Utilizing hairline strokes (1px) and subtle contrast to define hierarchy rather than heavy shadows.
- **Technical Sophistication:** A blend of minimal UI containers with vibrant, glowing indicators that simulate a live "command center" atmosphere.
- **Responsive Motion:** UI transitions should feel instantaneous and mechanical, utilizing "spring" physics to mimic the responsiveness of high-speed local software.

## Colors
The palette is rooted in a "Deep Charcoal" ecosystem to reduce eye strain during long debugging sessions.

- **Primary (Electric Blue):** Used for primary actions, progress indicators, and active API states.
- **Success (Emerald Green):** Indicates healthy endpoints, 200 OK responses, and successful load tests.
- **Warning (Amber):** Used for latency spikes, 4xx errors, or approaching rate limits.
- **Critical (Ruby Red):** Denotes 5xx errors, system crashes, or critical bottlenecks.
- **Neutrals:** A range of Slate Grays (from `#0A0A0A` to `#94A3B8`) used for structural borders and secondary text.

The system uses a **Low-Transparency Surface Strategy**: surfaces are not solid but often use 80-90% opacity with backdrop blurs to maintain a sense of depth.

## Typography
The typography system prioritizes legibility and technical clarity.

- **Inter** is the workhorse for the UI, providing a neutral, highly readable foundation for labels and body text.
- **Geist** (or Inter Medium/SemiBold) is used for UI controls and labels to provide a sharper, more modern geometric feel.
- **JetBrains Mono** is reserved for technical data: API endpoints, JSON payloads, terminal logs, and numerical metrics in charts.

For numerical data in tables, always use **tabular figures** (tnum) to ensure columns of numbers align perfectly for easy visual scanning.

## Layout & Spacing
The layout follows a **Strict 4px Grid System**. All margins, paddings, and component heights must be multiples of 4.

- **Desktop:** A 12-column fluid grid. Dashboards should utilize a "Sidebar + Header + Main Content" structure.
- **Density:** High-density layout. Use 8px or 12px padding inside data tables and 16px inside cards to maximize information visibility.
- **Breakpoints:**
  - Mobile: < 768px (Single column, hidden sidebar)
  - Tablet: 768px - 1024px (Collapsed sidebar, 2-column dashboard)
  - Desktop: > 1024px (Full expanded view)

## Elevation & Depth
Depth is created through **Tonal Layering** and **Subtle Outlines** rather than traditional shadows.

1.  **Level 0 (Background):** Pure black `#000000` or Deep Charcoal `#0A0A0A`.
2.  **Level 1 (Cards/Panels):** Slightly lighter gray `#111111` with a 1px border of `rgba(255,255,255,0.08)`.
3.  **Level 2 (Popovers/Modals):** `#1A1A1A` with a more pronounced border and a subtle background blur (12px).
4.  **Active State (Glow):** Interactive elements may use a soft outer glow (0px 0px 15px) using the Primary color at 20% opacity to indicate focus or "Running" states.

## Shapes
The design system uses a **Medium-Rounded** approach to soften the industrial technicality.

- **Standard Components:** 8px (Buttons, Input fields).
- **Cards & Containers:** 12px to 16px.
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

Borders should always be consistent at 1px width. In dark mode, use semi-transparent white for borders; in light mode, use semi-transparent black.

## Components
- **Buttons:** Primary buttons use a solid Electric Blue background. Secondary buttons use a "Ghost" style with a 1px border. All buttons have a subtle 200ms transition on hover.
- **Status Indicators:** Small circular dots. Use "pulsing" animations for active load tests. Success = Emerald, Failure = Ruby.
- **Data Tables:** Borderless rows with a 1px separator. Use a hover state that highlights the entire row in a subtle `rgba(255,255,255,0.03)` tint.
- **Charts:** Use thin 1.5pt strokes for line charts. Fill the area under the line with a 5% opacity gradient of the line color. Hide grid lines except for the Y-axis zero line.
- **Input Fields:** Dark background, 1px border. On focus, the border changes to Primary Blue with a 2px outer "ring" of transparent blue.
- **Code Blocks:** Syntax highlighting follows the "Sublime" or "One Dark" theme colors, set against a slightly darker background than the surrounding card.