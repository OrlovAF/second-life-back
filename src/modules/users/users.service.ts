import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserInput } from './schemas/create-user.schema';
import { UpdateUserInput } from './schemas/update-user.schema';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) throw new NotFoundException();

    return this.sanitize(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { role: true },
    });

    return users.map((user) => this.sanitize(user));
  }

  async create(data: CreateUserInput) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        avatar: data.avatar,
        city: data.city,
        bio: data.bio,
        phone: data.phone,
        roleId: data.roleId,
      },
      include: { role: true },
    });

    return this.sanitize(user);
  }

  async update(data: UpdateUserInput) {
    const user = await this.prisma.user.update({
      where: { id: (data as any).id },
      data,
      include: { role: true },
    });

    return this.sanitize(user);
  }

  private sanitize(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
