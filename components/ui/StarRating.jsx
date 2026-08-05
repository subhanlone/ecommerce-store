export default function StarRating({ rating = 0, count, size = "sm" }) {
  const rounded = Math.round(rating);
  const textSize = size === "lg" ? "text-lg" : "text-sm";

  return (
    <div className="flex items-center gap-1">
      <span className={`${textSize} leading-none text-amber-500`} aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (i < rounded ? "★" : "☆")).join("")}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-neutral-500">
          {rating > 0 ? rating.toFixed(1) : "No ratings"}
          {count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}
