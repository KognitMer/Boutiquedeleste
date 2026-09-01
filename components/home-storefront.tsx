'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { categories, products } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';
import { StoreFooter } from '@/components/store-footer';
import { StoreHeader, Icon } from '@/components/store-header';
import { useStore } from '@/components/store-provider';

export function HomeStorefront() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { showNotice } = useStore();

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('q');
    if (value) setQuery(value);
  }, []);

  const filtered = useMemo(() => {
    const text = query.trim().toLocaleLowerCase('es');
    return products.filter((product) => {
      const categoryMatch = selectedCategory === 'Todos' || product.category === selectedCategory;
      const textMatch = !text || `${product.brand} ${product.name} ${product.category}`.toLocaleLowerCase('es').includes(text);
      return categoryMatch && textMatch;
    });
  }, [query, selectedCategory]);

  function chooseCategory(category: string) {
    setSelectedCategory(category);
    window.setTimeout(() => document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' }), 20);
  }

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    showNotice('¡Gracias! Ya sos parte de la comunidad.');
    event.currentTarget.reset();
  }

  return <main>
    <StoreHeader />
    <section id="inicio" className="hero" aria-label="Promoción principal">
      <img src="https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-NatArgentina-Library/default/dwf015c967/00_HOMES/09_2026/31_a_06/HERO/FLASHSALE1/FLASHSALE1_BHERO_DESK.jpg?q=80" alt="Selección de productos Natura en promoción" />
      <div className="hero-scrim" />
      <div className="hero-copy"><p>semana natura</p><h1>Todo lo que te hace bien,<br /><em>ahora más cerca.</em></h1><span>Hasta 40% off en favoritos seleccionados</span><button onClick={() => document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' })}>ver promociones</button></div>
      <div className="hero-dots" aria-hidden="true"><i className="active" /><i /><i /></div>
    </section>
    <section className="benefits" aria-label="Beneficios de compra">
      <article><Icon>◇</Icon><div><strong>Envío gratis</strong><span>en compras desde $ 2.500</span></div></article><article><Icon>◎</Icon><div><strong>Pagá como quieras</strong><span>tarjetas, transferencia o efectivo</span></div></article><article><Icon>♲</Icon><div><strong>Compra consciente</strong><span>productos veganos y repuestos</span></div></article><article><Icon>⌂</Icon><div><strong>Estamos cerca</strong><span>entregas en todo el país</span></div></article>
    </section>
    <section className="category-section section-shell">
      <div className="section-heading"><div><p>encontrá tu ritual</p><h2>¿Qué estás buscando?</h2></div><a className="text-link" href="#productos">ver todo <span>→</span></a></div>
      <div className="category-grid">{categories.map((category) => <a className={`category-card ${category.tone}`} key={category.slug} href={`/categoria/${category.slug}`}><span className="category-art">{category.icon}</span><strong>{category.name}</strong><small>abrir sección <b>→</b></small></a>)}</div>
    </section>
    <section id="productos" className="products-section section-shell">
      <div className="section-heading products-heading"><div><p>elegidos para vos</p><h2>{query ? `Resultados para “${query}”` : 'Imperdibles de la semana'}</h2></div><div className="filter-pills" aria-label="Filtrar productos">{['Todos', 'Perfumería', 'Cuidados corporales', 'Rostro'].map((category) => <button key={category} className={selectedCategory === category ? 'active' : ''} onClick={() => chooseCategory(category)}>{category === 'Cuidados corporales' ? 'Cuerpo' : category}</button>)}</div></div>
      {filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="empty-state"><span>⌕</span><h3>No encontramos productos</h3><p>Probá con otra búsqueda o mirá todas las categorías.</p><button onClick={() => { setQuery(''); setSelectedCategory('Todos'); }}>ver todos</button></div>}
      <p className="demo-prices">Precios de referencia expresados en pesos uruguayos. Catálogo demostrativo sujeto a confirmación de stock y precio.</p>
    </section>
    <section className="story-banner section-shell"><div className="story-art"><span>amazonia viva</span><b>Ekos</b></div><div className="story-copy"><p>belleza que regenera</p><h2>Cuando cuidás de vos,<br />también cuidás del mundo.</h2><span>Fórmulas veganas, activos de la biodiversidad y envases con menos plástico.</span><a href="/categoria/cuidados-corporales">conocer ekos</a></div></section>
    <section className="newsletter"><div><p>quedate cerca</p><h2>Recibí novedades y beneficios</h2><span>Promociones, lanzamientos y rituales de bienestar directo en tu mail.</span></div><form onSubmit={subscribe}><label><span>Tu email</span><input required type="email" placeholder="hola@ejemplo.com" /></label><button>quiero recibir novedades</button></form></section>
    <StoreFooter />
  </main>;
}
