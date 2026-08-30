import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ŞefSıfır / ChefZero - Dolabındaki Lezzet, Sıfır İsraf',
  description: 'Yapay zeka destekli sıfır atık mutfak ekosistemi. Multimodal malzeme tanıma, akıllı tarif üretimi, Airfryer vs. Fırın analizi ve dinamik alışveriş yönetimi.',
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
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
