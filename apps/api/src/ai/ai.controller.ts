import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AiRequestLimiterService } from './ai-request-limiter.service';
import { GetAiUsageDto } from './dto/get-ai-usage.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SafeUser } from 'src/user/user.select';

@Controller('ai')
export class AiController {
  constructor(private readonly limiter: AiRequestLimiterService) {}

  @Get('usage')
  @ApiOkResponse({ type: GetAiUsageDto })
  @UseGuards(AuthenticatedGuard)
  async getUsage(@CurrentUser() currentUser: SafeUser): Promise<GetAiUsageDto> {
    return this.limiter.getDailyUsage(currentUser.id);
  }
}
