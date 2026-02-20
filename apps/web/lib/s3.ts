import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

export const s3Client = new S3Client({
  endpoint: env.s3Endpoint,
  region: env.s3Region,
  forcePathStyle: env.awsForcePathStyle,
  credentials: {
    accessKeyId: env.s3AccessKeyId,
    secretAccessKey: env.s3SecretAccessKey
  }
});

export async function uploadBuffer(params: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType
    })
  );
}

export function publicUrlForKey(key: string) {
  return `${env.s3PublicBaseUrl.replace(/\/$/, '')}/${key}`;
}
