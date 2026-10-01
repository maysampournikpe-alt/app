/** Rumbo logo: a compass needle over a sunset — "finding your direction". */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="16" fill="#0b6b66" />
      <circle cx="32" cy="34" r="18" fill="#f59e0b" opacity="0.95" />
      <path d="M8 44h48v12a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8z" fill="#08534f" />
      <path d="M32 12 40 34 32 30 24 34z" fill="#ffffff" />
      <path d="M32 56 24 34 32 38 40 34z" fill="#fde6d6" />
    </svg>
  );
}
