// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId } = req.body;

    // Crear o recuperar el cliente en Stripe
    // Idealmente, deberías buscar si el usuario ya tiene un customerId en tu BD
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId, // Importante para webhook
      },
      // Para prueba gratis, añade trial_period_days
      // trial_period_days: 14,
      subscription_data: {
        trial_period_days: 14, // 14 días gratis
        metadata: {
          userId: userId,
        },
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}