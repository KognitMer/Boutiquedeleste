export const MERCADO_PAGO_SURCHARGE_RATE = 0.15;

export function mercadoPagoSurcharge(subtotal: number) {
  return Math.round(subtotal * MERCADO_PAGO_SURCHARGE_RATE * 100) / 100;
}
