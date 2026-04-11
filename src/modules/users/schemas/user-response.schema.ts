import { z } from 'zod';

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),

  name: z.string().nullable(),
  avatar: z.string().nullable(),
  city: z.string().nullable(),
  bio: z.string().nullable(),
  phone: z.string().nullable(),

  role: z.object({
    id: z.string(),
    name: z.string(),
  }),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
