import { CatalogUpdateStatus } from '@/components/catalog-update-status';

export function StoreFooter() {
  return <footer>
    <a className="wordmark footer-logo" href="/">boutique<small>del este</small></a>
    <div><strong>comprá</strong><a href="/#productos">Promociones</a><a href="/categoria/perfumeria">Perfumería</a><a href="/categoria/cuerpo-y-bano">Cuidado personal</a><a href="/categoria/regalos">Regalos</a></div>
    <div><strong>ayuda</strong><a href="/#inicio">Preguntas frecuentes</a><a href="/#inicio">Envíos y entregas</a><a href="/#inicio">Cambios y devoluciones</a><a href="/#inicio">Contacto</a></div>
    <div><strong>boutique del este</strong><a href="/#inicio">Nuestra selección</a><a href="/#productos">Marcas y productos</a><a href="https://wa.me/59892143420">Asesoramiento</a><a href="/#inicio">Cómo comprar</a></div>
    <div className="country"><span>Uruguay · UYU</span><small>Envíos en hasta 48 h en Maldonado y Punta del Este</small></div>
    <p className="legal">Boutique del Este es una tienda independiente y no es el sitio oficial de Natura ni de Avon. Las marcas y líneas publicadas pertenecen a sus respectivos titulares. Disponibilidad sujeta a confirmación.</p>
    <CatalogUpdateStatus />
  </footer>;
}
