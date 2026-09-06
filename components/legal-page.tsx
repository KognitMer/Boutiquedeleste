import Link from 'next/link';
import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';

type LegalPageProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

export function LegalPage({ eyebrow, title, children }: LegalPageProps) {
  return (
    <>
      <StoreHeader />
      <main className="legal-page">
        <div className="legal-page-inner">
          <Link className="legal-back" href="/">← Volver a la tienda</Link>
          <p className="legal-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <div className="legal-content">{children}</div>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
