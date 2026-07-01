import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
    adapter
      .connect()
      .then((res) => console.log('connected'))
      .catch((err) => console.log(err));
  }

  // RLS
  async forUser<T>(
    userId: string,
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT set_config('app.current_user_id', ${userId}, true)
      `;
      return callback(tx);
    });
  }

  async forSystem<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT set_config('app.bypass_rls', 'on', true)
      `;
      return callback(tx);
    });
  }
}
