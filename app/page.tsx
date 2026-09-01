'use client';

import { FormEvent, useMemo, useState } from 'react';

type Product = {
  id: number;
  brand: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
  tag?: string;
};

const categories = [
  { name: 'Perfumería', icon: '✦', tone: 'peach' },
  { name: 'Cuidados corporales', icon: '◌', tone: 'rose' },
  { name: 'Rostro', icon: '☼', tone: 'sand' },
  { name: 'Cabello', icon: '〰', tone: 'green' },
  { name: 'Maquillaje', icon: '◐', tone: 'berry' },
  { name: 'Regalos', icon: '⌑', tone: 'orange' },
];

const products: Product[] = [
  {
    id: 1,
    brand: 'Tododia',
    name: 'Body splash Frambuesa y Pimienta Roja 200 ml',
    category: 'Cuidados corporales',
    price: 790,
    oldPrice: 1190,
    discount: 34,
    tag: 'más vendido',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw764b0c3e/18237_1.jpg',
  },
  {
    id: 2,
    brand: 'Ekos',
    name: 'Pulpa hidratante corporal Castaña 400 ml',
    category: 'Cuidados corporales',
    price: 990,
    oldPrice: 1490,
    discount: 34,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwce8320c7/ProdutoJoia/desktop/80936.jpg',
  },
  {
    id: 3,
    brand: 'Chronos Derma',
    name: 'Protector aclarador FPS 50+ 50 ml',
    category: 'Rostro',
    price: 1290,
    oldPrice: 1790,
    discount: 28,
    tag: 'nuevo',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw4df526ef/ProdutoJoia/desktop/80059.jpg',
  },
  {
    id: 4,
    brand: 'Tododia',
    name: 'Crema nutritiva Mora y Flor de Durazno 400 ml',
    category: 'Cuidados corporales',
    price: 690,
    oldPrice: 990,
    discount: 30,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw3d96a449/ProdutoJoia/desktop/181896.jpg',
  },
  {
    id: 5,
    brand: 'Homem',
    name: 'Eau de Parfum Homem Essence 25 ml',
    category: 'Perfumería',
    price: 1190,
    oldPrice: 1690,
    discount: 30,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwfc05921e/ProdutoJoia/desktop/89185.jpg',
  },
  {
    id: 6,
    brand: 'Kaiak',
    name: 'Eau de Toilette Masculino Urbe 100 ml',
    category: 'Perfumería',
    price: 1890,
    oldPrice: 2690,
    discount: 30,
    tag: 'favorito',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw3b022f77/ProdutoJoia/desktop/111172.jpg',
  },
  {
    id: 7,
    brand: 'Homem',
    name: 'Eau de Parfum Cor.Agio 100 ml',
    category: 'Perfumería',
    price: 2890,
    oldPrice: 3690,
    discount: 22,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwe26eb8ef/ProdutoJoia/desktop/186.jpg',
  },
  {
    id: 8,
    brand: 'Kriska',
    name: 'Eau de Toilette Shock Femenino 100 ml',
    category: 'Perfumería',
    price: 1590,
    oldPrice: 2190,
    discount: 27,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw6ac8b0d7/ProdutoJoia/desktop/83323.jpg',
  },
];

const currency = new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 });

function Icon({ children }: { children: React.ReactNode }) {
  return <span aria-hidden="true" className="icon">{children}</span>;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => {
    const text = query.trim().toLocaleLowerCase('es');
    return products.filter((product) => {
      const categoryMatch = selectedCategory === 'Todos' || product.category === selectedCategory;
      const textMatch = !text || `${product.brand} ${product.name} ${product.category}`.toLocaleLowerCase('es').includes(text);
      return categoryMatch && textMatch;
    });
  }, [query, selectedCategory]);

  const cartItems = products.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  function addToCart(product: Product) {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
    setNotice(`${product.brand} se agregó a tu bolsa`);
    window.setTimeout(() => setNotice(''), 2200);
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + amount);
      const updated = { ...current, [id]: next };
      if (!next) delete updated[id];
      return updated;
    });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' });
  }

  function chooseCategory(category: string) {
    setSelectedCategory(category);
    setMenuOpen(false);
    window.setTimeout(() => document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' }), 20);
  }

  return (
    <main>
      <div className="top-strip">
        <span>Envíos a todo Uruguay</span>
        <span>6 cuotas sin recargo</span>
        <span>Cambios fáciles</span>
      </div>

      <header className="site-header">
        <button className="mobile-menu" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <a className="wordmark" href="#inicio" aria-label="Natura Uruguay, inicio">natura<small>uruguay</small></a>
        <form className="search" onSubmit={submitSearch} role="search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="¿qué estás buscando hoy?" aria-label="Buscar productos" />
          <button aria-label="Buscar"><Icon>⌕</Icon></button>
        </form>
        <div className="account-actions">
          <button aria-label="Mis favoritos"><Icon>♡</Icon><span>favoritos</span></button>
          <button aria-label="Ingresar a mi cuenta"><Icon>♙</Icon><span>ingresar</span></button>
          <button className="bag-button" aria-label={`Bolsa con ${cartCount} productos`} onClick={() => setCartOpen(true)}>
            <Icon>♧</Icon><b>{cartCount}</b><span>mi bolsa</span>
          </button>
        </div>
      </header>

      <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Categorías de productos">
        {['promociones', 'kits', 'perfumería', 'cuidados corporales', 'repuestos', 'cabello', 'rostro', 'maquillaje', 'hombres', 'infantil', 'marcas'].map((item) => (
          <button key={item} onClick={() => chooseCategory(item === 'perfumería' ? 'Perfumería' : item === 'cuidados corporales' ? 'Cuidados corporales' : item === 'rostro' ? 'Rostro' : 'Todos')}>{item}</button>
        ))}
      </nav>

      <section id="inicio" className="hero" aria-label="Promoción principal">
        <img src="https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-NatArgentina-Library/default/dwf015c967/00_HOMES/09_2026/31_a_06/HERO/FLASHSALE1/FLASHSALE1_BHERO_DESK.jpg?q=80" alt="Selección de productos Natura en promoción" />
        <div className="hero-scrim" />
        <div className="hero-copy">
          <p>semana natura</p>
          <h1>Todo lo que te hace bien,<br /><em>ahora más cerca.</em></h1>
          <span>Hasta 40% off en favoritos seleccionados</span>
          <button onClick={() => document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' })}>ver promociones</button>
        </div>
        <div className="hero-dots" aria-hidden="true"><i className="active" /><i /><i /></div>
      </section>

      <section className="benefits" aria-label="Beneficios de compra">
        <article><Icon>◇</Icon><div><strong>Envío gratis</strong><span>en compras desde $ 2.500</span></div></article>
        <article><Icon>◎</Icon><div><strong>Pagá como quieras</strong><span>tarjetas, transferencia o efectivo</span></div></article>
        <article><Icon>♲</Icon><div><strong>Compra consciente</strong><span>productos veganos y repuestos</span></div></article>
        <article><Icon>⌂</Icon><div><strong>Estamos cerca</strong><span>entregas en todo el país</span></div></article>
      </section>

      <section className="category-section section-shell">
        <div className="section-heading"><div><p>encontrá tu ritual</p><h2>¿Qué estás buscando?</h2></div><button onClick={() => chooseCategory('Todos')}>ver todo <span>→</span></button></div>
        <div className="category-grid">
          {categories.map((category) => (
            <button className={`category-card ${category.tone}`} key={category.name} onClick={() => chooseCategory(category.name)}>
              <span className="category-art">{category.icon}</span>
              <strong>{category.name}</strong>
              <small>descubrir <b>→</b></small>
            </button>
          ))}
        </div>
      </section>

      <section id="productos" className="products-section section-shell">
        <div className="section-heading products-heading">
          <div><p>elegidos para vos</p><h2>{query ? `Resultados para “${query}”` : 'Imperdibles de la semana'}</h2></div>
          <div className="filter-pills" aria-label="Filtrar productos">
            {['Todos', 'Perfumería', 'Cuidados corporales', 'Rostro'].map((category) => <button key={category} className={selectedCategory === category ? 'active' : ''} onClick={() => setSelectedCategory(category)}>{category === 'Cuidados corporales' ? 'Cuerpo' : category}</button>)}
          </div>
        </div>

        {filtered.length ? (
          <div className="product-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  {product.tag && <span className="product-tag">{product.tag}</span>}
                  <span className="discount">-{product.discount}%</span>
                  <button className={`heart ${favorites.includes(product.id) ? 'saved' : ''}`} aria-label={favorites.includes(product.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'} onClick={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])}>{favorites.includes(product.id) ? '♥' : '♡'}</button>
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>
                <div className="product-info">
                  <span className="product-brand">{product.brand}</span>
                  <h3>{product.name}</h3>
                  <div className="rating" aria-label="Calificación 4.8 de 5">★★★★★ <span>4.8</span></div>
                  <div className="price"><del>{currency.format(product.oldPrice)}</del><strong>{currency.format(product.price)}</strong></div>
                  <small className="installments">6 cuotas de {currency.format(Math.ceil(product.price / 6))}</small>
                  <button className="add-button" onClick={() => addToCart(product)}>agregar a mi bolsa</button>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="empty-state"><span>⌕</span><h3>No encontramos productos</h3><p>Probá con otra búsqueda o mirá todas las categorías.</p><button onClick={() => { setQuery(''); setSelectedCategory('Todos'); }}>ver todos</button></div>}
        <p className="demo-prices">Precios de referencia expresados en pesos uruguayos. Catálogo demostrativo sujeto a confirmación de stock y precio.</p>
      </section>

      <section className="story-banner section-shell">
        <div className="story-art"><span>amazonia viva</span><b>Ekos</b></div>
        <div className="story-copy"><p>belleza que regenera</p><h2>Cuando cuidás de vos,<br />también cuidás del mundo.</h2><span>Fórmulas veganas, activos de la biodiversidad y envases con menos plástico.</span><button onClick={() => chooseCategory('Cuidados corporales')}>conocer ekos</button></div>
      </section>

      <section className="newsletter">
        <div><p>quedate cerca</p><h2>Recibí novedades y beneficios</h2><span>Promociones, lanzamientos y rituales de bienestar directo en tu mail.</span></div>
        <form onSubmit={(event) => { event.preventDefault(); setNotice('¡Gracias! Ya sos parte de la comunidad.'); window.setTimeout(() => setNotice(''), 2500); }}>
          <label><span>Tu email</span><input required type="email" placeholder="hola@ejemplo.com" /></label>
          <button>quiero recibir novedades</button>
        </form>
      </section>

      <footer>
        <a className="wordmark footer-logo" href="#inicio">natura<small>uruguay</small></a>
        <div><strong>comprá</strong><a href="#productos">Promociones</a><a href="#productos">Perfumería</a><a href="#productos">Cuidado personal</a><a href="#productos">Regalos</a></div>
        <div><strong>ayuda</strong><a href="#inicio">Preguntas frecuentes</a><a href="#inicio">Envíos y entregas</a><a href="#inicio">Cambios y devoluciones</a><a href="#inicio">Contacto</a></div>
        <div><strong>natura uruguay</strong><a href="#inicio">Sobre Natura</a><a href="#inicio">Sustentabilidad</a><a href="#inicio">Quiero vender</a><a href="#inicio">Encontrá una consultora</a></div>
        <div className="country"><span>Uruguay · UYU</span><small>Montevideo y todo el país</small></div>
        <p className="legal">Propuesta digital de tienda para Uruguay. Natura y sus líneas de producto son marcas de sus respectivos titulares.</p>
      </footer>

      {notice && <div className="toast" role="status">✓ {notice}</div>}

      {cartOpen && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="drawer-head"><div><span>tu compra</span><h2 id="cart-title">Mi bolsa ({cartCount})</h2></div><button aria-label="Cerrar bolsa" onClick={() => setCartOpen(false)}>×</button></div>
            {cartItems.length ? <>
              <div className="cart-list">
                {cartItems.map((product) => <article key={product.id}><img src={product.image} alt="" /><div><span>{product.brand}</span><h3>{product.name}</h3><strong>{currency.format(product.price)}</strong><div className="quantity"><button aria-label="Quitar uno" onClick={() => changeQuantity(product.id, -1)}>−</button><b>{cart[product.id]}</b><button aria-label="Agregar uno" onClick={() => changeQuantity(product.id, 1)}>+</button></div></div></article>)}
              </div>
              <div className="shipping-progress"><div><span>{cartTotal >= 2500 ? '¡Tenés envío gratis!' : `Te faltan ${currency.format(2500 - cartTotal)} para envío gratis`}</span><b>{Math.min(100, cartTotal / 25)}%</b></div><i><em style={{ width: `${Math.min(100, cartTotal / 25)}%` }} /></i></div>
              <div className="cart-total"><span>Subtotal</span><strong>{currency.format(cartTotal)}</strong></div>
              <button className="checkout" onClick={() => setNotice('El checkout se conectará al medio de pago de tu tienda.')}>continuar compra</button>
              <small className="checkout-note">Impuestos incluidos · Checkout de demostración</small>
            </> : <div className="empty-cart"><span>♧</span><h3>Tu bolsa está vacía</h3><p>Descubrí los favoritos de esta semana.</p><button onClick={() => setCartOpen(false)}>seguir comprando</button></div>}
          </aside>
        </div>
      )}
    </main>
  );
}
