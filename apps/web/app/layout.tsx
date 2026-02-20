import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Etsy Motion',
  description: 'Generate Etsy-optimized footage from product photos.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
