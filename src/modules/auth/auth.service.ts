import { JwtPayload, Role } from '@common/types';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RolesService } from '../roles/roles.service';
import { UserDto } from '../users/users.schema';
import { UsersService } from '../users/users.service';
import { CredentialsDto } from './auth.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(credentials: CredentialsDto) {
    const userRoleId = await this.rolesService.getRoleIdByName(Role.USER);

    if (!userRoleId) {
      throw new Error('Default USER role not found');
    }

    const existingUser = await this.usersService.findUser({
      email: credentials.email,
    });

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
    const userWithPassword = (await this.usersService.findUser(
      { email: credentials.email },
      true,
    )) as UserDto;

    if (!userWithPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      userWithPassword.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: userWithPassword.id,
      email: userWithPassword.email,
      role: userWithPassword.role.name as Role,
    };

    const token = this.jwtService.sign(payload);

    return { token };
  }
}
