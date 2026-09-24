import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

const MOCK_KEY = "sk_test_mock_key_for_build";

/**
 * True only when a real Stripe secret key is configured. False when the key
 * is absent or the placeholder used so `next build` can construct a client
 * without live credentials.
 */
export function hasRealStripeKey(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key) && !key!.startsWith("sk_test_mock");
}

/**
 * Returns a singleton instance of the Stripe client configured with the
 * secret key from the environment.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY || MOCK_KEY;
    stripeInstance = new Stripe(key, {
      typescript: true,
    });
  }
  return stripeInstance;
}
