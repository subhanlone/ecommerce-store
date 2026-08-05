const VARIANTS = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export default function Button({
  variant = "primary",
  className = "",
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
