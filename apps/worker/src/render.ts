import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const VIDEO_SECONDS = 15;
const FPS = 30;

function baseOutputArgs(outputPath: string) {
  return [
    '-t',
    String(VIDEO_SECONDS),
    '-r',
    String(FPS),
    '-an',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-preset',
    'medium',
    '-crf',
    '22',
    '-movflags',
    '+faststart',
    outputPath
  ];
}

export async function renderVideo(params: {
  inputPath: string;
  outputPath: string;
  preset: 'slow_zoom' | 'pan_lr' | 'push_in_light';
}) {
  const filterByPreset: Record<typeof params.preset, string> = {
    slow_zoom:
      "scale=1400:-2,zoompan=z='1+0.12*(1-exp(-on/180))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1080:fps=30,format=yuv420p",
    pan_lr:
      "scale=1600:-2,crop=1080:1080:x='(in_w-out_w)*(on/450)':y='(in_h-out_h)/2',fps=30,format=yuv420p",
    push_in_light:
      "scale=1400:-2,zoompan=z='1+0.18*(on/450)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1080:fps=30,format=rgba"
  };

  if (params.preset === 'push_in_light') {
    const filterComplex = `[0:v]${filterByPreset.push_in_light}[base];` +
      `color=c=0xffd6a3@0.14:s=1080x1080:d=15:r=30,format=rgba,` +
      `geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*(0.5+0.5*sin((X+Y+N*7)/180))'[leak];` +
      `[base][leak]blend=all_mode=screen:all_opacity=0.14,format=yuv420p[v]`;

    await execFileAsync('ffmpeg', [
      '-y',
      '-loop',
      '1',
      '-i',
      params.inputPath,
      '-filter_complex',
      filterComplex,
      '-map',
      '[v]',
      ...baseOutputArgs(params.outputPath)
    ]);
    return;
  }

  await execFileAsync('ffmpeg', [
    '-y',
    '-loop',
    '1',
    '-i',
    params.inputPath,
    '-vf',
    filterByPreset[params.preset],
    ...baseOutputArgs(params.outputPath)
  ]);
}
