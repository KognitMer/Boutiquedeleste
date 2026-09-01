'use client';

import { currency, type Product } from '@/lib/catalog';
import { useStore } from '@/components/store-provider';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  const saved = favorites.includes(product.id);

  return <article className="product-card">
    <div className="product-image">
      {product.tag && <span className="product-tag">{product.tag}</span>}
      {!!product.discount && <span className="discount">-{product.discount}%</span>}
      <button className={`heart ${saved ? 'saved' : ''}`} aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'} onClick={() => toggleFavorite(product.id)}>{saved ? '♥' : '♡'}</button>
      <a className="product-image-link" href={`/productos/${product.sku}`} aria-label={`Ver ${product.name}`}>
        <img src={product.image} alt={product.name} loading="lazy" onError={(event) => { event.currentTarget.src = '/catalog/producto-natura.svg'; }} />
        <span className="view-product">ver producto</span>
      </a>
    </div>
    <div className="product-info">
      <span className="product-brand">{product.brand}</span>
      <h3><a href={`/productos/${product.sku}`}>{product.name}</a></h3>
      <p className="product-description">{product.description}</p>
      <div className="price">{product.oldPrice && <del>{currency.format(product.oldPrice)}</del>}<strong>{currency.format(product.price)}</strong></div>
      <small className="installments">6 cuotas de {currency.format(Math.ceil(product.price / 6))}</small>
      <button className="add-button" onClick={() => addToCart(product)}>agregar a mi bolsa</button>
    </div>
  </article>;
}
