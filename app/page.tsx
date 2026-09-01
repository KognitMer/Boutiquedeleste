'use client';

import { FormEvent, useMemo, useState } from 'react';
import { products as catalogProducts } from './catalog-data';

type Product = {
  id: number;
  brand: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
  tag?: string;
  description: string;
  details: string[];
};

const categories = [
  { name: 'Perfumería', icon: '✦', tone: 'peach' },
  { name: 'Cuerpo y baño', icon: '◌', tone: 'rose' },
  { name: 'Rostro', icon: '☼', tone: 'sand' },
  { name: 'Cabello', icon: '〰', tone: 'green' },
  { name: 'Maquillaje', icon: '◐', tone: 'berry' },
  { name: 'Infantil', icon: '⌑', tone: 'orange' },
  { name: 'Hogar', icon: '⌂', tone: 'green' },
  { name: 'Regalos', icon: '◇', tone: 'peach' },
];

const seedProducts: Product[] = [
  {
    id: 1,
    brand: 'Kaiak',
    name: 'Desodorante colonia Kaiak 21K masculino 100 ml',
    category: 'Perfumería',
    price: 1349,
    oldPrice: 1899,
    discount: 29,
    tag: 'lanzamiento',
    image: '/catalog/kaiak-21k.webp',
    description: 'Frescor aromático con notas amaderadas y un toque vibrante de jengibre.',
    details: ['Fragancia masculina de 100 ml', 'Frescor prolongado', 'Producto del catálogo Ciclo 14'],
  },
  {
    id: 2,
    brand: 'Tododia',
    name: 'Body splash Frambuesa y Pimienta Rosa 200 ml',
    category: 'Perfumería',
    price: 969,
    tag: 'más vendido',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw764b0c3e/18237_1.jpg',
    description: 'Fragancia frutal y especiada, liviana para reaplicar durante el día.',
    details: ['Body splash de 200 ml', 'Ideal para uso diario', 'Válvula spray'],
  },
  {
    id: 3,
    brand: 'Ekos',
    name: 'Crema hidratante corporal Castaña 400 ml',
    category: 'Cuidados corporales',
    price: 899,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwce8320c7/ProdutoJoia/desktop/80936.jpg',
    description: 'Nutrición intensa con el bioactivo de castaña para una piel suave y confortable.',
    details: ['Hidratante corporal de 400 ml', 'Nutre la piel', 'Fórmula vegana'],
  },
  {
    id: 4,
    brand: 'Chronos Derma',
    name: 'Multiprotector aclarador FPS 70 / FPUVA 50 ml',
    category: 'Rostro',
    price: 1250,
    tag: 'protección diaria',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw4df526ef/ProdutoJoia/desktop/80059.jpg',
    description: 'Alta protección solar facial que ayuda a prevenir y aclarar manchas solares.',
    details: ['Protección facial de 50 ml', 'FPS 70 y FPUVA', 'Uso diario'],
  },
  {
    id: 5,
    brand: 'Homem',
    name: 'Deo parfum Homem Essence 100 ml',
    category: 'Perfumería',
    price: 2449,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw1e53262d/ProdutoJoia/desktop/59848.jpg',
    description: 'Fragancia amaderada, ambarada y especiada de intensidad alta.',
    details: ['Deo parfum masculino de 100 ml', 'Notas amaderadas y especiadas', 'Ideal para ocasiones especiales'],
  },
  {
    id: 6,
    brand: 'Kaiak',
    name: 'Desodorante colonia Kaiak Urbe masculino 100 ml',
    category: 'Perfumería',
    price: 1899,
    tag: 'favorito',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw3b022f77/ProdutoJoia/desktop/111172.jpg',
    description: 'Fragancia aromática especiada para quienes prefieren un frescor urbano.',
    details: ['Fragancia masculina de 100 ml', 'Perfil aromático especiado', 'Uso diario'],
  },
  {
    id: 7,
    brand: 'Homem',
    name: 'Deo parfum Homem Cor.Agio 100 ml',
    category: 'Perfumería',
    price: 2299,
    oldPrice: 3299,
    discount: 30,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwe26eb8ef/ProdutoJoia/desktop/186.jpg',
    description: 'Notas amaderadas intensas, especias frías, copaíba y cumarú.',
    details: ['Deo parfum masculino de 100 ml', 'Alta intensidad', 'Fragancia vegana'],
  },
  {
    id: 8,
    brand: 'Kriska',
    name: 'Desodorante colonia Kriska Shock femenino 100 ml',
    category: 'Perfumería',
    price: 1699,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw6ac8b0d7/ProdutoJoia/desktop/83323.jpg',
    description: 'Fragancia femenina dulce de intensidad moderada.',
    details: ['Desodorante colonia de 100 ml', 'Perfil dulce', 'Intensidad moderada'],
  },
  {
    id: 9,
    brand: 'Homem',
    name: 'Deo parfum Homem Tato 100 ml',
    category: 'Perfumería',
    price: 2449,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw25d5f3be/ProdutoJoia/desktop/109164.jpg',
    description: 'Amaderado especiado y ambarado con una firma intensa y envolvente.',
    details: ['Deo parfum masculino de 100 ml', 'Notas de pimienta, cardamomo y sándalo', 'Producto vegano'],
  },
  {
    id: 10,
    brand: 'Ilía',
    name: 'Deo parfum Ilía Secreto femenino 50 ml',
    category: 'Perfumería',
    price: 1999,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwa88cdd3f/ProdutoJoia/desktop/83322.jpg',
    description: 'Fragancia floral intensa, envolvente y femenina.',
    details: ['Deo parfum femenino de 50 ml', 'Perfil floral intenso', 'Perfume de larga duración'],
  },
  {
    id: 11,
    brand: 'Luna',
    name: 'Deo parfum Luna Intensa femenino 50 ml',
    category: 'Perfumería',
    price: 2199,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw3ffdaee1/ProdutoJoia/desktop/90927.jpg',
    description: 'Chipre amaderado intenso con una presencia cálida y envolvente.',
    details: ['Deo parfum femenino de 50 ml', 'Alta intensidad', 'Ideal para la noche'],
  },
  {
    id: 12,
    brand: 'Chronos Derma',
    name: 'Sérum intensivo multiaclarador 30 ml',
    category: 'Rostro',
    price: 2050,
    tag: 'tratamiento',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw80321cf0/ProdutoJoia/desktop/169222.jpg',
    description: 'Tratamiento que ayuda a uniformar el tono y reducir distintos tipos de manchas.',
    details: ['Sérum facial de 30 ml', 'Para todos los tipos y tonos de piel', 'Uso de mañana y noche'],
  },
  {
    id: 13,
    brand: 'Chronos Derma',
    name: 'Hidratante Acqua renovador 40 g',
    category: 'Rostro',
    price: 1790,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw96a34088/ProdutoJoia/desktop/91849.jpg',
    description: 'Hidratación intensa de textura ligera y rápida absorción.',
    details: ['Hidratante facial de 40 g', 'Hasta 24 horas de hidratación', 'Para todo tipo de piel'],
  },
  {
    id: 14,
    brand: 'Lumina',
    name: 'Shampoo nutrición y reparación profunda 300 ml',
    category: 'Cabello',
    price: 539,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwc1cefd1d/ProdutoJoia/desktop/147411.jpg',
    description: 'Limpieza nutritiva para cabello seco o reseco.',
    details: ['Shampoo de 300 ml', 'Nutrición y reparación profunda', 'Fórmula vegana'],
  },
  {
    id: 15,
    brand: 'Una',
    name: 'Máscara alargamiento infinito a prueba de agua 8 ml',
    category: 'Maquillaje',
    price: 899,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw1bbb2c18/ProdutoJoia/desktop/106122.jpg',
    description: 'Fórmula ultraligera resistente al agua que alarga sin formar grumos.',
    details: ['Máscara de pestañas de 8 ml', 'A prueba de agua', 'Apta para lentes de contacto'],
  },
  {
    id: 16,
    brand: 'Mamá y Bebé',
    name: 'Agua de colonia sin alcohol 100 ml',
    category: 'Infantil',
    price: 1069,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw546f90e6/ProdutoJoia/desktop/92786.jpg',
    description: 'Fragancia suave y delicada, sin alcohol, pensada para la piel sensible del bebé.',
    details: ['Colonia infantil de 100 ml', 'Sin alcohol', 'Fórmula hipoalergénica'],
  },
  {
    id: 17,
    brand: 'Mamá y Bebé',
    name: 'Jabón líquido de la cabeza a los pies 200 ml',
    category: 'Infantil',
    price: 529,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw95e4933e/ProdutoJoia/desktop/92800.jpg',
    description: 'Limpieza suave para cabello y cuerpo desde el primer baño.',
    details: ['Jabón líquido de 200 ml', 'No irrita los ojos', '98% de ingredientes naturales'],
  },
  {
    id: 18,
    brand: 'Tododia',
    name: 'Body splash Cereza y Avellana 200 ml',
    category: 'Perfumería',
    price: 969,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwbdc8baeb/95841_1.jpg',
    description: 'Fragancia dulce y confortable para perfumarte todos los días.',
    details: ['Body splash de 200 ml', 'Uso diario', 'Válvula spray'],
  },
  {
    id: 19,
    brand: 'Tododia',
    name: 'Manteca corporal Cereza y Avellana 200 ml',
    category: 'Cuidados corporales',
    price: 849,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw93b8856b/174612_1.jpg',
    description: 'Textura cremosa que nutre y perfuma la piel.',
    details: ['Hidratante corporal de 200 ml', 'Nutrición intensa', 'Para todo tipo de piel'],
  },
  {
    id: 20,
    brand: 'Tododia',
    name: 'Body splash Mora Roja y Jabuticaba 200 ml',
    category: 'Perfumería',
    price: 969,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwb5625293/ProdutoJoia/desktop/88075.jpg',
    description: 'Fragancia frutal, vibrante y liviana para acompañarte durante el día.',
    details: ['Body splash de 200 ml', 'Perfil frutal', 'Válvula spray'],
  },
  {
    id: 21,
    brand: 'Tododia',
    name: 'Body splash Ciruela y Flor de Vainilla 200 ml',
    category: 'Perfumería',
    price: 675,
    oldPrice: 969,
    discount: 30,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw60647b82/ProdutoJoia/desktop/100679.jpg',
    description: 'Una combinación frutal y floral con fondo suavemente dulce.',
    details: ['Body splash de 200 ml', 'Edición de últimos ciclos', 'Válvula spray'],
  },
  {
    id: 22,
    brand: 'Ekos',
    name: 'Crema hidratante corporal Cupuaçu 400 ml',
    category: 'Cuidados corporales',
    price: 899,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw675f4b62/ProdutoJoia/desktop/203478.jpg',
    description: 'Hidratación reafirmante con cupuaçu para mejorar la firmeza y elasticidad.',
    details: ['Hidratante corporal de 400 ml', 'Toque seco y rápida absorción', 'Hasta 72 horas de hidratación'],
  },
  {
    id: 23,
    brand: 'Ekos',
    name: 'Repuesto crema hidratante corporal Cupuaçu 400 ml',
    category: 'Cuidados corporales',
    price: 699,
    tag: 'repuesto',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw26c84d4e/ProdutoJoia/desktop/205946.jpg',
    description: 'La misma hidratación reafirmante en una opción más económica y con menos envase.',
    details: ['Repuesto de 400 ml', 'Hasta 72 horas de hidratación', 'Opción más sustentable'],
  },
  {
    id: 24,
    brand: 'Ekos',
    name: 'Frescor Cupuaçu eau de toilette 150 ml',
    category: 'Perfumería',
    price: 1299,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwa20d6341/ProdutoJoia/desktop/199394.jpg',
    description: 'Fragancia fresca inspirada en el aroma cremoso y envolvente del cupuaçu.',
    details: ['Eau de toilette de 150 ml', 'Fragancia ligera y refrescante', 'Línea Ekos'],
  },
];

const products = catalogProducts;
const PAGE_SIZE = 24;

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const text = query.trim().toLocaleLowerCase('es');
    return products.filter((product) => {
      const categoryMatch = selectedCategory === 'Todos' || product.category === selectedCategory;
      const textMatch = !text || `${product.brand} ${product.name} ${product.category}`.toLocaleLowerCase('es').includes(text);
      return categoryMatch && textMatch;
    });
  }, [query, selectedCategory]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    setPage(1);
    setMenuOpen(false);
    window.setTimeout(() => document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' }), 20);
  }

  async function copyOrder() {
    const lines = cartItems.map((product) => `${cart[product.id]} × ${product.brand} ${product.name} — ${currency.format(product.price * cart[product.id])}`);
    const order = `Pedido Natura Uruguay\n${lines.join('\n')}\nTotal: ${currency.format(cartTotal)}`;
    await navigator.clipboard.writeText(order);
    setNotice('Pedido copiado. Ya podés enviarlo por mensaje.');
    window.setTimeout(() => setNotice(''), 3000);
  }

  return (
    <main>
      <div className="top-strip">
        <span>Entrega en 24 h en Maldonado y Punta del Este</span>
        <span>Precios en pesos uruguayos</span>
        <span>Stock sujeto a confirmación</span>
      </div>

      <header className="site-header">
        <button className="mobile-menu" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <a className="wordmark" href="#inicio" aria-label="Natura Uruguay, inicio">natura<small>uruguay</small></a>
        <form className="search" onSubmit={submitSearch} role="search">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="¿qué estás buscando hoy?" aria-label="Buscar productos" />
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
        {['Todos', ...categories.map((category) => category.name)].map((item) => (
          <button key={item} onClick={() => chooseCategory(item)}>{item.toLocaleLowerCase('es')}</button>
        ))}
      </nav>

      <section id="inicio" className="hero catalog-hero" aria-label="Catálogo actual Natura">
        <img src="/catalog/kaiak-21k.webp" alt="Natura Kaiak 21K, lanzamiento del catálogo Ciclo 14" />
        <div className="hero-scrim" />
        <div className="hero-copy">
          <p>catálogo natura · ciclo 14</p>
          <h1>Tus favoritos Natura,<br /><em>ahora más cerca.</em></h1>
          <span>Entrega en 24 horas en Maldonado y Punta del Este</span>
          <button onClick={() => document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' })}>ver catálogo</button>
        </div>
        <div className="hero-dots" aria-hidden="true"><i className="active" /><i /><i /></div>
      </section>

      <section className="benefits" aria-label="Beneficios de compra">
        <article><Icon>◇</Icon><div><strong>Entrega en 24 horas</strong><span>Maldonado y Punta del Este</span></div></article>
        <article><Icon>◎</Icon><div><strong>Precios claros</strong><span>expresados en pesos uruguayos</span></div></article>
        <article><Icon>♲</Icon><div><strong>Opciones conscientes</strong><span>fórmulas veganas y repuestos</span></div></article>
        <article><Icon>⌂</Icon><div><strong>Atención cercana</strong><span>confirmamos disponibilidad al pedir</span></div></article>
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
          <div><p>{filtered.length} productos</p><h2>{query ? `Resultados para “${query}”` : selectedCategory === 'Todos' ? 'Catálogo completo' : selectedCategory}</h2></div>
          <div className="filter-pills" aria-label="Filtrar productos">
            {['Todos', ...categories.map((category) => category.name)].map((category) => <button key={category} className={selectedCategory === category ? 'active' : ''} onClick={() => { setSelectedCategory(category); setPage(1); }}>{category}</button>)}
          </div>
        </div>

        {filtered.length ? (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  {product.tag && <span className="product-tag">{product.tag}</span>}
                  {!!product.discount && <span className="discount">-{product.discount}%</span>}
                  <button className={`heart ${favorites.includes(product.id) ? 'saved' : ''}`} aria-label={favorites.includes(product.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'} onClick={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])}>{favorites.includes(product.id) ? '♥' : '♡'}</button>
                  <img src={product.image} alt={product.name} loading="lazy" onError={(event) => {
                    const image = event.currentTarget;
                    if (!image.dataset.fallback) {
                      image.dataset.fallback = 'product';
                      image.src = `https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/Produtos/NATBRA-${product.sku}_1.jpg`;
                    } else if (image.dataset.fallback !== 'local') {
                      image.dataset.fallback = 'local';
                      image.src = '/catalog/producto-natura.svg';
                    }
                  }} />
                </div>
                <div className="product-info">
                  <span className="product-brand">{product.brand}</span>
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="price">{product.oldPrice && <del>{currency.format(product.oldPrice)}</del>}<strong>{currency.format(product.price)}</strong></div>
                  <button className="details-button" onClick={() => setSelectedProduct(product)}>ver detalles</button>
                  <button className="add-button" onClick={() => addToCart(product)}>agregar a mi bolsa</button>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="empty-state"><span>⌕</span><h3>No encontramos productos</h3><p>Probá con otra búsqueda o mirá todas las categorías.</p><button onClick={() => { setQuery(''); setSelectedCategory('Todos'); }}>ver todos</button></div>}
        {filtered.length > PAGE_SIZE && <nav className="catalog-pagination" aria-label="Páginas del catálogo">
          <button disabled={page === 1} onClick={() => { setPage((current) => Math.max(1, current - 1)); document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' }); }}>← anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => { setPage((current) => Math.min(totalPages, current + 1)); document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' }); }}>siguiente →</button>
        </nav>}
        <p className="demo-prices">Precios en pesos uruguayos. Stock y precio final sujetos a confirmación.</p>
      </section>

      <section className="story-banner section-shell">
        <div className="story-art"><span>amazonia viva</span><b>Ekos</b></div>
        <div className="story-copy"><p>belleza que regenera</p><h2>Cuando cuidás de vos,<br />también cuidás del mundo.</h2><span>Fórmulas veganas, activos de la biodiversidad y envases con menos plástico.</span><a href="https://www.naturacosmeticos.com.ar/c/ekos?srsltid=AfmBOoqWVTNWvndSiRLWwEwkMnZPBQg_g2kwPDRD4tJdeEUHBmOfU09T" target="_blank" rel="noreferrer">conocer ekos</a></div>
      </section>

      <section className="newsletter service-callout">
        <div><p>compra simple</p><h2>Armá tu bolsa y copiá el pedido</h2><span>Confirmamos disponibilidad y coordinamos la entrega en Maldonado o Punta del Este.</span></div>
        <button onClick={() => setCartOpen(true)}>ver mi bolsa ({cartCount})</button>
      </section>

      <footer>
        <a className="wordmark footer-logo" href="#inicio">natura<small>uruguay</small></a>
        <div><strong>comprá</strong><a href="#productos">Promociones</a><a href="#productos">Perfumería</a><a href="#productos">Cuidado personal</a><a href="#productos">Regalos</a></div>
        <div><strong>ayuda</strong><a href="#inicio">Preguntas frecuentes</a><a href="#inicio">Envíos y entregas</a><a href="#inicio">Cambios y devoluciones</a><a href="#inicio">Contacto</a></div>
        <div><strong>natura uruguay</strong><a href="#inicio">Sobre Natura</a><a href="#inicio">Sustentabilidad</a><a href="#inicio">Quiero vender</a><a href="#inicio">Encontrá una consultora</a></div>
        <div className="country"><span>Uruguay · UYU</span><small>Maldonado y Punta del Este</small></div>
        <p className="legal">Tienda independiente. Natura y sus líneas de producto son marcas de sus respectivos titulares. Disponibilidad sujeta a confirmación.</p>
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
              <div className="cart-total"><span>Subtotal</span><strong>{currency.format(cartTotal)}</strong></div>
              <button className="checkout" onClick={copyOrder}>copiar pedido</button>
              <small className="checkout-note">La disponibilidad y la entrega se confirman al recibir tu consulta.</small>
            </> : <div className="empty-cart"><span>♧</span><h3>Tu bolsa está vacía</h3><p>Descubrí los favoritos de esta semana.</p><button onClick={() => setCartOpen(false)}>seguir comprando</button></div>}
          </aside>
        </div>
      )}

      {selectedProduct && (
        <div className="drawer-layer product-modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
          <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
            <button className="modal-close" aria-label="Cerrar detalle" onClick={() => setSelectedProduct(null)}>×</button>
            <div className="modal-image"><img src={selectedProduct.image} alt={selectedProduct.name} /></div>
            <div className="modal-copy">
              <span>{selectedProduct.brand}</span>
              <h2 id="product-detail-title">{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <ul>{selectedProduct.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
              <div className="modal-price">{selectedProduct.oldPrice && <del>{currency.format(selectedProduct.oldPrice)}</del>}<strong>{currency.format(selectedProduct.price)}</strong></div>
              <small>Precio en pesos uruguayos · Stock sujeto a confirmación</small>
              <button className="checkout" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>agregar a mi bolsa</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
