import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, id, error, className = "", ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:border-accent ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Input;
