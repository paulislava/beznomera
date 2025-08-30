import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import StyledComponentsRegistry from '@/lib/registry';

import './globals.css';
import { CDN_URL, PRODUCTION_URL } from '@/constants/site';
import { ProvidersContainer } from '@/components/ProvidersContainer/ProvidersContainer';
import { Navigation } from '@/components/Navigation';
import { InitWebApp } from '@/components/InitWebApp';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

const title = 'BEZNOMERA';
const description =
  'Соцсеть для водителей. Интегрировано с Telegram. Анонимность, скорость, удобство.';

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(PRODUCTION_URL),
  openGraph: {
    type: 'website',
    url: PRODUCTION_URL,
    title,
    description,
    images: [
      {
        url: 'https://cdn.beznomera.net/og-image.png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['https://cdn.beznomera.net/og-image.png']
  },
  icons: {
    icon: `${PRODUCTION_URL}/favicon.ico`,
    apple: `${CDN_URL}/apple-touch-icon.png`
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent'
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#090633'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ru'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <InitWebApp />
        <StyledComponentsRegistry>
          <ProvidersContainer>
            <Navigation>{children}</Navigation>
          </ProvidersContainer>
        </StyledComponentsRegistry>

        <Script
          id='yandex-metrika'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              (function (m, e, t, r, i, k, a) {
                m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
                m[i].l = 1 * new Date();
                for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
                k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
              })
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(99937060, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true
              });
            `
          }}
        />

        <noscript>
          <div>
            <img
              src='https://mc.yandex.ru/watch/99937060'
              style={{ position: 'absolute', left: '-9999px' }}
              alt=''
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
