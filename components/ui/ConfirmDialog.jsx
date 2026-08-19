"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Button from "@/components/ui/Button";
import { WarningIcon } from "@/components/ui/icons";

/*
  Destructive-action confirmation.

  Replaces window.confirm(), which blocked the whole tab, could not be styled,
  named its buttons "OK"/"Cancel" whatever the action was, and — worst of it —
  could not say *which* record was about to be deleted.

  Radix supplies the parts that are easy to get wrong by hand: focus is trapped
  while open and returned to the trigger on close, Escape closes, the rest of
  the page is inert and stops scrolling, and title/description are wired up with
  aria-labelledby/aria-describedby.

  The animation is CSS keyed off the data-state Radix sets (see globals.css).
  This was written with motion/react first, which was a mistake: a JS animation
  holds the panel at opacity 0 until its rAF loop runs, so anything that stalls
  rAF leaves an invisible-but-focus-trapping dialog over the page. CSS keyframes
  cannot fail that way, and match what the Radix docs themselves do.
*/
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  loading = false,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          data-dialog-overlay
          className="fixed inset-0 z-40 bg-text/50 backdrop-blur-[2px]"
        />

        <Dialog.Content
          data-dialog-panel
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-5 shadow-xl"
        >
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-subtle text-danger">
              <WarningIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-text">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-text-muted">
                {description}
              </Dialog.Description>
            </div>
          </div>

          {/* The destructive action sits apart from Cancel, and Cancel is the
              one that is safe to hit by reflex. */}
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm" disabled={loading}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
