import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { S3Service } from '@infrastructure/s3/s3.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import {
  AvatarUploadDto,
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UserResponseDto,
} from './users.schema';
import { UserWhereUniqueInput } from './users.types';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

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
    if (data.avatar) {
      await this.s3.validateFile(data.avatar, id);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    return this.sanitize(user);
  }

  async getAvatarUploadUrl(userId: string, data: AvatarUploadDto) {
    const key = `users/${userId}/avatar.jpg`;

    const uploadUrl = await this.s3.createPresignedPutUrl({
      userId,
      key,
      contentType: data.contentType,
      checksum: data.checksum,
      expiresIn: 60,
    });

    return { key, uploadUrl };
  }

  getAvatarUrl(key: string) {
    return `${this.configService.get('s3.endpoint')}/${key}`;
  }

  private sanitize(user: UserDto): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, avatar, ...rest } = user;

    return {
      ...rest,
      avatar: user.avatar ? this.getAvatarUrl(user.avatar) : null,
    };
  }
}
