import { NextResponse } from 'next/server';
import { createMercadoPagoOrder, MercadoPagoError, type CheckoutItemInput } from '@/lib/mercado-pago';

export const runtime = 'nodejs';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { payerEmail?: string; items?: CheckoutItemInput[] };
    const payerEmail = body.payerEmail?.trim().toLowerCase() || '';
    if (!emailPattern.test(payerEmail) || payerEmail.length > 150) {
      return NextResponse.json({ message: 'Ingresá un correo válido para continuar.' }, { status: 400 });
    }

    const order = await createMercadoPagoOrder(body.items || [], payerEmail);
    return NextResponse.json({ checkoutUrl: order.checkout_url, orderId: order.id });
  } catch (error) {
    const status = error instanceof MercadoPagoError ? error.status : 500;
    const message = error instanceof MercadoPagoError ? error.message : 'No pudimos iniciar el pago. Intentá nuevamente.';
    return NextResponse.json({ message }, { status });
  }
}
