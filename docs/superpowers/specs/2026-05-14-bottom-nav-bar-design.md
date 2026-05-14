# Bottom Navigation Bar — Design Spec

**Date:** 2026-05-14
**Status:** Approved

## Summary

Add a floating bottom navigation bar for mobile and tablet (< 1024px). Replaces the top HeroUI Navbar on small screens. Uses a glassmorphism "floating pill" style with icon glow active indicator.

## Visual Design

- **Shape:** Rounded pill (`border-radius: 40px`), horizontally centered, `position: fixed`, `bottom: 24px`
- **Background:** `rgba(255,255,255,0.07)` with `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255,255,255,0.12)`, `box-shadow: 0 8px 40px rgba(0,0,0,0.5)`
- **Active state (Icon Glow):**
  - Icon stroke: `#6C8EFF` + `filter: drop-shadow(0 0 8px rgba(108,142,255,0.8))`
  - Label: `color: #6C8EFF`, `font-weight: 700`
- **Inactive state:** Icon stroke + label `rgba(255,255,255,0.35)`
- **Safe area:** `padding-bottom: env(safe-area-inset-bottom)` to handle iPhone notch

## Navigation Items

| Label   | Icon          | Route / Action                        |
|---------|---------------|---------------------------------------|
| Чаты    | Chat bubble   | `/messages`                           |
| Авто    | Building/Car  | `/`                                   |
| Профиль | Person        | `/profile`                            |
| Скан    | QR code       | `qrScanner.open()` (Telegram SDK)     |

Active item is determined by `usePathname()`. The Скан tab is a button (no route), it calls the existing QR scanner logic.

## Visibility Rules

- **Shows on:** mobile + tablet (viewport width < 1024px / `lg` Tailwind breakpoint)
- **Hides on:** desktop (`lg+`) — top navbar takes over
- **Hidden on routes:** `/auth`, `/g/*` (guest pages) — no nav needed there
- **Telegram Web App:** bottom nav always shows (no top navbar in TG context anyway)

## Files Changed

### New file
`packages/web/src/components/BottomNavBar/bottom-nav-bar.tsx`
- `'use client'` component
- Uses `usePathname`, `useRouter` from `next/navigation`
- Uses `isTelegramWebApp`, `qrScanner` from existing utilities
- Styled with `styled-components`
- Exports: `BottomNavBar`

### Modified file
`packages/web/src/components/Navigation/Navigation.tsx`
- Wrap `StyledNavbar` in a container with `className="hidden lg:block"` so it hides on mobile/tablet
- Add `<BottomNavBar />` at the bottom of the returned JSX
- Remove the standalone `<QRCode>` floating button (its role is taken by the Скан tab)

### Modified file
`packages/web/src/ui/Styled.tsx`
- `PageContainer`: add `padding-bottom: 90px` on mobile (below `lg`) to prevent content from being obscured by the floating nav

## Breakpoints

- Mobile/tablet: `max-width: 1023px` — bottom nav visible, top navbar hidden
- Desktop: `min-width: 1024px` — top navbar visible, bottom nav hidden

## Constraints

- QR scanner (Скан tab) only works inside Telegram Web App. On regular web, show an error toast (existing `showErrorMessage` utility).
- The bottom nav must sit above all page content (`z-index: 100`).
- No animation on first render; tab switch can have a subtle `transition` on icon color/glow.
