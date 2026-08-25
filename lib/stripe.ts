import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Returns a singleton instance of the Stripe client configured with the
 * secret key from the environment.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_for_build";
    stripeInstance = new Stripe(key, {
      typescript: true,
    });
  }
  return stripeInstance;
}
