'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="px-4 py-2 rounded-lg border border-vault-teal/40 bg-vault-teal/10 text-vault-teal font-mono text-sm hover:bg-vault-teal/20 transition-colors"
              >
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                className="px-4 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 font-mono text-sm hover:bg-red-500/20 transition-colors"
              >
                Wrong network
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openChainModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-vault-border bg-vault-surface font-mono text-xs text-vault-muted hover:border-vault-teal/30 transition-colors"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    <img src={chain.iconUrl} alt={chain.name} className="w-3 h-3 rounded-full" />
                  )}
                  {chain.name}
                </button>
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-vault-border bg-vault-surface font-mono text-xs text-vault-text hover:border-vault-teal/30 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-vault-teal" />
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
