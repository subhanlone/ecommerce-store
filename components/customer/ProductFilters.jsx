"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function ProductFilters({ categories }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  /*
    A filter that is set should look different from one that isn't, otherwise
    you have to open the menu to find out why the grid is short.
  */
  const activeCategory = searchParams.get("category") || "";

  const selectClass = (active) =>
    `h-10 cursor-pointer rounded-lg border bg-surface px-3 text-sm transition-colors hover:border-text-subtle ${
      active ? "border-accent text-accent" : "border-line-strong text-text"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Filter by category"
        className={selectClass(Boolean(activeCategory))}
        value={activeCategory}
        onChange={(e) => updateParam("category", e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort products"
        className={selectClass(false)}
        value={searchParams.get("sort") || "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
    </div>
  );
}
