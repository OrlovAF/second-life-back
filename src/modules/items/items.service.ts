import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from './../categories/categories.service';
import { CreateItemDto, UpdateItemDto } from './items.schema';

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll() {
    return this.prisma.item.findMany({
      include: { category: true, images: true, acceptedCategories: true },
    });
  }

  async findById(id: string) {
    return this.prisma.item.findUnique({
      where: { id },
      include: { category: true, images: true, acceptedCategories: true },
    });
  }

  async create(dto: CreateItemDto, userId: string) {
    const category = await this.categoriesService.findById(dto.categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.validateCategories(dto.acceptedCategoryIds);

    return this.prisma.item.create({
      data: {
        title: dto.title,
        description: dto.description,
        ownerId: userId,
        categoryId: dto.categoryId,
        condition: dto.condition,

        acceptAllCategories: dto.acceptAllCategories,

        acceptedCategories: dto.acceptAllCategories
          ? undefined
          : {
              create:
                dto.acceptedCategoryIds?.map((id) => ({
                  categoryId: id,
                })) || [],
            },

        images: {
          create: dto.images.map(({ url, order }) => ({
            imageUrl: url,
            order,
          })),
        },
      },
      include: {
        images: true,
        acceptedCategories: true,
      },
    });
  }

  async update(id: string, dto: UpdateItemDto) {
    if (dto.categoryId) {
      const category = await this.categoriesService.findById(dto.categoryId);

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    await this.validateCategories(dto.acceptedCategoryIds);

    let acceptAllCategories = dto.acceptAllCategories;

    if (
      dto.acceptAllCategories === undefined &&
      dto.acceptedCategoryIds !== undefined
    ) {
      acceptAllCategories = false;
    }

    return this.prisma.item.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        condition: dto.condition,
        status: dto.status,

        acceptAllCategories,

        acceptedCategories:
          acceptAllCategories !== undefined
            ? acceptAllCategories
              ? {
                  deleteMany: {},
                }
              : {
                  deleteMany: {},
                  create:
                    dto.acceptedCategoryIds?.map((id) => ({
                      categoryId: id,
                    })) || [],
                }
            : undefined,

        images: dto.images
          ? {
              deleteMany: {},
              create: dto.images.map(({ url, order }) => ({
                imageUrl: url,
                order,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        acceptedCategories: true,
      },
    });
  }

  async archive(id: string) {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item не найден');
    }

    return this.prisma.item.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  private async validateCategories(categoryIds?: string[]) {
    if (categoryIds?.length > 0) {
      const valid =
        await this.categoriesService.validateCategoryIds(categoryIds);

      if (!valid) {
        throw new BadRequestException('Incorrect accepted categories');
      }
    }
  }
}
