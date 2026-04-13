import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.cuid(),
  email: z.email(),
  passwordHash: z.string(),

  name: z.string().nullable(),
  avatar: z.string().nullable(),
  city: z.string().nullable(),
  bio: z.string().nullable(),
  phone: z.string().nullable(),

  roleId: z.cuid(),
  role: z.object({
    id: z.cuid(),
    name: z.string(),
  }),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserResponseSchema = UserSchema.omit({
  passwordHash: true,
});

export const CreateUserSchema = UserSchema.pick({
  email: true,
  roleId: true,
}).extend({
  password: z.string().min(8),
});

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  email: true,
  passwordHash: true,
  roleId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
});

export class UserDto extends createZodDto(UserSchema) {}
export class UserResponseDto extends createZodDto(UserResponseSchema) {}
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
