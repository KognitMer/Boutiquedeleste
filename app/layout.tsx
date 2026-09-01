import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://natura-uruguay.maria-soriano-rod.chatgpt.site'),
  title: 'Natura Uruguay · Belleza que hace bien',
  description: 'Perfumería, maquillaje y cuidado personal Natura con entregas en todo Uruguay.',
  openGraph: {
    title: 'Natura Uruguay · Belleza que hace bien',
    description: 'Descubrí perfumería, maquillaje y cuidado personal con entregas en todo Uruguay.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Natura Uruguay · Belleza que hace bien' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Natura Uruguay · Belleza que hace bien',
    description: 'Descubrí perfumería, maquillaje y cuidado personal con entregas en todo Uruguay.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-UY">
      <body>{children}</body>
    </html>
  );
}
