import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 p-8 text-center">
      <h1 className="text-4xl font-bold">Etsy Motion</h1>
      <p className="max-w-xl text-zinc-300">Turn one product image into a polished 15-second Etsy-ready motion video.</p>
      <Link
        href="/upload"
        className="rounded-md bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
      >
        Start Generating
      </Link>
    </main>
  );
}
