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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Filter by category"
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        value={searchParams.get("category") || ""}
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
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        value={searchParams.get("sort") || "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
