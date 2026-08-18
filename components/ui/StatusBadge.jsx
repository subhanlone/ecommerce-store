import {
  ClockIcon,
  RefreshIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@/components/ui/icons";

/*
  Single source of truth for how an order status looks. The customer's order
  list, the customer's order detail page and the admin order table each used to
  carry their own copy of this map, so they could drift apart.

  Every status pairs a colour with an icon: colour alone can't be the carrier of
  meaning for a reader who can't distinguish the hues.
*/
export const STATUS_META = {
  Pending: { Icon: ClockIcon, bg: "--status-pending-bg", fg: "--status-pending-fg" },
  Processing: { Icon: RefreshIcon, bg: "--status-processing-bg", fg: "--status-processing-fg" },
  Shipped: { Icon: TruckIcon, bg: "--status-shipped-bg", fg: "--status-shipped-fg" },
  Delivered: { Icon: CheckCircleIcon, bg: "--status-delivered-bg", fg: "--status-delivered-fg" },
  Cancelled: { Icon: XCircleIcon, bg: "--status-cancelled-bg", fg: "--status-cancelled-fg" },
};

const SIZES = {
  sm: "gap-1 px-2 py-0.5 text-xs",
  md: "gap-1.5 px-2.5 py-1 text-sm",
};

export default function StatusBadge({ status, size = "sm", className = "" }) {
  const meta = STATUS_META[status];
  if (!meta) return null;

  const { Icon } = meta;
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${SIZES[size]} ${className}`}
      style={{ backgroundColor: `var(${meta.bg})`, color: `var(${meta.fg})` }}
    >
      <Icon className={iconSize} />
      {status}
    </span>
  );
}
