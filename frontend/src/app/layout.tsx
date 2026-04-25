import type { Metadata } from 'next';
import { Archivo_Black, Barlow, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import { CrisisBanner } from '@/components/CrisisBanner';
import '@/styles/globals.css';

// Ritual design system fonts (ritual-dapp-design skill)
// Archivo Black = open-source substitute for licensed Izoard display font
const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const barlow = Barlow({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MindVault — On-Chain AI Therapist',
  description:
    'Your mind, your chain, your keys. End-to-end encrypted mental wellness on Ritual Chain. Every session runs inside a TEE. No server ever sees your thoughts.',
  openGraph: {
    title: 'MindVault',
    description: 'On-chain AI therapist with ECIES-encrypted sessions on Ritual Chain.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${barlow.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-vault-bg font-body text-gray-300 min-h-screen flex flex-col">
        <Providers>
          {/* Crisis banner — permanently visible, non-dismissable */}
          <CrisisBanner />
          <main className="flex-1 flex flex-col relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
