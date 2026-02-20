'use client';

import { FormEvent, useMemo, useState } from 'react';

type Preset = 'slow_zoom' | 'pan_lr' | 'push_in_light';

type JobResponse = {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  outputUrl: string | null;
  errorMessage: string | null;
};

const presets: Preset[] = ['slow_zoom', 'pan_lr', 'push_in_light'];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Preset>('slow_zoom');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobResponse['status'] | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => file && !loading, [file, loading]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setOutputUrl(null);
    setJobId(null);
    setStatus(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('preset', preset);

    const response = await fetch('/api/jobs', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? 'Failed to create job.');
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as { jobId: string };
    setJobId(payload.jobId);
    setStatus('queued');
    setLoading(false);

    const interval = window.setInterval(async () => {
      const jobRes = await fetch(`/api/jobs/${payload.jobId}`);
      if (!jobRes.ok) {
        setError('Could not fetch job status.');
        window.clearInterval(interval);
        return;
      }

      const job = (await jobRes.json()) as JobResponse;
      setStatus(job.status);

      if (job.status === 'completed') {
        setOutputUrl(job.outputUrl);
        window.clearInterval(interval);
      }

      if (job.status === 'failed') {
        setError(job.errorMessage || 'Job failed.');
        window.clearInterval(interval);
      }
    }, 2000);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-8">
      <h1 className="text-3xl font-semibold">Generate Etsy footage</h1>
      <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="image">
            Product image (JPG/PNG)
          </label>
          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="preset">
            Motion preset
          </label>
          <select
            id="preset"
            value={preset}
            onChange={(event) => setPreset(event.target.value as Preset)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 p-2"
          >
            {presets.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 disabled:cursor-not-allowed disabled:bg-zinc-600"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {jobId && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-300">Job ID: {jobId}</p>
          <p className="mt-2 text-lg font-semibold">Status: {status}</p>
          {error && <p className="mt-2 text-red-400">{error}</p>}
          {outputUrl && (
            <div className="mt-4 space-y-4">
              <video controls src={outputUrl} className="aspect-square w-full max-w-md rounded-lg border border-zinc-700" />
              <a
                href={outputUrl}
                download
                className="inline-flex rounded-md bg-emerald-500 px-4 py-2 font-semibold text-emerald-950"
              >
                Download MP4
              </a>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
