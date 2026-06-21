import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trao AI Travel Planner',
  description: 'Create, customize, and save AI-powered travel itineraries',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
