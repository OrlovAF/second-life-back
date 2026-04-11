import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),

  name: z.string().optional(),
  avatar: z.url().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),

  roleId: z.uuid(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
