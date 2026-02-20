import { mkdtemp, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { downloadToFile, publicUrlForKey, uploadFile } from './s3.js';
import { renderVideo } from './render.js';

const prisma = new PrismaClient({
  log: ['warn', 'error']
});

async function processOne() {
  const next = await prisma.job.findFirst({
    where: { status: 'queued' },
    orderBy: { createdAt: 'asc' }
  });

  if (!next) return false;

  const claimed = await prisma.job.updateMany({
    where: { id: next.id, status: 'queued' },
    data: { status: 'processing', errorMessage: null }
  });

  if (claimed.count === 0) return true;

  const workspace = await mkdtemp(join(tmpdir(), `etsy-motion-${next.id}-`));
  const inputPath = join(workspace, 'input');
  const outputPath = join(workspace, 'output.mp4');

  try {
    await downloadToFile(next.inputKey, inputPath);

    await renderVideo({
      inputPath,
      outputPath,
      preset: next.preset
    });

    const outputBuffer = await readFile(outputPath);
    const outputKey = `outputs/${next.id}.mp4`;

    await uploadFile({
      key: outputKey,
      data: outputBuffer,
      contentType: 'video/mp4'
    });

    await prisma.job.update({
      where: { id: next.id },
      data: {
        status: 'completed',
        outputKey,
        outputUrl: publicUrlForKey(outputKey),
        errorMessage: null
      }
    });
  } catch (error) {
    await prisma.job.update({
      where: { id: next.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message.slice(0, 1000) : 'Unknown worker error'
      }
    });
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }

  return true;
}

async function loop() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const didWork = await processOne();
      if (!didWork) {
        await new Promise((resolve) => setTimeout(resolve, env.pollMs));
      }
    } catch (error) {
      console.error('Worker loop failure', error);
      await new Promise((resolve) => setTimeout(resolve, env.pollMs));
    }
  }
}

loop().catch((error) => {
  console.error('Fatal worker error', error);
  process.exit(1);
});
