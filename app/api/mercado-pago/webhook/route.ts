import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getMercadoPagoOrder } from '@/lib/mercado-pago';

export const runtime = 'nodejs';

function validSignature(request: Request, dataId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signature = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id');
  if (!secret || !signature || !requestId || !dataId) return false;

  const parts = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=', 2)));
  const timestamp = parts.ts;
  const receivedHash = parts.v1;
  if (!timestamp || !receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = createHmac('sha256', secret).update(manifest).digest('hex');
  return timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(receivedHash, 'hex'));
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({})) as { data?: { id?: string }; type?: string };
  const dataId = url.searchParams.get('data.id') || body.data?.id || '';

  if (!validSignature(request, dataId)) {
    return NextResponse.json({ received: false }, { status: 401 });
  }

  try {
    // Consultar la order evita confiar en el contenido del webhook para tomar decisiones comerciales.
    await getMercadoPagoOrder(dataId);
    return NextResponse.json({ received: true });
  } catch {
    // Una firma válida debe recibir 200 para evitar reintentos infinitos; la order puede consultarse luego.
    return NextResponse.json({ received: true });
  }
}
