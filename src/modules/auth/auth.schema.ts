import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CredentialsSchema = z.object({
  email: z
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
});

export class CredentialsDto extends createZodDto(CredentialsSchema) {}
