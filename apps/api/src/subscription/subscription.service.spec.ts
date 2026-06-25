import Stripe from 'stripe';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionStatus, Tier } from 'generated/prisma/enums';

describe('SubscriptionService.handleWebhookEvent', () => {
  let service: SubscriptionService;
  let prisma: {
    $transaction: jest.Mock;
    user: { update: jest.Mock };
    subscription: { upsert: jest.Mock; update: jest.Mock };
  };
  let stripeSubscriptionsRetrieve: jest.Mock;

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = 'price_pro_month';
    process.env.STRIPE_PRO_6M_PRICE_ID = 'price_pro_6m';
    process.env.STRIPE_MAX_MONTHLY_PRICE_ID = 'price_max_month';
    process.env.STRIPE_MAX_6M_PRICE_ID = 'price_max_6m';

    prisma = {
      $transaction: jest.fn((cb: (tx: typeof prisma) => unknown) => cb(prisma)),
      user: { update: jest.fn() },
      subscription: { upsert: jest.fn(), update: jest.fn() },
    };

    service = new SubscriptionService(prisma as unknown as PrismaService);

    stripeSubscriptionsRetrieve = jest.fn();
    (service as unknown as { stripe: unknown }).stripe = {
      subscriptions: { retrieve: stripeSubscriptionsRetrieve },
    };
  });

  describe('checkout.session.completed', () => {
    it('upserts the subscription and stores the stripeCustomerId', async () => {
      stripeSubscriptionsRetrieve.mockResolvedValue({
        id: 'sub_123',
        status: 'active',
        items: {
          data: [
            {
              current_period_end: 1750000000,
              price: { id: 'price_pro_month' },
            },
          ],
        },
      });

      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'user_1',
            customer: 'cus_123',
            subscription: 'sub_123',
          },
        },
      } as unknown as Stripe.Event;

      await service.handleWebhookEvent(event);

      expect(prisma.user.update).toHaveBeenCalledWith({
        data: { stripeCustomerId: 'cus_123' },
        where: { id: 'user_1' },
      });
      expect(prisma.subscription.upsert).toHaveBeenCalledWith({
        create: {
          userId: 'user_1',
          stripeSubscriptionId: 'sub_123',
          status: SubscriptionStatus.active,
          currentPeriodEnd: new Date(1750000000 * 1000),
          priceId: 'price_pro_month',
          tier: Tier.pro,
        },
        update: {
          status: SubscriptionStatus.active,
          currentPeriodEnd: new Date(1750000000 * 1000),
        },
        where: { stripeSubscriptionId: 'sub_123' },
      });
    });

    it('does nothing when client_reference_id is missing', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: null,
            customer: 'cus_123',
            subscription: 'sub_123',
          },
        },
      } as unknown as Stripe.Event;

      await service.handleWebhookEvent(event);

      expect(stripeSubscriptionsRetrieve).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.updated', () => {
    it('updates status and currentPeriodEnd by stripeSubscriptionId', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            status: 'past_due',
            items: {
              data: [
                {
                  current_period_end: 1750000000,
                  price: { id: 'price_pro_month' },
                },
              ],
            },
          },
        },
      } as unknown as Stripe.Event;

      await service.handleWebhookEvent(event);

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        data: {
          status: SubscriptionStatus.past_due,
          currentPeriodEnd: new Date(1750000000 * 1000),
        },
        where: { stripeSubscriptionId: 'sub_123' },
      });
    });
  });

  describe('customer.subscription.deleted', () => {
    it('marks the subscription as canceled', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_123' } },
      } as unknown as Stripe.Event;

      await service.handleWebhookEvent(event);

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        data: { status: SubscriptionStatus.canceled },
        where: { stripeSubscriptionId: 'sub_123' },
      });
    });
  });
});
