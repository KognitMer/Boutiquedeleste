export const MERCADO_PAGO_SURCHARGE_PERCENT = 6;
export const MERCADO_PAGO_SURCHARGE_RATE = MERCADO_PAGO_SURCHARGE_PERCENT / 100;

export function mercadoPagoSurcharge(subtotal: number) {
  return Math.round(subtotal * MERCADO_PAGO_SURCHARGE_RATE * 100) / 100;
}
