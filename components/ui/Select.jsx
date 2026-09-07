import { forwardRef, useId } from "react";

/*
  Select, built to match Input exactly — same label/hint/error wiring, same
  height and border treatment — so a form mixing the two reads as one control
  set rather than two.

  It exists because the checkout province field must be a closed list: a
  free-text "State" box accepted anything, and an address the courier cannot
  route is worse than a rejected form.
*/
const Select = forwardRef(function Select(
  { label, id, error, hint, required, placeholder, options = [], className = "", ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {hint && !error && (
        <p id={hintId} className="text-xs text-text-subtle">
          {hint}
        </p>
      )}

      <select
        id={selectId}
        ref={ref}
        required={required}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`h-11 cursor-pointer rounded-lg border bg-surface px-3 text-sm text-text transition-colors ${
          error ? "border-danger" : "border-line-strong hover:border-text-subtle"
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
