'use client';

// TEE Verified badge — green bg/border per ritual-dapp-design skill.
// "Green = trust" — signals enclave-computed, verifiable result.
interface EncryptionBadgeProps {
  className?: string;
  variant?: 'tee' | 'ecies';
}

export function EncryptionBadge({ className = '', variant = 'tee' }: EncryptionBadgeProps) {
  if (variant === 'ecies') {
    return (
      <span
        title="Messages are ECIES-encrypted client-side before submission. Only your private key decrypts the response."
        className={`inline-flex items-center gap-1.5 font-mono text-[10px] text-gray-400 select-none ${className}`}
      >
        <svg width="8" height="10" viewBox="0 0 10 12" fill="none" aria-hidden="true" className="text-vault-teal/60">
          <rect x="1" y="5" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="5" cy="8.5" r="1" fill="currentColor" />
        </svg>
        ECIES encrypted
      </span>
    );
  }

  return (
    <span
      title="This response was computed inside a Trusted Execution Environment. The result is verifiable on Ritual Chain."
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px]
                  bg-ritual-green/10 text-ritual-green border border-ritual-green/20 select-none ${className}`}
    >
      <span aria-hidden="true" className="text-[9px]">◈</span>
      TEE Verified
    </span>
  );
}
