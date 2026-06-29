import { Injectable } from '@nestjs/common';

const MAX_CONCURRENT_REQUESTS = 2;

@Injectable()
export class AiRequestLimiterService {
  private activeRequests = 0;
  private readonly waitQueue: Array<() => void> = [];

  async runWithLimits<T>(task: () => Promise<T>): Promise<T> {
    const releaseConcurrencySlot = await this.acquireConcurrencySlot();

    try {
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
}
