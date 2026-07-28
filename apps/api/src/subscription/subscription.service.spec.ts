import Stripe from 'stripe';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsageQuotaService } from 'src/usage/usage-quota.service';
import { SubscriptionStatus, Tier } from 'generated/prisma/enums';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let prisma: {
    forSystem: jest.Mock;
    forUser: jest.Mock;
    user: { findUnique: jest.Mock; update: jest.Mock };
    subscription: {
      upsert: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
    };
    stripeWebhookEvent: { create: jest.Mock };
  };
  let usageQuotaService: {
    resolveTier: jest.Mock;
  };
  let stripeSubscriptionsRetrieve: jest.Mock;
  let stripeSubscriptionsUpdate: jest.Mock;
  let stripeCheckoutSessionsCreate: jest.Mock;
  let stripeCustomersCreate: jest.Mock;

  beforeEach(() => {
    prisma = {
      forSystem: jest.fn((cb: (tx: typeof prisma) => unknown) => cb(prisma)),
      forUser: jest.fn((_userId: string, cb: (tx: typeof prisma) => unknown) =>
        cb(prisma),
      ),
      user: { findUnique: jest.fn(), update: jest.fn() },
      subscription: {
        upsert: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      stripeWebhookEvent: { create: jest.fn() },
    };

    usageQuotaService = {
      resolveTier: jest.fn().mockResolvedValue('free'),
    };

    service = new SubscriptionService(
      prisma as unknown as PrismaService,
      usageQuotaService as unknown as UsageQuotaService,
      {
        secretKey: 'sk_test_dummy',
        webhookSecret: 'whsec_test_dummy',
        apiVersion: '2026-05-27.dahlia',
        prices: {
          proMonthly: 'price_pro_month',
          proSixMonth: 'price_pro_6m',
          maxMonthly: 'price_max_month',
          maxSixMonth: 'price_max_6m',
        },
      },
      {
        baseUrl: 'http://localhost:3000',
      },
    );

    stripeSubscriptionsRetrieve = jest.fn();
    stripeSubscriptionsUpdate = jest.fn();
    stripeCheckoutSessionsCreate = jest.fn();
    stripeCustomersCreate = jest.fn();
    (service as unknown as { stripe: unknown }).stripe = {
      checkout: {
        sessions: {
          create: stripeCheckoutSessionsCreate,
        },
      },
      customers: {
        create: stripeCustomersCreate,
      },
      subscriptions: {
        retrieve: stripeSubscriptionsRetrieve,
        update: stripeSubscriptionsUpdate,
      },
    };
  });

  describe('createCheckoutSession', () => {
    it('rejects prices that are not configured', async () => {
      await expect(
        service.createCheckoutSession('user_1', 'price_unknown'),
      ).rejects.toThrow('Unknown subscription price');

      expect(stripeCheckoutSessionsCreate).not.toHaveBeenCalled();
    });

    it('reuses an existing Stripe customer and includes the session ID token in the success URL', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: 'user@example.com',
        stripeCustomerId: 'cus_existing',
      });
      stripeCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
      });

      await service.createCheckoutSession('user_1', 'price_pro_month');

      expect(stripeCustomersCreate).not.toHaveBeenCalled();
      expect(stripeCheckoutSessionsCreate).toHaveBeenCalledWith({
        client_reference_id: 'user_1',
        customer: 'cus_existing',
        success_url:
          'http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/checkout/cancel',
        line_items: [{ price: 'price_pro_month', quantity: 1 }],
        mode: 'subscription',
      });
    });

    it('creates and stores a Stripe customer before creating checkout', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: 'user@example.com',
        stripeCustomerId: null,
      });
      stripeCustomersCreate.mockResolvedValue({ id: 'cus_new' });
      stripeCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
      });

      await service.createCheckoutSession('user_1', 'price_max_6m');

      expect(stripeCustomersCreate).toHaveBeenCalledWith({
        email: 'user@example.com',
        metadata: { userId: 'user_1' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_1' },
        data: { stripeCustomerId: 'cus_new' },
      });
      expect(stripeCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_new',
          line_items: [{ price: 'price_max_6m', quantity: 1 }],
        }),
      );
    });
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
        id: 'evt_1',
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
        id: 'evt_missing_client',
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
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.subscription.upsert).not.toHaveBeenCalled();
    });

    it('does not process a duplicate webhook event', async () => {
      const duplicateError = Object.assign(
        new Error('Unique constraint failed'),
        {
          code: 'P2002',
        },
      );
      prisma.stripeWebhookEvent.create.mockRejectedValue(duplicateError);

      const event = {
        id: 'evt_duplicate',
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

      expect(stripeSubscriptionsRetrieve).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.subscription.upsert).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.updated', () => {
    it('updates status and currentPeriodEnd by stripeSubscriptionId', async () => {
      const event = {
        id: 'evt_subscription_updated',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            status: 'past_due',
            cancel_at_period_end: false,
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
          cancelAtPeriodEnd: false,
        },
        where: { stripeSubscriptionId: 'sub_123' },
      });
    });
  });

  describe('customer.subscription.deleted', () => {
    it('marks the subscription as canceled', async () => {
      const event = {
        id: 'evt_subscription_deleted',
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

  describe('getCurrentSubscription', () => {
    it('returns free-tier defaults when there is no subscription row', async () => {
      prisma.subscription.findUnique.mockResolvedValue(null);
      usageQuotaService.resolveTier.mockResolvedValue('free');

      const result = await service.getCurrentSubscription('user_1');

      expect(result).toEqual({
        tier: 'free',
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        limits: { CREATE: 1, EXPORT: 1 },
      });
    });

    it('returns active pro subscription details', async () => {
      const periodEnd = new Date(1750000000 * 1000);
      prisma.subscription.findUnique.mockResolvedValue({
        tier: Tier.pro,
        status: SubscriptionStatus.active,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      });
      usageQuotaService.resolveTier.mockResolvedValue(Tier.pro);

      const result = await service.getCurrentSubscription('user_1');

      expect(result).toEqual({
        tier: Tier.pro,
        status: SubscriptionStatus.active,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        limits: { CREATE: 10, EXPORT: 10 },
      });
    });

    it('reflects a cancel-pending subscription', async () => {
      const periodEnd = new Date(1750000000 * 1000);
      prisma.subscription.findUnique.mockResolvedValue({
        tier: Tier.max,
        status: SubscriptionStatus.active,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: true,
      });
      usageQuotaService.resolveTier.mockResolvedValue(Tier.max);

      const result = await service.getCurrentSubscription('user_1');

      expect(result.cancelAtPeriodEnd).toBe(true);
      expect(result.limits).toEqual({ CREATE: 50, EXPORT: 50 });
    });
  });

  describe('cancelSubscription', () => {
    it('throws NotFoundException when there is no subscription', async () => {
      prisma.subscription.findUnique.mockResolvedValue(null);

      await expect(service.cancelSubscription('user_1')).rejects.toThrow(
        'No active subscription found',
      );
      expect(stripeSubscriptionsUpdate).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when already canceled', async () => {
      prisma.subscription.findUnique.mockResolvedValue({
        stripeSubscriptionId: 'sub_123',
        status: SubscriptionStatus.canceled,
      });

      await expect(service.cancelSubscription('user_1')).rejects.toThrow(
        'Subscription is already canceled',
      );
      expect(stripeSubscriptionsUpdate).not.toHaveBeenCalled();
    });

    it('cancels at period end on Stripe and persists the flag', async () => {
      prisma.subscription.findUnique.mockResolvedValue({
        stripeSubscriptionId: 'sub_123',
        status: SubscriptionStatus.active,
      });

      await service.cancelSubscription('user_1');

      expect(stripeSubscriptionsUpdate).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true,
      });
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { userId: 'user_1' },
        data: { cancelAtPeriodEnd: true },
      });
    });
  });
});
