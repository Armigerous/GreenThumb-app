import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userEmail } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create customer
    let customer: Stripe.Customer;
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
    }

    // Create ephemeral key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2023-10-16' }
    );

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: 'off_session',
      metadata: { userId },
    });

    res.json({
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    console.error('Error creating subscription setup:', error);
    res.status(500).json({ error: 'Failed to create subscription setup' });
  }
} 