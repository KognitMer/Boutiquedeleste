'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { currency, products, type Product } from '@/lib/catalog';
import { CheckoutActions } from '@/components/checkout-actions';
import { ProductImage } from '@/components/product-image';

type StoreContextValue = {
  cart: Record<number, number>;
  favorites: number[];
  cartCount: number;
  addToCart: (product: Product) => void;
  changeQuantity: (id: number, amount: number) => void;
  toggleFavorite: (id: number) => void;
  openCart: () => void;
  showNotice: (message: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem('natura-uy-cart') || '{}'));
      setFavorites(JSON.parse(localStorage.getItem('natura-uy-favorites') || '[]'));
    } catch {
      setCart({});
      setFavorites([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem('natura-uy-cart', JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem('natura-uy-favorites', JSON.stringify(favorites));
  }, [favorites, hydrated]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  }

  function addToCart(product: Product) {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
    showNotice(`${product.brand} se agregó a tu bolsa`);
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + amount);
      const updated = { ...current, [id]: next };
      if (!next) delete updated[id];
      return updated;
    });
  }

  function toggleFavorite(id: number) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  const cartItems = products.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  const whatsappLines = cartItems.map((product) => `${cart[product.id]} × ${product.brand} ${product.name} — ${currency.format(product.price * cart[product.id])}`);
  const whatsappMessage = `Hola, quiero realizar este pedido de Natura Uruguay:\n\n${whatsappLines.join('\n')}\n\nTotal: ${currency.format(cartTotal)}\n\n¿Podrían confirmarme disponibilidad y entrega?`;
  const whatsappUrl = `https://wa.me/59892143420?text=${encodeURIComponent(whatsappMessage)}`;
  const value = useMemo(() => ({ cart, favorites, cartCount, addToCart, changeQuantity, toggleFavorite, openCart: () => setCartOpen(true), showNotice }), [cart, favorites, cartCount]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      {notice && <div className="toast" role="status">✓ {notice}</div>}
      {cartOpen && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="drawer-head"><div><span>tu compra</span><h2 id="cart-title">Mi bolsa ({cartCount})</h2></div><button aria-label="Cerrar bolsa" onClick={() => setCartOpen(false)}>×</button></div>
            {cartItems.length ? <>
              <div className="cart-list">
                {cartItems.map((product) => <article key={product.id}><ProductImage src={product.image} alt="" /><div><span>{product.brand}</span><h3>{product.name}</h3><strong>{currency.format(product.price)}</strong><div className="quantity"><button aria-label="Quitar uno" onClick={() => changeQuantity(product.id, -1)}>−</button><b>{cart[product.id]}</b><button aria-label="Agregar uno" onClick={() => changeQuantity(product.id, 1)}>+</button></div></div></article>)}
              </div>
              <div className="shipping-progress"><div><span>{cartTotal >= 2500 ? '¡Tenés envío gratis!' : `Te faltan ${currency.format(2500 - cartTotal)} para envío gratis`}</span><b>{Math.min(100, Math.round(cartTotal / 25))}%</b></div><i><em style={{ width: `${Math.min(100, cartTotal / 25)}%` }} /></i></div>
              <div className="cart-total"><span>Subtotal</span><strong>{currency.format(cartTotal)}</strong></div>
              <CheckoutActions cart={cart} subtotal={cartTotal} whatsappUrl={whatsappUrl} />
            </> : <div className="empty-cart"><span>♧</span><h3>Tu bolsa está vacía</h3><p>Descubrí los favoritos de esta semana.</p><button onClick={() => setCartOpen(false)}>seguir comprando</button></div>}
          </aside>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore debe usarse dentro de StoreProvider');
  return value;
}
