'use client';

import { FormEvent, useState } from 'react';
import { useStore } from '@/components/store-provider';

const navItems = [
  ['promociones', '/#productos'],
  ['perfumería', '/categoria/perfumeria'],
  ['cuerpo y baño', '/categoria/cuerpo-y-bano'],
  ['cabello', '/categoria/cabello'],
  ['rostro', '/categoria/rostro'],
  ['maquillaje', '/categoria/maquillaje'],
  ['infantil', '/categoria/infantil'],
  ['hogar', '/categoria/hogar'],
  ['regalos', '/categoria/regalos'],
];

export function Icon({ children }: { children: React.ReactNode }) {
  return <span aria-hidden="true" className="icon">{children}</span>;
}

export function StoreHeader() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, openCart, showNotice } = useStore();

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const search = query.trim();
    window.location.href = search ? `/?q=${encodeURIComponent(search)}#productos` : '/#productos';
  }

  return <>
    <div className="top-strip"><span>Entrega en 24 h en Maldonado y Punta del Este</span><span>Precios en pesos uruguayos</span><span>Stock sujeto a confirmación</span></div>
    <header className="site-header">
      <button className="mobile-menu" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <a className="wordmark" href="/" aria-label="Natura Uruguay, inicio">natura<small>uruguay</small></a>
      <form className="search" onSubmit={submitSearch} role="search">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="¿qué estás buscando hoy?" aria-label="Buscar productos" />
        <button aria-label="Buscar"><Icon>⌕</Icon></button>
      </form>
      <div className="account-actions">
        <button aria-label="Mis favoritos" onClick={() => showNotice('Tus favoritos quedan guardados en este dispositivo.')}><Icon>♡</Icon><span>favoritos</span></button>
        <button aria-label="Ingresar a mi cuenta" onClick={() => showNotice('El acceso de clientes se conectará en la próxima etapa.')}><Icon>♙</Icon><span>ingresar</span></button>
        <button className="bag-button" aria-label={`Bolsa con ${cartCount} productos`} onClick={openCart}><Icon>♧</Icon><b>{cartCount}</b><span>mi bolsa</span></button>
      </div>
    </header>
    <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Categorías de productos">
      {navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
    </nav>
  </>;
}
