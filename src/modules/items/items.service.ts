import { ItemAcceptedMode } from '@common/types';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
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

    if (dto.acceptedMode === ItemAcceptedMode.SELECTED) {
      await this.categoriesService.validateCategoryIds(dto.acceptedCategoryIds);
    }

    return this.prisma.item.create({
      data: {
        title: dto.title,
        description: dto.description,
        ownerId: userId,
        categoryId: dto.categoryId,
        condition: dto.condition,

        acceptedMode: dto.acceptedMode,

        acceptedCategories:
          dto.acceptedMode === ItemAcceptedMode.SELECTED
            ? {
                create: dto.acceptedCategoryIds!.map((id) => ({
                  categoryId: id,
                })),
              }
            : undefined,

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

  async update(id: string, dto: UpdateItemDto, userId: string) {
    const item = await this.findById(id);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.ownerId !== userId) {
      throw new ForbiddenException('Not your item');
    }

    if (dto.categoryId) {
      const category = await this.categoriesService.findById(dto.categoryId);

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const mode = dto.acceptedMode ?? item.acceptedMode;

    let categoryIds: string[] | undefined;

    if (mode === ItemAcceptedMode.SELECTED) {
      if (dto.acceptedCategoryIds !== undefined) {
        categoryIds = dto.acceptedCategoryIds;
      } else {
        categoryIds = item.acceptedCategories.map((c) => c.categoryId);
      }

      if (!categoryIds.length) {
        throw new BadRequestException(
          'SELECTED mode requires at least one category',
        );
      }

      await this.categoriesService.validateCategoryIds(categoryIds);
    }

    return this.prisma.item.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        condition: dto.condition,
        status: dto.status,

        acceptedMode: mode,

        acceptedCategories:
          mode === ItemAcceptedMode.ALL
            ? {
                deleteMany: {},
              }
            : dto.acceptedCategoryIds !== undefined
              ? {
                  deleteMany: {},
                  create: dto.acceptedCategoryIds.map((id) => ({
                    categoryId: id,
                  })),
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
}
