import { products } from '@/lib/catalog';
import { MERCADO_PAGO_SURCHARGE_PERCENT, mercadoPagoSurcharge } from '@/lib/pricing';

const MERCADO_PAGO_API = 'https://api.mercadopago.com';

export type CheckoutItemInput = {
  id: number;
  quantity: number;
};

type MercadoPagoResource = {
  id: string | number;
  status?: string;
  status_detail?: string;
  init_point?: string;
  sandbox_init_point?: string;
  external_reference?: string;
  transaction_amount?: number;
};

export class MercadoPagoError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

export function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new MercadoPagoError('Mercado Pago todavía no está habilitado. Podés enviar el pedido por WhatsApp.', 503);
  }
  return token;
}

export function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;

  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000';
  throw new MercadoPagoError('Falta configurar la dirección pública de la tienda.', 503);
}

export function buildOrderItems(input: CheckoutItemInput[]) {
  if (!Array.isArray(input) || input.length === 0 || input.length > 50) {
    throw new MercadoPagoError('La bolsa está vacía o contiene demasiados productos.', 400);
  }

  return input.map(({ id, quantity }) => {
    if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new MercadoPagoError('La cantidad de uno de los productos no es válida.', 400);
    }

    const product = products.find((item) => item.id === id);
    if (!product) throw new MercadoPagoError('Uno de los productos ya no está disponible.', 400);

    return {
      title: `${product.brand} ${product.name}`.slice(0, 120),
      unit_price: product.price.toFixed(2),
      quantity,
      unit_measure: 'unit',
      total_amount: (product.price * quantity).toFixed(2),
    };
  });
}

async function mercadoPagoRequest(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set('accept', 'application/json');
  headers.set('Authorization', `Bearer ${getAccessToken()}`);
  if (init?.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${MERCADO_PAGO_API}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null) as (MercadoPagoResource & { message?: string }) | null;
  if (!response.ok || !payload) {
    const message = payload?.message || 'Mercado Pago no pudo procesar la solicitud.';
    throw new MercadoPagoError(message, response.status >= 400 && response.status < 500 ? 400 : 502);
  }
  return payload;
}

export async function createMercadoPagoOrder(itemsInput: CheckoutItemInput[], _payerEmail: string) {
  const productItems = buildOrderItems(itemsInput);
  const subtotal = productItems.reduce((total, item) => total + Number(item.total_amount), 0);
  const surcharge = mercadoPagoSurcharge(subtotal);
  const items = [
    ...productItems,
    {
      title: `Recargo por pago con Mercado Pago (${MERCADO_PAGO_SURCHARGE_PERCENT}%)`,
      unit_price: surcharge.toFixed(2),
      quantity: 1,
      unit_measure: 'unit',
      total_amount: surcharge.toFixed(2),
    },
  ];
  const totalAmount = (subtotal + surcharge).toFixed(2);
  const siteUrl = getSiteUrl();
  const externalReference = `BDE-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  const preference = await mercadoPagoRequest('/checkout/preferences', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({
      external_reference: externalReference,
      items: items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        currency_id: 'UYU',
      })),
      back_urls: {
        success: `${siteUrl}/pago/aprobado`,
        failure: `${siteUrl}/pago/rechazado`,
        pending: `${siteUrl}/pago/pendiente`,
      },
      auto_return: 'approved',
      notification_url: `${siteUrl}/api/mercado-pago/webhook`,
      statement_descriptor: 'BOUTIQUE DEL ESTE',
    }),
  });

  const checkoutUrl = preference.init_point;
  if (!checkoutUrl) throw new MercadoPagoError('Mercado Pago no devolvió un enlace de pago.', 502);
  return { ...preference, checkout_url: checkoutUrl, total_amount: totalAmount };
}

export async function getMercadoPagoPayment(paymentId: string) {
  if (!/^\d+$/.test(paymentId)) throw new MercadoPagoError('Identificador de pago inválido.', 400);
  return mercadoPagoRequest(`/v1/payments/${encodeURIComponent(paymentId)}`);
}
