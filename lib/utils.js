import { CURRENCY_SYMBOL, LOCALE } from "@/lib/constants";

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/*
  Money.

  Prices were previously written as `${value.toFixed(2)}` inline in thirteen
  separate files — the same duplication that let order-status colours drift
  apart across four. One function means the currency is defined once.

  Rupees are quoted without paisa: sub-rupee amounts are not used in Pakistani
  retail, and a trailing ".00" on every price is noise. Grouping follows en-PK,
  so thousands read as 8,999 rather than 8999.
*/
export function formatPrice(value) {
  const amount = Number(value) || 0;
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/*
  Dates.

  `new Date(x).toLocaleDateString()` with no locale resolves against whatever
  machine runs it — the server during SSR, the browser on hydration. Those
  disagree whenever the two are configured differently, which is both a
  hydration mismatch and a store that shows US-style dates to Pakistani
  customers. Pinning the locale and the timezone removes both.
*/
export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });
}
