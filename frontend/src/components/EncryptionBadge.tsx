'use client';

interface EncryptionBadgeProps {
  className?: string;
}

export function EncryptionBadge({ className = '' }: EncryptionBadgeProps) {
  return (
    <span
      title="Messages are encrypted end-to-end via ECIES before leaving your browser. Only your private key can decrypt them."
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] text-vault-muted select-none ${className}`}
    >
      <svg
        width="10"
        height="12"
        viewBox="0 0 10 12"
        fill="none"
        aria-hidden="true"
        className="text-vault-teal/60"
      >
        <rect x="1" y="5" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="5" cy="8.5" r="1" fill="currentColor" />
      </svg>
      End-to-end encrypted · TEE verified
    </span>
  );
}
