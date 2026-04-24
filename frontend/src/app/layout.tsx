import type { Metadata } from 'next';
import { Providers } from './providers';
import { CrisisBanner } from '@/components/CrisisBanner';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'MindVault — On-Chain AI Therapist',
  description: 'Your mind, your chain, your keys. End-to-end encrypted wellness conversations on Ritual Chain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-vault-bg text-vault-text min-h-screen flex flex-col">
        <Providers>
          <CrisisBanner />
          <main className="flex-1 flex flex-col relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
