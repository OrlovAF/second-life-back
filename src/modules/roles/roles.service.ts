import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

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
