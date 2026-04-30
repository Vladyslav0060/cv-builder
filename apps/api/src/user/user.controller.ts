/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { EnrichedUserDto } from './dto/enriched-user.dto';
import { toEnrichedUserDto } from 'src/auth/mappers/enriched-user.mapper';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch()
  @ApiOperation({ summary: 'Update user' })
  @UseGuards(AuthenticatedGuard)
  @ApiBody({
    description: 'Payload for updating a user',
    type: UpdateUserDto,
    examples: {
      default: {
        summary: 'Example User',
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    },
  })
  async updateUser(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User has been deleted' })
  @ApiParam({ name: 'id', example: '1', required: true })
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user data' })
  @ApiParam({ name: 'id', example: '1', required: true })
  @ApiOkResponse({
    description: 'User has been found',
    type: EnrichedUserDto,
  })
  async findUserById(@Param('id') id: string): Promise<EnrichedUserDto> {
    const res = await this.userService.findEnrichedUser(id);
    return toEnrichedUserDto(res);
  }

  @Get()
  async() {
    return 'test';
  }
}
