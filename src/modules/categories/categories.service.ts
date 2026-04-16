import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';

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

  async validateCategoryIds(ids: string[]) {
    const count = await this.prisma.category.count({
      where: { id: { in: ids } },
    });

    if (count !== ids.length) {
      throw new BadRequestException('Incorrect accepted categories');
    }
  }
}
