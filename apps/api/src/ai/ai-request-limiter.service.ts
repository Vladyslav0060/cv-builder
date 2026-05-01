import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

const MAX_CONCURRENT_REQUESTS = 2;
const MAX_DAILY_REQUESTS = 7;

@Injectable()
export class AiRequestLimiterService {
  private activeRequests = 0;
  private readonly waitQueue: Array<() => void> = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly cfg: ConfigService,
  ) {}

  async runWithLimits<T>(userId: string, task: () => Promise<T>): Promise<T> {
    const releaseConcurrencySlot = await this.acquireConcurrencySlot();

    try {
      await this.consumeDailyQuota(userId);
      return await task();
    } finally {
      releaseConcurrencySlot();
    }
  }

  private acquireConcurrencySlot(): Promise<() => void> {
    if (this.activeRequests < MAX_CONCURRENT_REQUESTS) {
      this.activeRequests += 1;
      return Promise.resolve(() => this.releaseConcurrencySlot());
    }

    return new Promise<() => void>((resolve) => {
      this.waitQueue.push(() => {
        this.activeRequests += 1;
        resolve(() => this.releaseConcurrencySlot());
      });
    });
  }

  private releaseConcurrencySlot() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);

    const next = this.waitQueue.shift();
    if (next) {
      next();
    }
  }

  private async consumeDailyQuota(userId: string) {
    if (this.isDevelopment()) {
      return;
    }

    const day = this.getUtcDayStart();

    const rows = await this.prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "ai_request_usages" ("id", "user_id", "day", "count", "created_at", "updated_at")
      VALUES (
        md5(random()::text || clock_timestamp()::text),
        ${userId},
        ${day},
        1,
        NOW(),
        NOW()
      )
      ON CONFLICT ("user_id", "day")
      DO UPDATE SET
        "count" = "ai_request_usages"."count" + 1,
        "updated_at" = NOW()
      WHERE "ai_request_usages"."count" < ${MAX_DAILY_REQUESTS}
      RETURNING "count";
    `;

    if (rows.length === 0) {
      throw new HttpException(
        `Daily AI generation limit reached. Limit: ${MAX_DAILY_REQUESTS} requests per account per day.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
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
