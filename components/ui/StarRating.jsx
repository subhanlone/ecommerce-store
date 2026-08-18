/*
  Stars were `★`/`☆` text glyphs. Those pick up whatever the platform font
  decides, sit unpredictably on the baseline, and can only ever be full or
  empty — a 4.3 average had to round to 4. These are SVG, and the filled row is
  clipped to the exact fraction so 4.3 reads as 4.3.
*/

import { StarIcon } from "@/components/ui/icons";

export default function StarRating({ rating = 0, count, size = "sm" }) {
  const value = Number(rating) || 0;
  const clamped = Math.max(0, Math.min(5, value));
  const starSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  const label =
    count === 0 || value === 0
      ? "No ratings yet"
      : `Rated ${clamped.toFixed(1)} out of 5${typeof count === "number" ? ` from ${count} review${count === 1 ? "" : "s"}` : ""}`;

  return (
    <div className="flex items-center gap-1.5">
      {/* The visual pair is decorative; the accessible name lives on the wrapper. */}
      <span className="relative inline-flex" role="img" aria-label={label}>
        <span className="flex gap-0.5 text-line-strong" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} className={`${starSize} fill-current`} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-rating"
          style={{ width: `${(clamped / 5) * 100}%` }}
          aria-hidden="true"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} className={`${starSize} fill-current`} />
          ))}
        </span>
      </span>

      {typeof count === "number" && (
        <span className="text-xs text-text-subtle tabular">
          {value > 0 ? clamped.toFixed(1) : "No ratings"}
          {count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}
