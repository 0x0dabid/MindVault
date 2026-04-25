'use client';

// Crisis banner — permanently visible on every page, non-dismissable.
// Spec: #1A1D2A background, gray-400 text, phone numbers in gray-100, single line.
export function CrisisBanner() {
  return (
    <div
      role="alert"
      aria-label="Crisis resources — always visible"
      className="w-full border-b border-vault-border bg-vault-border/60 px-4 py-2
                 flex flex-wrap items-center gap-x-5 gap-y-0.5"
      style={{ backgroundColor: '#1A1D2A' }}
    >
      <span className="font-mono text-[10px] text-gray-400 shrink-0">
        If you're in crisis:
      </span>
      <span className="font-mono text-[10px] text-gray-100">
        <strong>988</strong> Suicide &amp; Crisis Lifeline — call or text 988
      </span>
      <span className="font-mono text-[10px] text-gray-400 hidden sm:inline">|</span>
      <span className="font-mono text-[10px] text-gray-100">
        Crisis Text Line — text <strong>HOME</strong> to 741741
      </span>
      <span className="font-mono text-[10px] text-gray-500 ml-auto hidden lg:inline shrink-0">
        MindVault is not a substitute for professional mental health care
      </span>
    </div>
  );
}
