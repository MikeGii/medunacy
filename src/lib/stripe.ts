import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil', // Updated to latest version
  typescript: true,
});

// Get Stripe client for frontend
export const getStripe = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
  }
  
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};