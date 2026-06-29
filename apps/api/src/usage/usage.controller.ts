import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { UsageQuotaService } from './usage-quota.service';
import { GetUsageDto } from './dto/get-usage.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SafeUser } from 'src/user/user.select';

@Controller('usage')
export class UsageController {
  constructor(private readonly usageQuotaService: UsageQuotaService) {}

  @Get()
  @ApiOkResponse({ type: GetUsageDto })
  @UseGuards(AuthenticatedGuard)
  async getUsage(@CurrentUser() currentUser: SafeUser): Promise<GetUsageDto> {
    return this.usageQuotaService.getDailyUsage(currentUser.id);
  }
}
