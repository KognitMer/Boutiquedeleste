import type { Metadata } from 'next';
import { StoreProvider } from '@/components/store-provider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://boutique-del-este.maria-soriano-rod.chatgpt.site'),
  title: 'Boutique del Este · Belleza y cuidado personal',
  description: 'Tienda independiente de perfumería, maquillaje y cuidado personal, con entregas en Maldonado y Punta del Este.',
  openGraph: {
    title: 'Boutique del Este · Belleza y cuidado personal',
    description: 'Una selección independiente de belleza y cuidado personal, con entregas en Maldonado y Punta del Este.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Boutique del Este · Belleza y cuidado personal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boutique del Este · Belleza y cuidado personal',
    description: 'Una selección independiente de belleza y cuidado personal, con entregas en Maldonado y Punta del Este.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-UY">
      <body><StoreProvider>{children}</StoreProvider></body>
    </html>
  );
}
