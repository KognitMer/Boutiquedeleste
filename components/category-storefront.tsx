'use client';

import { categories, products } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';
import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';

export function CategoryStorefront({ categorySlug }: { categorySlug: string }) {
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return null;
  const categoryProducts = products.filter((product) => product.categorySlug === category.slug);
  return <main><StoreHeader /><div className="breadcrumbs section-shell"><a href="/">Inicio</a><span>›</span><strong>{category.name}</strong></div><section className={`category-hero ${category.tone}`}><div className="section-shell"><span className="category-hero-icon" aria-hidden="true">{category.icon}</span><p>explorá la colección</p><h1>{category.name}</h1><div>{category.description}</div></div></section><section className="products-section section-shell category-products"><div className="section-heading"><div><p>catálogo uruguay</p><h2>{categoryProducts.length ? `${categoryProducts.length} productos para vos` : 'Muy pronto en esta sección'}</h2></div></div>{categoryProducts.length ? <div className="product-grid">{categoryProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="empty-state category-empty"><span>{category.icon}</span><h3>Estamos preparando esta colección</h3><p>Mientras tanto, podés descubrir nuestras otras categorías.</p><a href="/#productos">ver productos disponibles</a></div>}</section><section className="section-shell more-categories"><p>seguí explorando</p><div>{categories.filter((item) => item.slug !== category.slug).map((item) => <a key={item.slug} href={`/categoria/${item.slug}`}>{item.name}<span>→</span></a>)}</div></section><StoreFooter /></main>;
}
