import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'ŞefSıfır / ChefZero - Dolabındaki Lezzet, Sıfır İsraf',
  description: 'Yapay zeka destekli sıfır atık mutfak ekosistemi. Multimodal malzeme tanıma, akıllı tarif üretimi, Airfryer vs. Fırın analizi ve dinamik alışveriş yönetimi.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ŞefSıfır',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'ŞefSıfır / ChefZero - Dolabındaki Lezzet, Sıfır İsraf',
    description: 'Yapay zeka destekli sıfır atık mutfak ekosistemi. Multimodal malzeme tanıma, akıllı tarif üretimi, Airfryer vs. Fırın analizi ve dinamik alışveriş yönetimi.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ŞefSıfır / ChefZero - Dolabındaki Lezzet, Sıfır İsraf',
    description: 'Yapay zeka destekli sıfır atık mutfak ekosistemi. Multimodal malzeme tanıma, akıllı tarif üretimi, Airfryer vs. Fırın analizi ve dinamik alışveriş yönetimi.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="tr">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
