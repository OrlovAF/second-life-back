import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private client: S3Client;

  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      region: config.get<string>('s3.region'),
      endpoint: config.get<string>('s3.endpoint'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get<string>('s3.accessKey'),
        secretAccessKey: config.get<string>('s3.secretKey'),
      },
    });
  }

  async createPresignedPutUrl(params: {
    key: string;
    contentType: string;
    checksum: string;
    expiresIn?: number;
  }) {
    const bucket = this.config.get<string>('s3.bucket');

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      ContentType: params.contentType,
      ChecksumSHA256: params.checksum,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresIn ?? 60,
    });

    return url;
  }
}
