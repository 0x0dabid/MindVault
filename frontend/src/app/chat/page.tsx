import { WalletConnect } from '@/components/WalletConnect';
import { ChatWindow } from '@/components/ChatWindow';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-36px)]">
      <nav className="flex items-center justify-between px-6 py-3 border-b border-vault-border shrink-0">
        <Link href="/" className="font-serif text-vault-text hover:text-vault-teal transition-colors">
          MindVault
        </Link>
        <WalletConnect />
      </nav>
      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
}
