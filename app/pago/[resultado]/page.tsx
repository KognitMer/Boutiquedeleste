import { ClearPaidCart } from '@/components/clear-paid-cart';
import { getMercadoPagoPayment } from '@/lib/mercado-pago';
import Link from 'next/link';

type PaymentPageProps = {
  params: Promise<{ resultado: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ResultType = 'aprobado' | 'pendiente' | 'rechazado' | 'desconocido';

const resultContent: Record<ResultType, { icon: string; eyebrow: string; title: string; description: string }> = {
  aprobado: {
    icon: '✓',
    eyebrow: 'pago confirmado',
    title: '¡Gracias por tu compra!',
    description: 'Mercado Pago confirmó y acreditó el pago. Nos comunicaremos para coordinar la entrega.',
  },
  pendiente: {
    icon: '…',
    eyebrow: 'pago pendiente',
    title: 'Estamos esperando la confirmación',
    description: 'Mercado Pago todavía está procesando el pago. No vuelvas a pagar; te avisaremos cuando se confirme.',
  },
  rechazado: {
    icon: '×',
    eyebrow: 'pago no completado',
    title: 'No pudimos completar el pago',
    description: 'La operación fue rechazada o cancelada. Podés regresar a la tienda e intentar con otro medio de pago.',
  },
  desconocido: {
    icon: '?',
    eyebrow: 'verificación pendiente',
    title: 'No pudimos verificar el resultado',
    description: 'Tu pedido no se marcará como pagado hasta recibir la confirmación segura de Mercado Pago.',
  },
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function verifiedResult(status?: string, detail?: string): ResultType {
  if (status === 'approved' && detail === 'accredited') return 'aprobado';
  if (status === 'rejected' || status === 'cancelled' || status === 'refunded') return 'rechazado';
  if (status === 'pending' || status === 'in_process' || status === 'authorized') return 'pendiente';
  return 'desconocido';
}

export default async function PaymentResultPage({ params, searchParams }: PaymentPageProps) {
  const routeResult = (await params).resultado;
  const query = await searchParams;
  const paymentId = first(query.payment_id) || first(query.collection_id);
  let result: ResultType = 'desconocido';
  let reference = first(query.external_reference) || '';
  let amount = '';

  if (paymentId) {
    try {
      const payment = await getMercadoPagoPayment(paymentId);
      result = verifiedResult(payment.status, payment.status_detail);
      reference = payment.external_reference || reference;
      amount = payment.transaction_amount ? String(payment.transaction_amount) : '';
    } catch {
      result = 'desconocido';
    }
  }

  // La ruta solo se usa como orientación visual; el estado real proviene de la API autenticada.
  if (!paymentId && ['aprobado', 'pendiente', 'rechazado'].includes(routeResult)) result = 'desconocido';

  const content = resultContent[result];
  const message = `Hola, consulto por mi pago de Boutique del Este${reference ? `, referencia ${reference}` : ''}${paymentId ? `, pago ${paymentId}` : ''}.`;
  const whatsappUrl = `https://wa.me/59892143420?text=${encodeURIComponent(message)}`;

  return (
    <main className={`payment-result payment-result-${result}`}>
      {result === 'aprobado' && <ClearPaidCart />}
      <Link className="payment-wordmark" href="/" aria-label="Volver a Boutique del Este">boutique<small>del este</small></Link>
      <section className="payment-result-card">
        <span className="payment-result-icon" aria-hidden="true">{content.icon}</span>
        <p>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <div>{content.description}</div>
        {(reference || paymentId || amount) && <dl>
          {reference && <><dt>Referencia</dt><dd>{reference}</dd></>}
          {paymentId && <><dt>Pago Mercado Pago</dt><dd>{paymentId}</dd></>}
          {amount && <><dt>Total</dt><dd>$ {Number(amount).toLocaleString('es-UY')} UYU</dd></>}
        </dl>}
        <div className="payment-result-actions">
          <Link href="/">volver a la tienda</Link>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">consultar por WhatsApp</a>
        </div>
        <small>No coordinaremos la entrega basándonos únicamente en esta pantalla: verificamos cada pago directamente con Mercado Pago.</small>
      </section>
    </main>
  );
}
