import { Reflector } from '@nestjs/core';
import { Tier } from 'generated/prisma/enums';

export const RequireTier = Reflector.createDecorator<Tier[]>();
