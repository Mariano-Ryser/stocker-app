// pages/api/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Desactivar el body parser de Next.js para webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Aquí actualizas tu base de datos
      // 1. Buscar al usuario por session.metadata.userId
      // 2. Actualizar su plan en MongoDB
      // 3. Guardar stripeCustomerId, subscriptionId, etc.
      
      console.log('✅ Pago completado para usuario:', session.metadata.userId);
      break;
      
    case 'customer.subscription.updated':
      // Manejar cambios en la suscripción (upgrade/downgrade)
      break;
      
    case 'customer.subscription.deleted':
      // Manejar cancelaciones
      break;
      
    case 'invoice.payment_succeeded':
      // Pago recurrente exitoso
      break;
      
    case 'invoice.payment_failed':
      // Pago fallido - enviar email al usuario
      break;
  }

  res.status(200).json({ received: true });
}