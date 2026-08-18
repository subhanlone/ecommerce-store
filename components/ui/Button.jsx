const VARIANTS = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "bg-surface text-text border border-line-strong hover:bg-surface-muted",
  danger: "bg-danger text-white hover:bg-danger-hover",
  ghost: "text-text-muted hover:bg-surface-muted hover:text-text",
};

const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      /*
        Heights come from the size scale rather than vertical padding so that a
        button always clears the 44px touch minimum at `md` and up, and lines up
        with inputs of the same size when they sit side by side.
      */
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      /* A button mid-request must not be pressable twice. */
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
