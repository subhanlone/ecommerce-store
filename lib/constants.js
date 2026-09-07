export const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

/*
  The store operates in Pakistan: prices are in rupees and every address is
  domestic. Keeping these here means the currency and the province list have
  one definition, the way ORDER_STATUSES does — the alternative is the same
  string repeated across a dozen files and drifting.
*/
export const CURRENCY_SYMBOL = "Rs";
export const LOCALE = "en-PK";
export const COUNTRY = "Pakistan";

/* The four provinces plus the federal capital and the two administrative
   territories — the set a Pakistani delivery address can actually name. */
export const PK_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
];
