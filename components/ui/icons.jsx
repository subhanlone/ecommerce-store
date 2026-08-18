/*
  One icon family, drawn on a 24x24 grid with a 1.75 stroke, so weights match
  wherever icons sit next to each other. Replaces the emoji that were standing
  in for the menu control — emoji render differently on every platform and
  can't take a colour from the design tokens.

  Icons are decorative by default (aria-hidden); the control that wraps them
  carries the accessible name.
*/

function Svg({ children, className = "h-5 w-5", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function CloseIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function CartIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" />
    </Svg>
  );
}

export function SearchIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Svg>
  );
}

export function HeartIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9z" />
    </Svg>
  );
}

/*
  Star is fill-based rather than stroked, on its own 20x20 grid: a partly
  filled row of stars is produced by clipping a filled row, which only works
  cleanly with a solid shape. Shared by the rating display and the rating
  input so the two can't drift apart.
*/
export function StarIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} aria-hidden="true">
      <path d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.6.94-5.5-4-3.9 5.53-.8z" />
    </svg>
  );
}

/* Status icons — these carry meaning alongside colour, so a badge is still
   readable in greyscale or by a colour-blind reader. */

export function ClockIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Svg>
  );
}

export function RefreshIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v4.5h-4.5" />
    </Svg>
  );
}

export function TruckIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 7h10v9H3zM13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </Svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.2l2.4 2.3 4.6-4.8" />
    </Svg>
  );
}

export function XCircleIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.4 9.4l5.2 5.2M14.6 9.4l-5.2 5.2" />
    </Svg>
  );
}
