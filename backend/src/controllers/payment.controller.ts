import { Request, Response } from 'express';
import { StripeService, stripe } from '../services/stripe.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!planType || !['PREMIUM_INDIVIDUAL', 'PREMIUM_FAMILY', 'PREMIUM_STUDENT'].includes(planType)) {
      return res.status(400).json({ error: 'Invalid premium plan type' });
    }

    const { checkoutUrl } = await StripeService.createCheckoutSession(userId, planType);
    return res.status(200).json({ checkoutUrl });
  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return res.status(500).json({ error: error.message || 'Checkout failed' });
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // In local testing without signature checks, we can parse directly
      event = req.body;
    }

    await StripeService.handleWebhookEvent(event);
    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// Developer direct mock bypass endpoint for local verification
export const devMockPremium = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { plan, userId } = req.body;
    
    await prisma.subscription.updateMany({
      where: { userId: userId || req.user?.id },
      data: {
        plan: plan || 'PREMIUM_INDIVIDUAL',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({ success: true, message: 'Mock premium activated' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
