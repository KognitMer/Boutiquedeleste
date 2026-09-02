'use client';

import { useState } from 'react';
import { mercadoPagoSurcharge } from '@/lib/pricing';

type CheckoutActionsProps = {
  cart: Record<number, number>;
  subtotal: number;
  whatsappUrl: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const currency = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  maximumFractionDigits: 0,
});

export function CheckoutActions({ cart, subtotal, whatsappUrl }: CheckoutActionsProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const surcharge = mercadoPagoSurcharge(subtotal);
  const paymentTotal = subtotal + surcharge;

  async function startPayment() {
    if (!emailPattern.test(email.trim())) {
      setError('Ingresá un correo válido para recibir la confirmación del pago.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mercado-pago/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerEmail: email.trim(),
          items: Object.entries(cart).map(([id, quantity]) => ({
            id: Number(id),
            quantity,
          })),
        }),
      });

      const result = await response.json() as { checkoutUrl?: string; message?: string };
      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.message || 'No pudimos iniciar el pago. Intentá nuevamente.');
      }

      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'No pudimos iniciar el pago.');
      setLoading(false);
    }
  }

  return (
    <div className="checkout-actions">
      <div className="mercado-pago-summary" aria-label="Total pagando con Mercado Pago">
        <span>Recargo Mercado Pago (15%) <b>{currency.format(surcharge)}</b></span>
        <strong>Total con Mercado Pago <b>{currency.format(paymentTotal)}</b></strong>
      </div>
      <label htmlFor="checkout-email">Correo para la confirmación</label>
      <input
        id="checkout-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="tu@email.com"
        aria-describedby="checkout-email-help"
      />
      <small id="checkout-email-help">Mercado Pago lo utiliza para identificar y confirmar la compra.</small>
      <button className="mercado-pago-button" type="button" onClick={startPayment} disabled={loading}>
        {loading ? 'abriendo Mercado Pago…' : `pagar ${currency.format(paymentTotal)} con Mercado Pago`}
      </button>
      <a className="whatsapp-checkout" href={whatsappUrl} target="_blank" rel="noreferrer">
        enviar pedido por WhatsApp
      </a>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      <small className="checkout-note">Pago protegido por Mercado Pago · Tarjetas de crédito y débito</small>
    </div>
  );
}
