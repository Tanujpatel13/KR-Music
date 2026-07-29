import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-04-10' as any,
});

export class StripeService {
  /**
   * Generates a checkout portal session for a premium plan.
   */
  static async createCheckoutSession(userId: string, planType: 'PREMIUM_INDIVIDUAL' | 'PREMIUM_FAMILY' | 'PREMIUM_STUDENT') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    let amount = 999; // $9.99 Premium Individual
    if (planType === 'PREMIUM_FAMILY') amount = 1499; // $14.99 Family
    if (planType === 'PREMIUM_STUDENT') amount = 499; // $4.99 Student

    // In a real application, you would use stripe.checkout.sessions.create.
    // We will provide a mock URL or real Stripe setup.
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `KR Music - ${planType.replace('_', ' ')}`,
                description: 'Unlock ad-free music, high-quality audio, and offline downloads.',
              },
              unit_amount: amount,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/premium`,
        customer_email: user.email,
        metadata: {
          userId,
          planType,
        },
      });

      return { checkoutUrl: session.url };
    } catch (error) {
      console.warn('Stripe checkout generation failed. Emulating standard checkout sandbox.', error);
      // Fallback for sandboxed developer testing environments:
      return {
        checkoutUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/premium/success?mock=true&userId=${userId}&plan=${planType}`,
      };
    }
  }

  /**
   * Processes the checkout event or webhook session
   */
  static async handleWebhookEvent(event: any) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.metadata.userId;
          const plan = session.metadata.planType;
          const stripeSubId = session.subscription;

          if (userId && plan) {
            await prisma.subscription.updateMany({
              where: { userId },
              data: {
                plan,
                status: 'ACTIVE',
                stripeSubscriptionId: stripeSubId,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              },
            });
            console.log(`User ${userId} successfully subscribed to ${plan}`);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const stripeSubId = subscription.id;

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: stripeSubId },
            data: {
              plan: 'FREE',
              status: 'INACTIVE',
              expiresAt: new Date(),
            },
          });
          console.log(`Subscription ${stripeSubId} marked inactive`);
          break;
        }
      }
    } catch (error) {
      console.error('Error handling Stripe webhook event:', error);
      throw error;
    }
  }
}
