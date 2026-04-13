import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UserDto, UserResponseDto } from './users.schema';

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

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return this.sanitize(user);
  }

  private sanitize(user: UserDto): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;

    return rest;
  }
}
