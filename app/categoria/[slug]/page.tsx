import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryStorefront } from '@/components/category-storefront';
import { categories, getCategory } from '@/lib/catalog';

export function generateStaticParams() { return categories.map((category) => ({ slug: category.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const category = getCategory(slug); return category ? { title: `${category.name} · Boutique del Este`, description: category.description } : {}; }
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (!getCategory(slug)) notFound(); return <CategoryStorefront categorySlug={slug} />; }
