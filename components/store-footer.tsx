import { CatalogUpdateStatus } from '@/components/catalog-update-status';

export function StoreFooter() {
  return <footer>
    <a className="wordmark footer-logo" href="/"><img src="/LOG%20OK%20blanco.svg" alt="Boutique del Este" /></a>
    <div><strong>comprá</strong><a href="/#productos">Promociones</a><a href="/categoria/perfumeria">Perfumería</a><a href="/categoria/cuerpo-y-bano">Cuidado personal</a><a href="/categoria/regalos">Regalos</a></div>
    <div><strong>ayuda</strong><a href="/terminos-y-condiciones">Términos y Condiciones</a><a href="/politica-de-privacidad">Política de Privacidad</a><a href="/cambios-y-devoluciones">Cambios y Devoluciones</a><a href="/envios-y-entregas">Envíos y Entregas</a></div>
    <div><strong>boutique del este</strong><a href="/#inicio">Nuestra selección</a><a href="/#productos">Marcas y productos</a><a href="https://wa.me/59892143420">Asesoramiento</a><a href="/#inicio">Cómo comprar</a></div>
    <div className="country"><span>Uruguay · UYU</span><small>Maldonado y Punta del Este: entrega en hasta 48 h · Interior: despachamos en hasta 48 h por UES o Correo Uruguayo</small></div>
    <p className="legal"><a href="/terminos-y-condiciones">Términos y Condiciones</a><span> · </span><a href="/politica-de-privacidad">Política de Privacidad</a><span> · </span><a href="/cambios-y-devoluciones">Cambios y Devoluciones</a><span> · </span><a href="/envios-y-entregas">Envíos y Entregas</a></p>
    <CatalogUpdateStatus />
  </footer>;
}
