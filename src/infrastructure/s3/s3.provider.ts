import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const S3_CLIENT = 'S3_CLIENT';

export const s3ClientProvider = {
  provide: S3_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return new S3Client({
      region: config.get<string>('s3.region'),
      endpoint: config.get<string>('s3.endpoint'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get<string>('s3.accessKey'),
        secretAccessKey: config.get<string>('s3.secretKey'),
      },
    });
  },
};
