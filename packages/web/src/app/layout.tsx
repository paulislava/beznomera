import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/registry';

import './globals.css';
import { CDN_URL, PRODUCTION_URL } from '@/constants/site';

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
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
