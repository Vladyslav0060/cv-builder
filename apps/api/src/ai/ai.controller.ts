import { Controller, Get, Session } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AiRequestLimiterService } from './ai-request-limiter.service';
import { GetAiUsageDto } from './dto/get-ai-usage.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly limiter: AiRequestLimiterService) {}

  @Get('usage')
  @ApiOkResponse({ type: GetAiUsageDto })
  async getUsage(@Session() session: any): Promise<GetAiUsageDto> {
    return this.limiter.getDailyUsage(session.passport.user);
  }
}
