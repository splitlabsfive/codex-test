import { z } from 'zod';

export const presetSchema = z.enum(['slow_zoom', 'pan_lr', 'push_in_light']);

export type Preset = z.infer<typeof presetSchema>;
