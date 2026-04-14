import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoleIdByName(name: string): Promise<string | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
      select: { id: true },
    });
    return role?.id || null;
  }
}
