import type { Metadata } from 'next';
import { StoreProvider } from '@/components/store-provider';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Boutique del Este | Perfumes y cuidado personal en Uruguay',
    template: '%s | Boutique del Este',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'perfumes en Uruguay',
    'cuidado personal',
    'regalos originales',
    'lámparas de luz roja',
    'Maldonado',
    'Punta del Este',
    'Ekos',
    'Essencial',
    'Tododia',
    'Luna',
  ],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: 'Boutique del Este | Perfumes y cuidado personal en Uruguay',
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'es_UY',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Boutique del Este, tienda online en Uruguay' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boutique del Este | Perfumes y cuidado personal en Uruguay',
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
};

const storeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  currenciesAccepted: 'UYU',
  telephone: '+59892143420',
  areaServed: [
    { '@type': 'City', name: 'Maldonado' },
    { '@type': 'City', name: 'Punta del Este' },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+59892143420',
    contactType: 'customer service',
    areaServed: 'UY',
    availableLanguage: 'Spanish',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-UY">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeStructuredData).replace(/</g, '\\u003c') }}
        />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
