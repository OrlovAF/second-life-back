import { JwtPayload, Role } from '@common/types';
import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { CredentialsDto } from './auth.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(credentials: CredentialsDto) {
    const userRoleId = await this.rolesService.getRoleIdByName(Role.USER);

    if (!userRoleId) {
      throw new Error('Default USER role not found');
    }

    const existingUser = await this.usersService.findByEmail(credentials.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.usersService.create({
      email: credentials.email,
      password: credentials.password,
      roleId: userRoleId,
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: Role.USER,
    };

    const token = this.jwtService.sign(payload);

    return { token };
  }

  async login(credentials: CredentialsDto) {
    // TODO: Implement user login logic
    // - Validate credentials
    // - Generate JWT token
    console.log(`Login attempt for: ${credentials.email}`);
    return { message: 'Login successful', token: 'jwt-token-placeholder' };
  }
}
