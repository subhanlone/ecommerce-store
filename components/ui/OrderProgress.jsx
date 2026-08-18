import { ORDER_STATUSES } from "@/lib/constants";
import { CheckCircleIcon, XCircleIcon } from "@/components/ui/icons";

/*
  The order lifecycle is a real sequence — Pending, then Processing, then
  Shipped, then Delivered — so laying it out as a track tells the customer
  something the badge alone can't: what has already happened, and what is still
  to come.

  Cancelled is deliberately not a step. It's an exit from the sequence, so it
  gets its own treatment rather than a fifth dot that implies it follows
  Delivered.
*/
const FLOW = ORDER_STATUSES.filter((status) => status !== "Cancelled");

export default function OrderProgress({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-danger-subtle px-4 py-3">
        <XCircleIcon className="h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-medium text-danger">This order was cancelled</p>
          <p className="text-xs text-text-muted">It will not be shipped or charged.</p>
        </div>
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(status);

  return (
    <ol className="flex items-start">
      {FLOW.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        const reached = done || current;

        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              {/* Leading half of the connector — hidden on the first step. */}
              <span
                className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : ""} ${
                  reached ? "bg-accent" : "bg-line"
                }`}
              />

              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-accent bg-accent text-accent-foreground"
                    : current
                      ? "border-accent bg-surface text-accent"
                      : "border-line bg-surface text-text-subtle"
                }`}
              >
                {done ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : (
                  /* A filled dot for the current step, an empty ring for the
                     ones still ahead — the state survives without colour. */
                  <span
                    className={`h-2 w-2 rounded-full ${current ? "bg-accent" : "bg-line-strong"}`}
                  />
                )}
              </span>

              <span
                className={`h-0.5 flex-1 ${i === FLOW.length - 1 ? "opacity-0" : ""} ${
                  done ? "bg-accent" : "bg-line"
                }`}
              />
            </div>

            <span
              className={`text-center text-xs ${
                current ? "font-semibold text-accent" : reached ? "text-text-muted" : "text-text-subtle"
              }`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
