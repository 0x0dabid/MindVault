import { WalletConnect } from '@/components/WalletConnect';
import { ChatWindow } from '@/components/ChatWindow';
import { WalletFundBanner } from '@/components/WalletFundBanner';
import { EncryptionBadge } from '@/components/EncryptionBadge';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-36px)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-vault-border shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-gray-100 hover:text-ritual-green transition-colors">
            MindVault
          </Link>
          <EncryptionBadge />
        </div>
        <WalletConnect />
      </nav>

      {/* Wallet fund prompt — gold warning if EOA has no RITUAL */}
      <WalletFundBanner />

      {/* Main chat */}
      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
}
