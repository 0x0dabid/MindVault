'use client';

export function CrisisBanner() {
  return (
    <div
      role="alert"
      aria-label="Crisis resources"
      className="w-full bg-amber-950/40 border-b border-amber-600/30 px-4 py-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs font-mono"
    >
      <span className="text-amber-400 font-semibold shrink-0">Crisis Support</span>
      <span className="text-amber-200/80">
        988 Suicide &amp; Crisis Lifeline — <strong>call or text 988</strong>
      </span>
      <span className="text-amber-200/80">
        Crisis Text Line — <strong>text HOME to 741741</strong>
      </span>
      <span className="text-amber-200/60 text-[10px] ml-auto shrink-0">
        MindVault is not a substitute for professional mental health care.
      </span>
    </div>
  );
}
