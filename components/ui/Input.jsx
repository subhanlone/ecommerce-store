import { forwardRef, useId } from "react";

const Input = forwardRef(function Input(
  { label, id, error, hint, required, className = "", ...props },
  ref
) {
  /*
    Fall back to a generated id so the label/input association still holds when
    a caller forgets to pass one — an unlabelled field is an accessibility
    failure the brief calls out directly (section 4, Accessibility).
  */
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Persistent hint, rather than a placeholder that vanishes on focus. */}
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-subtle">
          {hint}
        </p>
      )}

      <input
        id={inputId}
        ref={ref}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`h-11 rounded-lg border bg-surface px-3 text-sm text-text transition-colors placeholder:text-text-subtle ${
          error ? "border-danger" : "border-line-strong hover:border-text-subtle"
        } ${className}`}
        {...props}
      />

      {/* role="alert" so the message is announced when it appears, not silently painted. */}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
