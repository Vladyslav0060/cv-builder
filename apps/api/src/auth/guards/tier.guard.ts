import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequireTier } from '../decorators/require-tier.decorator';

@Injectable()
export class TierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();

    const roles = this.reflector.get(RequireTier, ctx.getHandler());

    if (!roles) return true;

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscription: { select: { tier: true, status: true } } },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const userTier = user?.subscription?.tier;
    const userStatus = user.subscription?.status;

    const acceptableStatuses: SubscriptionStatus[] = ['active', 'trialing'];

    const response = userTier
      ? roles.includes(userTier) &&
        acceptableStatuses.includes(userStatus as SubscriptionStatus)
      : false;

    return response;
  }
}
