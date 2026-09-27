// Small 16px icons in the spirit of 2008 icon sets: flat colour, a darker
// outline, a little highlight. Drawn here rather than borrowed.

type P = { className?: string };
const base = { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": true } as const;

export const CalendarIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" fill="#fff" stroke="#6b7c93" />
    <rect x="1.5" y="2.5" width="13" height="4" rx="1.5" fill="#d9483b" stroke="#a3322a" />
    <rect x="4" y="1" width="1.5" height="3" rx=".5" fill="#6b7c93" />
    <rect x="10.5" y="1" width="1.5" height="3" rx=".5" fill="#6b7c93" />
    <path d="M4 9h2M7 9h2M10 9h2M4 12h2M7 12h2" stroke="#9aa7b8" strokeWidth="1.3" />
  </svg>
);

export const ClockIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="8" cy="8" r="6.5" fill="#fff" stroke="#6b7c93" />
    <circle cx="8" cy="8" r="5" fill="#eef3fa" />
    <path d="M8 4.5V8l2.5 1.5" stroke="#333" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </svg>
);

export const TicketIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path
      d="M1.5 4.5h13v2a1.5 1.5 0 0 0 0 3v2h-13v-2a1.5 1.5 0 0 0 0-3z"
      fill="#f7d774"
      stroke="#b8902a"
    />
    <path d="M10.5 5v6" stroke="#b8902a" strokeDasharray="1 1" />
  </svg>
);

export const PinIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 15s-4.5-5-4.5-8.5a4.5 4.5 0 0 1 9 0C12.5 10 8 15 8 15z" fill="#d9483b" stroke="#a3322a" />
    <circle cx="8" cy="6.5" r="1.7" fill="#fff" />
  </svg>
);

export const TvIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 1.5L8 4l3-2.5" stroke="#6b7c93" fill="none" />
    <rect x="1.5" y="4" width="13" height="10" rx="2" fill="#8a8f99" stroke="#4d525c" />
    <rect x="3" y="5.5" width="8" height="7" rx="1" fill="#9fd0f0" stroke="#4d525c" />
    <circle cx="12.7" cy="7" r=".8" fill="#333" />
    <circle cx="12.7" cy="10" r=".8" fill="#333" />
  </svg>
);
