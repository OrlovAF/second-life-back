import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  ItemAcceptedMode,
  ItemCondition,
  ItemStatus,
} from '../../common/types';

export const ItemSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  description: z.string(),
  categoryId: z.cuid(),
  condition: z.enum(ItemCondition),
  status: z.enum(ItemStatus).default(ItemStatus.ACTIVE),
  acceptedMode: z.enum(ItemAcceptedMode).default(ItemAcceptedMode.ALL),
  ownerId: z.cuid(),
  owner: z.object({
    id: z.cuid(),
    email: z.email(),
    name: z.string().nullable(),
  }),
  category: z.object({
    id: z.cuid(),
    name: z.string(),
    slug: z.string(),
  }),
  images: z.array(
    z.object({
      id: z.cuid(),
      imageUrl: z.string().url(),
      order: z.number(),
    }),
  ),
  acceptedCategories: z.array(
    z.object({
      id: z.cuid(),
      category: z.object({
        id: z.cuid(),
        name: z.string(),
        slug: z.string(),
      }),
    }),
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateItemSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    categoryId: z.cuid(),
    condition: z.enum(ItemCondition),
    images: z
      .array(
        z.object({
          url: z.url(),
          order: z.number(),
        }),
      )
      .default([]),
    acceptedMode: z.enum(ItemAcceptedMode).default(ItemAcceptedMode.ALL),
    acceptedCategoryIds: z.array(z.cuid()).optional(),
  })
  .refine(
    (data) => {
      if (
        data.acceptedMode === ItemAcceptedMode.ALL &&
        data.acceptedCategoryIds !== undefined
      ) {
        return false;
      }
      if (
        data.acceptedMode === ItemAcceptedMode.SELECTED &&
        (!data.acceptedCategoryIds || data.acceptedCategoryIds.length === 0)
      ) {
        return false;
      }

      return true;
    },
    {
      message: 'Invalid categories configuration',
      path: ['acceptedCategoryIds'],
    },
  );

export const UpdateItemSchema = z
  .object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    categoryId: z.cuid().optional(),
    condition: z.nativeEnum(ItemCondition).optional(),
    status: z.nativeEnum(ItemStatus).optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          order: z.number(),
        }),
      )
      .optional(),
    acceptedMode: z.enum(ItemAcceptedMode).optional(),
    acceptedCategoryIds: z.array(z.cuid()).optional(),
  })
  .superRefine((data, ctx) => {
    const modeProvided = data.acceptedMode !== undefined;
    const categoriesProvided = data.acceptedCategoryIds !== undefined;

    if (!modeProvided && !categoriesProvided) {
      return;
    }

    if (data.acceptedMode === ItemAcceptedMode.ALL && categoriesProvided) {
      ctx.addIssue({
        code: 'custom',
        message: 'ALL mode cannot have categories',
        path: ['acceptedCategoryIds'],
      });
    }

    if (
      data.acceptedMode === ItemAcceptedMode.SELECTED &&
      (!data.acceptedCategoryIds || data.acceptedCategoryIds.length === 0)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'SELECTED mode requires at least one category',
        path: ['acceptedCategoryIds'],
      });
    }

    if (
      !modeProvided &&
      categoriesProvided &&
      data.acceptedCategoryIds!.length === 0
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Categories cannot be empty',
        path: ['acceptedCategoryIds'],
      });
    }
  });

export class ItemDto extends createZodDto(ItemSchema) {}
export class CreateItemDto extends createZodDto(CreateItemSchema) {}
export class UpdateItemDto extends createZodDto(UpdateItemSchema) {}
