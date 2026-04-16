import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket = this.config.get<string>('s3.bucket');

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
    userId: string;
    key: string;
    contentType: string;
    checksum: string;
    expiresIn?: number;
  }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType,
      ChecksumSHA256: params.checksum,
      Metadata: {
        userid: params.userId,
      },
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresIn ?? 60,
    });

    return url;
  }

  async validateFile(key: string, userId: string) {
    try {
      const res = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      if (res.Metadata?.userid !== userId) {
        throw new ForbiddenException('Invalid file owner');
      }
    } catch {
      throw new BadRequestException('File not found or invalid');
    }
  }
}
