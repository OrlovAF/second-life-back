import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ItemCondition, ItemStatus } from '../../common/types';

export const ItemSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  description: z.string(),
  categoryId: z.cuid(),
  condition: z.enum(ItemCondition),
  status: z.enum(ItemStatus).default(ItemStatus.ACTIVE),
  acceptAllCategories: z.boolean().default(false),
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
    condition: z.nativeEnum(ItemCondition),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          order: z.number(),
        }),
      )
      .default([]),
    acceptAllCategories: z.boolean().default(false),
    acceptedCategoryIds: z.array(z.cuid()).optional(),
  })
  .refine(
    (data) => {
      // If acceptAllCategories is true, acceptedCategoryIds should not be provided
      if (data.acceptAllCategories && data.acceptedCategoryIds?.length) {
        return false;
      }
      // If acceptedCategoryIds is provided, it should not be empty
      if (
        data.acceptedCategoryIds !== undefined &&
        data.acceptedCategoryIds.length === 0
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
    acceptAllCategories: z.boolean().optional(),
    acceptedCategoryIds: z.array(z.cuid()).optional(),
  })
  .refine(
    (data) => {
      // If acceptAllCategories is true, acceptedCategoryIds should not be provided
      if (data.acceptAllCategories && data.acceptedCategoryIds?.length) {
        return false;
      }
      // If acceptedCategoryIds is provided, it should not be empty
      if (
        data.acceptedCategoryIds !== undefined &&
        data.acceptedCategoryIds.length === 0
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

export class ItemDto extends createZodDto(ItemSchema) {}
export class CreateItemDto extends createZodDto(CreateItemSchema) {}
export class UpdateItemDto extends createZodDto(UpdateItemSchema) {}
