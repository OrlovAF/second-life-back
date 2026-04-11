import { z } from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  avatar: z.url().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  roleId: z.string().uuid().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
