import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async validateCategoryIds(ids: string[]): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { id: { in: ids } },
    });
    return count === ids.length;
  }
}
