import type { MetadataRoute } from 'next';
import { catalogLastUpdatedAt } from '@/app/catalog-data';
import { categories, products } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(catalogLastUpdatedAt);

  return [
    { url: SITE_URL, lastModified, changeFrequency: 'daily', priority: 1 },
    ...['terminos-y-condiciones', 'politica-de-privacidad', 'cambios-y-devoluciones', 'envios-y-entregas'].map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...categories.map((category) => ({
      url: `${SITE_URL}/categoria/${category.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/productos/${product.sku}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
