import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { getProduct } from '@/lib/catalog';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const product = getProduct(slug); if (!product) return {}; return { title: `${product.name} · Natura Uruguay`, description: product.description, openGraph: { title: product.name, description: product.description, images: [{ url: product.image }] }, twitter: { card: 'summary_large_image', title: product.name, description: product.description, images: [product.image] } }; }
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const product = getProduct(slug); if (!product) notFound(); return <ProductDetail product={product} />; }
