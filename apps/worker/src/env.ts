const required = [
  'DATABASE_URL',
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_PUBLIC_BASE_URL'
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL as string,
  s3Endpoint: process.env.S3_ENDPOINT as string,
  s3Region: process.env.S3_REGION as string,
  s3Bucket: process.env.S3_BUCKET as string,
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID as string,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL as string,
  pollMs: Number(process.env.WORKER_POLL_MS ?? '3000'),
  awsForcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true'
};
