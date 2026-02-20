import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { presetSchema } from '@/lib/jobs';
import { publicUrlForKey, uploadBuffer } from '@/lib/s3';

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image');
  const presetInput = formData.get('preset');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'image is required' }, { status: 400 });
  }

  if (!presetInput || typeof presetInput !== 'string') {
    return NextResponse.json({ error: 'preset is required' }, { status: 400 });
  }

  const preset = presetSchema.safeParse(presetInput);
  if (!preset.success) {
    return NextResponse.json({ error: 'invalid preset' }, { status: 400 });
  }

  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG and PNG are supported' }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  const fileExt = file.type === 'image/png' ? 'png' : 'jpg';
  const jobId = randomUUID();
  const inputKey = `uploads/${jobId}.${fileExt}`;
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  await uploadBuffer({
    key: inputKey,
    body: inputBuffer,
    contentType: file.type
  });

  await prisma.job.create({
    data: {
      id: jobId,
      status: 'queued',
      preset: preset.data,
      inputKey,
      inputUrl: publicUrlForKey(inputKey)
    }
  });

  return NextResponse.json({ jobId });
}
