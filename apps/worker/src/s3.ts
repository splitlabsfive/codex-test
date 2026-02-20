import { writeFile } from 'fs/promises';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

export const s3Client = new S3Client({
  endpoint: env.s3Endpoint,
  region: env.s3Region,
  forcePathStyle: env.awsForcePathStyle,
  credentials: {
    accessKeyId: env.s3AccessKeyId,
    secretAccessKey: env.s3SecretAccessKey
  }
});

export async function downloadToFile(key: string, outputPath: string) {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.s3Bucket,
      Key: key
    })
  );

  if (!response.Body) {
    throw new Error('Missing S3 body');
  }

  const bytes = Buffer.from(await response.Body.transformToByteArray());
  await writeFile(outputPath, bytes);
}

export async function uploadFile(params: { key: string; data: Buffer; contentType: string }) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: params.key,
      Body: params.data,
      ContentType: params.contentType
    })
  );
}

export function publicUrlForKey(key: string) {
  return `${env.s3PublicBaseUrl.replace(/\/$/, '')}/${key}`;
}
