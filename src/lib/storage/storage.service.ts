import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function envValue(name: string) {
  return (process.env[name] || '').trim().replace(/^['"]|['"]$/g, '');
}

function storageEndpoint() {
  const endpoint = envValue('S3_ENDPOINT');
  return endpoint.replace('.supabase.co/storage/', '.storage.supabase.co/storage/');
}

export class StorageService {
  private static s3 = new S3Client({
    region: envValue('S3_REGION') || 'us-east-1',
    endpoint: storageEndpoint(),
    credentials: {
      accessKeyId: envValue('S3_ACCESS_KEY_ID') || 'placeholder',
      secretAccessKey: envValue('S3_SECRET_ACCESS_KEY') || 'placeholder',
    },
    forcePathStyle: true,
  });

  static async getUploadUrl(key: string, contentType: string, expiresIn = 3600) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  static async getDownloadUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  static isConfigured() {
    return Boolean(envValue('S3_BUCKET') && envValue('S3_ACCESS_KEY_ID') && envValue('S3_SECRET_ACCESS_KEY'));
  }

  static async uploadObject(key: string, body: Buffer, contentType: string) {
    const command = new PutObjectCommand({ Bucket: envValue('S3_BUCKET'), Key: key, Body: body, ContentType: contentType });
    await Promise.race([
      this.s3.send(command),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Storage upload timed out.')), 30000)),
    ]);
  }

  static async downloadObject(key: string) {
    const response = await this.s3.send(new GetObjectCommand({ Bucket: envValue('S3_BUCKET'), Key: key }));
    if (!response.Body) throw new Error('Stored object has no body');
    return Buffer.from(await response.Body.transformToByteArray());
  }
}
