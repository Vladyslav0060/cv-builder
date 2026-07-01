import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ACTIVE_STATUSES } from 'src/subscription/utils';
import {
  ResolvedTier,
  TIER_DAILY_LIMITS,
  UsageActionType,
} from './usage-limits';

@Injectable()
export class UsageQuotaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cfg: ConfigService,
  ) {}

  async consumeQuota(
    userId: string,
    actionType: UsageActionType,
  ): Promise<void> {
    if (this.isDevelopment()) {
      return;
    }

    const tier = await this.resolveTier(userId);
    const limit = TIER_DAILY_LIMITS[tier][actionType];
    const day = this.getUtcDayStart();

    const rows = await this.prisma.forUser(userId, (tx) =>
      tx.$queryRaw<{ count: number }[]>`
        INSERT INTO "usage_records" ("id", "user_id", "day", "action_type", "count", "created_at", "updated_at")
        VALUES (
          md5(random()::text || clock_timestamp()::text),
          ${userId},
          ${day},
          ${actionType}::"UsageActionType",
          1,
          NOW(),
          NOW()
        )
        ON CONFLICT ("user_id", "day", "action_type")
        DO UPDATE SET
          "count" = "usage_records"."count" + 1,
          "updated_at" = NOW()
        WHERE "usage_records"."count" < ${limit}
        RETURNING "count";
      `,
    );

    if (rows.length === 0) {
      throw new HttpException(
        `Daily ${actionType.toLowerCase()} limit reached. Limit: ${limit} per account per day.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async getDailyUsage(userId: string) {
    const tier = await this.resolveTier(userId);
    const limits = TIER_DAILY_LIMITS[tier];

    if (this.isDevelopment()) {
      return {
        tier,
        create: {
          used: 0,
          total: limits.CREATE,
          remaining: limits.CREATE,
          unlimited: true,
        },
        export: {
          used: 0,
          total: limits.EXPORT,
          remaining: limits.EXPORT,
          unlimited: true,
        },
      };
    }

    const day = this.getUtcDayStart();
    const rows = await this.prisma.forUser(userId, (tx) =>
      tx.$queryRaw<{ action_type: UsageActionType; count: number }[]>`
        SELECT "action_type", COALESCE(SUM("count"), 0)::int AS "count"
        FROM "usage_records"
        WHERE "user_id" = ${userId}
          AND "day" = ${day}
        GROUP BY "action_type"
      `,
    );

    const usedByAction: Record<UsageActionType, number> = {
      CREATE: 0,
      EXPORT: 0,
    };
    for (const row of rows) {
      usedByAction[row.action_type] = row.count;
    }

    return {
      tier,
      create: {
        used: usedByAction.CREATE,
        total: limits.CREATE,
        remaining: Math.max(limits.CREATE - usedByAction.CREATE, 0),
        unlimited: false,
      },
      export: {
        used: usedByAction.EXPORT,
        total: limits.EXPORT,
        remaining: Math.max(limits.EXPORT - usedByAction.EXPORT, 0),
        unlimited: false,
      },
    };
  }

  async resolveTier(userId: string): Promise<ResolvedTier> {
    const user = await this.prisma.forUser(userId, (tx) =>
      tx.user.findUnique({
        where: { id: userId },
        select: { subscription: { select: { tier: true, status: true } } },
      }),
    );

    const subscription = user?.subscription;
    if (
      !subscription?.tier ||
      !subscription.status ||
      !ACTIVE_STATUSES.includes(subscription.status)
    ) {
      return 'free';
    }

    return subscription.tier;
  }

  private getUtcDayStart() {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }

  private isDevelopment() {
    const nodeEnv = this.cfg.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
    return nodeEnv === 'development' || nodeEnv === 'dev';
  }
}
