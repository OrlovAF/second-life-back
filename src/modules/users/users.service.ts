import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UserResponseDto,
} from './users.schema';
import { UserWhereUniqueInput } from './users.types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        roleId: data.roleId,
      },
      include: { role: true },
    });

    return this.sanitize(user);
  }

  async findUser(where: UserWhereUniqueInput) {
    const user = await this.prisma.user.findUnique({
      where,
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return this.sanitize(user);
  }

  async findUserWithPassword(
    where: UserWhereUniqueInput,
  ): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({
      where,
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    return this.sanitize(user);
  }

  private sanitize(user: UserDto): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;

    return rest;
  }
}
