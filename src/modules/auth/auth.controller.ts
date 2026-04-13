import { Public } from '@common/decorators/public.decorator';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CredentialsDto } from './auth.schema';
import { AuthService } from './auth.service';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() credentials: CredentialsDto) {
    return this.authService.register(credentials);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() credentials: CredentialsDto) {
    return this.authService.login(credentials);
  }
}
