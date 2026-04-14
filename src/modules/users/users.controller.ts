import { OwnResourceGuard } from '@common/guards/own-resource.guard';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AvatarUploadDto, UpdateUserDto } from './users.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findUser({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Patch(':id')
  @UseGuards(OwnResourceGuard)
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    const user = await this.usersService.findUser({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.updateUser(id, data);
  }

  @Post(':id/avatar/upload-url')
  @UseGuards(OwnResourceGuard)
  async getUploadUrl(@Param('id') id: string, @Body() data: AvatarUploadDto) {
    const user = await this.usersService.findUser({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.getAvatarUploadUrl(id, data);
  }
}
