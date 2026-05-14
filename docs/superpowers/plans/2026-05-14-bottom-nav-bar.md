# Bottom Navigation Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a glassmorphism floating pill bottom navigation bar with 4 items (Чаты, Авто, Профиль, Скан) visible on mobile/tablet (< 1024px), replacing the top navbar on small screens.

**Architecture:** New `BottomNavBar` client component added alongside the existing `Navigation` wrapper. Top HeroUI Navbar is hidden on mobile via a `hidden lg:block` wrapper div. The standalone floating QR button is removed — its role is taken by the Скан tab. `PageContainer` gets bottom padding on mobile to prevent content from hiding under the fixed pill.

**Tech Stack:** Next.js App Router, styled-components, Tailwind CSS (`lg:` breakpoint), `@telegram-apps/sdk-react` (qrScanner), `next/navigation` (usePathname, useRouter)

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| **Create** | `packages/web/src/components/BottomNavBar/bottom-nav-bar.tsx` | Floating pill nav: icons, labels, active state, QR handler, visibility rules |
| **Modify** | `packages/web/src/components/Navigation/Navigation.tsx` | Hide top navbar on mobile, add `<BottomNavBar />`, remove standalone QR button |
| **Modify** | `packages/web/src/ui/Styled.tsx` | Add bottom padding to `PageContainer` on mobile |

---

### Task 1: Create the BottomNavBar component

**Files:**
- Create: `packages/web/src/components/BottomNavBar/bottom-nav-bar.tsx`

- [ ] **Step 1: Create the file with all styled components and icons**

Create `packages/web/src/components/BottomNavBar/bottom-nav-bar.tsx` with this exact content:

```tsx
'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { qrScanner } from '@telegram-apps/sdk-react';
import { showErrorMessage } from '@/utils/messages';
import { PRODUCTION_URL } from '@/constants/site';

const Pill = styled.nav`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 10px 8px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 40px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);

  @media (min-width: 1024px) {
    display: none;
  }
`;

const itemBase = `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 18px;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
`;

const ItemLink = styled(Link)<{ $active: boolean }>`
  ${itemBase}
  svg {
    stroke: ${({ $active }) => ($active ? '#6C8EFF' : 'rgba(255,255,255,0.35)')};
    filter: ${({ $active }) =>
      $active ? 'drop-shadow(0 0 8px rgba(108,142,255,0.8))' : 'none'};
    transition: stroke 0.2s, filter 0.2s;
  }
`;

const ItemButton = styled.button<{ $active: boolean }>`
  ${itemBase}
  svg {
    stroke: ${({ $active }) => ($active ? '#6C8EFF' : 'rgba(255,255,255,0.35)')};
    filter: ${({ $active }) =>
      $active ? 'drop-shadow(0 0 8px rgba(108,142,255,0.8))' : 'none'};
    transition: stroke 0.2s, filter 0.2s;
  }
`;

const Label = styled.span<{ $active: boolean }>`
  font-size: 10px;
  letter-spacing: 0.3px;
  color: ${({ $active }) => ($active ? '#6C8EFF' : 'rgba(255,255,255,0.35)')};
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  transition: color 0.2s;
`;

const ChatIcon = () => (
  <svg width="22" height="22" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const CarIcon = () => (
  <svg width="22" height="22" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 3H8L5 10H19L16 3Z" />
    <path d="M5 10V17H7M19 10V17H17M7 17A2 2 0 1011 17M13 17A2 2 0 1017 17" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="22" height="22" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const QrIcon = () => (
  <svg width="22" height="22" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01" />
  </svg>
);

const HIDDEN_ROUTES = ['/auth'];
const HIDDEN_PREFIXES = ['/g/'];

export const BottomNavBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  if (
    HIDDEN_ROUTES.includes(pathname) ||
    HIDDEN_PREFIXES.some(p => pathname.startsWith(p))
  ) {
    return null;
  }

  const active = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const handleQrScan = useCallback(async () => {
    if (qrScanner.open.isAvailable()) {
      try {
        await qrScanner.open({
          text: 'QR-код автомобиля или водителя',
          onCaptured: (qrContent: string) => {
            if (qrContent?.startsWith(PRODUCTION_URL)) {
              qrScanner.close();
              router.push(qrContent.slice(PRODUCTION_URL.length));
            } else {
              alert('Некорректный QR-код');
            }
          }
        });
      } catch (error) {
        console.error('Error opening QR scanner:', error);
      }
    } else {
      showErrorMessage('QR-сканнер недоступен', 'QR-сканнер доступен только в приложении Telegram.');
    }
  }, [router]);

  return (
    <Pill>
      <ItemLink href="/messages" $active={active('/messages')}>
        <ChatIcon />
        <Label $active={active('/messages')}>Чаты</Label>
      </ItemLink>

      <ItemLink href="/" $active={active('/', true)}>
        <CarIcon />
        <Label $active={active('/', true)}>Авто</Label>
      </ItemLink>

      <ItemLink href="/profile" $active={active('/profile')}>
        <ProfileIcon />
        <Label $active={active('/profile')}>Профиль</Label>
      </ItemLink>

      <ItemButton $active={false} onClick={handleQrScan}>
        <QrIcon />
        <Label $active={false}>Скан</Label>
      </ItemButton>
    </Pill>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/web && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors for the new file (other pre-existing errors are OK to ignore).

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/BottomNavBar/bottom-nav-bar.tsx
git commit -m "feat: add BottomNavBar floating pill component"
```

---

### Task 2: Wire BottomNavBar into Navigation and hide the top navbar on mobile

**Files:**
- Modify: `packages/web/src/components/Navigation/Navigation.tsx`

Current structure (simplified):
```tsx
return (
  <div className='min-h-screen flex flex-col'>
    {isTelegramWebApp ? (
      <><TgSpace /></>
    ) : (
      <StyledNavbar ...>...</StyledNavbar>   // ← wrap this in hidden lg:block
    )}

    {/* children */}

    {isTelegramWebApp && <QRCode onClick={handleQrCodeScan} />}  // ← remove this line
  </div>
);
```

- [ ] **Step 1: Import BottomNavBar**

Add to the imports at the top of `packages/web/src/components/Navigation/Navigation.tsx`:

```ts
import { BottomNavBar } from '@/components/BottomNavBar/bottom-nav-bar';
```

- [ ] **Step 2: Wrap the top StyledNavbar in a mobile-hiding div**

Find this block (lines ~119–155 in the file):
```tsx
        <StyledNavbar
          isBordered
          maxWidth='xl'
          position='sticky'
          onMenuOpenChange={setIsMenuOpen}
          isMenuOpen={isMenuOpen}
        >
          ...
        </StyledNavbar>
```

The entire `else` branch currently renders `StyledNavbar` directly. Wrap it:

```tsx
    ) : (
      <div className='hidden lg:block'>
        <StyledNavbar
          isBordered
          maxWidth='xl'
          position='sticky'
          onMenuOpenChange={setIsMenuOpen}
          isMenuOpen={isMenuOpen}
        >
          <NavbarContent>
            <NavbarMenuToggle aria-label='Открыть меню' className='sm:hidden' />
            <Spacer />
            <Button size='sm' targetBlank href={telegramAppLink}>
              Продолжить в Telegram
            </Button>
          </NavbarContent>

          <NavbarContent className='hidden sm:flex gap-4' justify='center'>
            {filteredMenuItems.map(item => (
              <NavbarItem key={item.href} isActive={pathname === item.href}>
                <Link
                  href={item.href}
                  className={`w-full ${pathname === item.href ? 'font-bold' : 'text-foreground'}`}
                >
                  {item.name}
                </Link>
              </NavbarItem>
            ))}
          </NavbarContent>

          <StyledMenu>
            {filteredMenuItems.map(item => (
              <StyledItem $active={pathname === item.href} key={item.href}>
                <Link href={item.href}>{item.name}</Link>
              </StyledItem>
            ))}
          </StyledMenu>
        </StyledNavbar>
      </div>
    )}
```

- [ ] **Step 3: Remove the standalone QRCode button and add BottomNavBar**

Find and **delete** this line near the bottom of the return:
```tsx
      {isTelegramWebApp && <QRCode onClick={handleQrCodeScan} />}
```

In its place (or just after the children block), add:
```tsx
      <BottomNavBar />
```

The final `return` should look like:
```tsx
  return (
    <div className='min-h-screen flex flex-col'>
      {isTelegramWebApp ? (
        <>
          <TgSpace />
        </>
      ) : (
        <div className='hidden lg:block'>
          <StyledNavbar
            isBordered
            maxWidth='xl'
            position='sticky'
            onMenuOpenChange={setIsMenuOpen}
            isMenuOpen={isMenuOpen}
          >
            <NavbarContent>
              <NavbarMenuToggle aria-label='Открыть меню' className='sm:hidden' />
              <Spacer />
              <Button size='sm' targetBlank href={telegramAppLink}>
                Продолжить в Telegram
              </Button>
            </NavbarContent>

            <NavbarContent className='hidden sm:flex gap-4' justify='center'>
              {filteredMenuItems.map(item => (
                <NavbarItem key={item.href} isActive={pathname === item.href}>
                  <Link
                    href={item.href}
                    className={`w-full ${pathname === item.href ? 'font-bold' : 'text-foreground'}`}
                  >
                    {item.name}
                  </Link>
                </NavbarItem>
              ))}
            </NavbarContent>

            <StyledMenu>
              {filteredMenuItems.map(item => (
                <StyledItem $active={pathname === item.href} key={item.href}>
                  <Link href={item.href}>{item.name}</Link>
                </StyledItem>
              ))}
            </StyledMenu>
          </StyledNavbar>
        </div>
      )}

      {pathname.startsWith('/messages') || /^\/g\/[^/]+\/chat/.test(pathname) ? (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      ) : (
        <PageContainer>{children}</PageContainer>
      )}

      <BottomNavBar />
    </div>
  );
```

- [ ] **Step 4: Remove unused imports and dead code**

Since `QRCode`, `qrCodeSvg`, `handleQrCodeScan`, and related logic are now moved to `BottomNavBar`, delete from `Navigation.tsx`:
- `import qrCodeSvg from '@/assets/images/qrcode.svg';`
- `import { qrScanner } from '@telegram-apps/sdk-react';`
- `import { showErrorMessage } from '@/utils/messages';`
- `import { PRODUCTION_URL } from '@/constants/site';`
- `useRouter` from the `next/navigation` import (router was only used in `handleQrCodeScan`)
- The `const QRCode = styled(qrCodeSvg)...` styled component definition
- The `const router = useRouter();` line
- The `handleQrCodeScan` callback function

Keep:
- `isTelegramWebApp` — still used for the `TgSpace` conditional
- `usePathname`, `useRouter`… wait, remove `useRouter` (no longer needed), keep `usePathname`

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd packages/web && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add packages/web/src/components/Navigation/Navigation.tsx
git commit -m "feat: wire BottomNavBar into Navigation, hide top nav on mobile"
```

---

### Task 3: Add bottom padding to PageContainer on mobile

**Files:**
- Modify: `packages/web/src/ui/Styled.tsx`

- [ ] **Step 1: Open the file and locate PageContainer**

In `packages/web/src/ui/Styled.tsx`, find:

```ts
export const PageContainer = styled(CenterContainer).attrs({
  as: 'main'
})`
  flex: 1;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  width: 100%;
`;
```

- [ ] **Step 2: Add bottom padding on mobile**

Replace with:

```ts
export const PageContainer = styled(CenterContainer).attrs({
  as: 'main'
})`
  flex: 1;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  width: 100%;

  @media (max-width: 1023px) {
    padding-bottom: 90px;
  }
`;
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd packages/web && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/ui/Styled.tsx
git commit -m "feat: add bottom padding to PageContainer on mobile for bottom nav"
```

---

### Task 4: Smoke-test in browser

- [ ] **Step 1: Start the dev stack**

```bash
docker compose up database backend web
```

Wait until you see `✓ Ready` in the web container logs (or the Next.js ready message).

- [ ] **Step 2: Open the app on mobile viewport**

Open `http://localhost` in Chrome DevTools with iPhone 14 Pro emulation (390 × 844).

Check:
- [ ] Floating pill appears at the bottom
- [ ] **Авто** tab is active (glow + blue label) when on `/`
- [ ] **Чаты** tab is active when navigating to `/messages`
- [ ] **Профиль** tab is active when navigating to `/profile`
- [ ] Tapping **Скан** triggers the QR error toast (since QR scanner is Telegram-only)
- [ ] Top navbar is **not visible** on mobile viewport

- [ ] **Step 3: Verify desktop**

Switch Chrome DevTools to desktop (1440px wide).

Check:
- [ ] Bottom pill is **not visible**
- [ ] Top HeroUI Navbar appears as before

- [ ] **Step 4: Verify /auth page**

Navigate to `/auth`.
- [ ] Bottom pill **does not appear** on the auth page

- [ ] **Step 5: Final commit if any tweaks were needed**

```bash
git add -p
git commit -m "fix: bottom nav visual tweaks from smoke test"
```
