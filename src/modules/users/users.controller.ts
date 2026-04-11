import { Public } from '@common/decorators/public.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Public()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
