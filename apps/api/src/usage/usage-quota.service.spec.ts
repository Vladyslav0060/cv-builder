import { UsageQuotaService } from './usage-quota.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('UsageQuotaService', () => {
  let service: UsageQuotaService;
  let prisma: {
    $queryRaw: jest.Mock;
    forUser: jest.Mock;
    user: { findUnique: jest.Mock };
  };
  let cfg: { get: jest.Mock };

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn(),
      forUser: jest.fn(
        (_userId: string, cb: (tx: typeof prisma) => unknown) => cb(prisma),
      ),
      user: { findUnique: jest.fn() },
    };
    cfg = { get: jest.fn().mockReturnValue('production') };

    service = new UsageQuotaService(
      prisma as unknown as PrismaService,
      cfg as unknown as ConfigService,
    );
  });

  describe('resolveTier', () => {
    it('returns free when the user has no subscription', async () => {
      prisma.user.findUnique.mockResolvedValue({ subscription: null });

      await expect(service.resolveTier('user_1')).resolves.toBe('free');
    });

    it('returns free when the subscription status is not active', async () => {
      prisma.user.findUnique.mockResolvedValue({
        subscription: { tier: 'pro', status: 'canceled' },
      });

      await expect(service.resolveTier('user_1')).resolves.toBe('free');
    });

    it('returns the subscription tier when active', async () => {
      prisma.user.findUnique.mockResolvedValue({
        subscription: { tier: 'max', status: 'active' },
      });

      await expect(service.resolveTier('user_1')).resolves.toBe('max');
    });

    it('returns the subscription tier when trialing', async () => {
      prisma.user.findUnique.mockResolvedValue({
        subscription: { tier: 'pro', status: 'trialing' },
      });

      await expect(service.resolveTier('user_1')).resolves.toBe('pro');
    });
  });

  describe('consumeQuota', () => {
    it('caps a free user at 1 CREATE and 1 EXPORT per day', async () => {
      prisma.user.findUnique.mockResolvedValue({ subscription: null });
      prisma.$queryRaw.mockResolvedValueOnce([{ count: 1 }]);

      await expect(
        service.consumeQuota('user_1', 'CREATE'),
      ).resolves.toBeUndefined();

      expect(prisma.$queryRaw.mock.calls[0]).toContain(1); // limit interpolated for free CREATE
    });

    it('throws 429 when the free user is over quota', async () => {
      prisma.user.findUnique.mockResolvedValue({ subscription: null });
      prisma.$queryRaw.mockResolvedValueOnce([]);

      await expect(service.consumeQuota('user_1', 'CREATE')).rejects.toThrow(
        'Daily create limit reached',
      );
    });

    it('uses the pro limit (10) for an active pro user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        subscription: { tier: 'pro', status: 'active' },
      });
      prisma.$queryRaw.mockResolvedValueOnce([{ count: 5 }]);

      await service.consumeQuota('user_1', 'EXPORT');

      expect(prisma.$queryRaw.mock.calls[0]).toContain(10);
    });

    it('uses the max limit (50) for an active max user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        subscription: { tier: 'max', status: 'active' },
      });
      prisma.$queryRaw.mockResolvedValueOnce([{ count: 20 }]);

      await service.consumeQuota('user_1', 'CREATE');

      expect(prisma.$queryRaw.mock.calls[0]).toContain(50);
    });

    it('bypasses the database entirely in development mode', async () => {
      cfg.get.mockReturnValue('development');

      await service.consumeQuota('user_1', 'CREATE');

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('getDailyUsage', () => {
    it('returns unlimited usage in development mode', async () => {
      cfg.get.mockReturnValue('development');
      prisma.user.findUnique.mockResolvedValue({ subscription: null });

      const result = await service.getDailyUsage('user_1');

      expect(result.create.unlimited).toBe(true);
      expect(result.export.unlimited).toBe(true);
    });

    it('aggregates usage per action type for the current day', async () => {
      prisma.user.findUnique.mockResolvedValue({
        subscription: { tier: 'pro', status: 'active' },
      });
      prisma.$queryRaw.mockResolvedValueOnce([
        { action_type: 'CREATE', count: 3 },
        { action_type: 'EXPORT', count: 1 },
      ]);

      const result = await service.getDailyUsage('user_1');

      expect(result.tier).toBe('pro');
      expect(result.create).toEqual({
        used: 3,
        total: 10,
        remaining: 7,
        unlimited: false,
      });
      expect(result.export).toEqual({
        used: 1,
        total: 10,
        remaining: 9,
        unlimited: false,
      });
    });
  });
});
