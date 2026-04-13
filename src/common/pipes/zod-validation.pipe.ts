import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

export const CustomZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    const data = error.issues.reduce(
      (errors, issue) => {
        errors[issue.path.join('')] = issue.message;
        return errors;
      },
      {} as Record<string, string>,
    );

    return new BadRequestException(JSON.stringify(data));
  },
});
