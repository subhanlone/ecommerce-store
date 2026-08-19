/*
  Icon registry.

  Icons come from Phosphor, imported through its `/dist/ssr` entry so they stay
  server components — no "use client" boundary is introduced anywhere they are
  used (StatusBadge, OrderProgress and ProductCard all render on the server).

  Phosphor over the alternatives for two reasons, both checked by rendering the
  same fourteen icons side by side at the sizes this app actually uses:

  1. Construction. Poppins is a geometric sans — circular bowls, single-storey
     a. Phosphor is drawn on the same logic: its magnifier is a true circle, its
     heart and star are rounder than Lucide's slightly humanist forms. Icons sit
     next to type constantly, so that match matters more than icon count.

  2. A weight axis. Stroke weight can compensate for size instead of one drawing
     being scaled to every size. At 16px a regular weight goes faint next to
     Poppins at 400; `bold` holds. Heroicons cannot do this — it only ships
     outline at 24px, solid at the smaller sizes, so small icons would have had
     to switch style rather than weight.

  `bold` is the default because 16-20px is nearly all of this app's icon usage.
  Anything rendered larger can pass `weight="regular"`, and toggled-on states
  pass `weight="fill"` for a genuinely solid drawing rather than a CSS fill of
  an outline shape.
*/

import {
  List,
  X,
  ShoppingCart,
  MagnifyingGlass,
  Heart,
  Star,
  Clock,
  ArrowsClockwise,
  Truck,
  CheckCircle,
  XCircle,
  Trash,
  PencilSimple,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

function icon(Component, displayName) {
  function Wrapped({ className = "h-5 w-5", weight = "bold", ...props }) {
    return (
      <Component className={className} weight={weight} aria-hidden="true" {...props} />
    );
  }
  Wrapped.displayName = displayName;
  return Wrapped;
}

export const MenuIcon = icon(List, "MenuIcon");
export const CloseIcon = icon(X, "CloseIcon");
export const CartIcon = icon(ShoppingCart, "CartIcon");
export const SearchIcon = icon(MagnifyingGlass, "SearchIcon");
export const HeartIcon = icon(Heart, "HeartIcon");
export const StarIcon = icon(Star, "StarIcon");
export const ClockIcon = icon(Clock, "ClockIcon");
export const RefreshIcon = icon(ArrowsClockwise, "RefreshIcon");
export const TruckIcon = icon(Truck, "TruckIcon");
export const CheckCircleIcon = icon(CheckCircle, "CheckCircleIcon");
export const XCircleIcon = icon(XCircle, "XCircleIcon");
export const TrashIcon = icon(Trash, "TrashIcon");
export const EditIcon = icon(PencilSimple, "EditIcon");
export const WarningIcon = icon(WarningCircle, "WarningIcon");
