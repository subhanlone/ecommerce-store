import { Children } from "react";
import { spring } from "motion";

/*
  Staggered entrance for a grid or list.

  This is a server component and ships no JavaScript.

  It was first written with motion/react, which was the wrong tool for this job:
  a JS entrance renders the items at opacity 0 on the server and only reveals
  them once hydration runs, so the product grid was blank until then — and would
  stay blank if scripts failed or were slow. On a product listing that is the
  one page that most needs to survive without JS.

  The fix is Motion's own recommended approach for server components: `spring()`
  resolves a spring to a CSS duration and `linear()` easing curve at render time
  on the server, so the motion is real spring physics but the browser runs it as
  a plain CSS animation. No animation library reaches the client.

  A cubic-bezier equivalent stays on `.reveal` in globals.css. If a browser does
  not understand `linear()` it drops that one inline declaration and animates
  with the stylesheet's curve instead — it never falls back to "invisible".
*/

/* visualDuration 0.3s with a little bounce: enough settle to feel physical,
   not enough to read as bouncy on a commerce grid. `spring()` returns
   "<duration> linear(...)", so split the two parts to set them separately and
   keep the stylesheet fallback intact. */
const [SPRING_DURATION, ...SPRING_EASE_PARTS] = String(spring(0.3, 0.12)).split(" ");
const SPRING_EASE = SPRING_EASE_PARTS.join(" ");

const STEP_MS = 40;
/* Cap the cascade so a long catalogue does not animate for seconds — past a
   dozen items the delay stops reading as rhythm and starts reading as lag. */
const MAX_STEPS = 11;

export default function Reveal({ children, className = "" }) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => (
        // h-full keeps cards equal height: this wrapper becomes the grid item,
        // so without it the card no longer stretches to fill the row.
        <div
          className="reveal h-full"
          style={{
            animationDuration: SPRING_DURATION,
            animationTimingFunction: SPRING_EASE,
            animationDelay: `${Math.min(index, MAX_STEPS) * STEP_MS}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
