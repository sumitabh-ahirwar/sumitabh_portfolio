// Brand glyphs drawn inline (Lucide v1 no longer ships brand icons).
export function GitHubIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h3.96V21H3V9.75Zm6.46 0h3.8v1.54h.05c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.07V21h-3.96v-5.04c0-1.2-.02-2.75-1.67-2.75-1.68 0-1.93 1.31-1.93 2.66V21H9.46V9.75Z" />
    </svg>
  );
}

/** The site mark: three linked nodes forming an abstract "A". */
export function Mark({ size = 28, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="mark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5ee7ff" />
          <stop offset="1" stopColor="#4d7dff" />
        </linearGradient>
      </defs>
      <rect x=".5" y=".5" width="31" height="31" rx="8" fill="#070b16" stroke="rgba(140,170,255,.25)" />
      <path
        d="M9 22.5 16 8.5l7 14M11.6 17.3h8.8"
        fill="none"
        stroke="url(#mark-g)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="8.5" r="2.4" fill="#5ee7ff" />
      <circle cx="9" cy="22.5" r="2.1" fill="#4d7dff" />
      <circle cx="23" cy="22.5" r="2.1" fill="#9a8cff" />
    </svg>
  );
}
