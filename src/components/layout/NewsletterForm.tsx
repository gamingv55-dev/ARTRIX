"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { track } from "@/lib/analytics";
import { duration, ease } from "@/motion/tokens";

type Status = "idle" | "submitting" | "done" | "error";

/**
 * Drop-announcement signup.
 *
 * The form is real: it validates, posts to /api/newsletter, handles failure
 * and reports its state. What sits behind that route is not — the handler
 * validates and returns, and no address is stored or sent anywhere. That is
 * the one honest place to leave a seam, and it is marked in the route file
 * as well as in docs/architecture.md.
 *
 * Styled as a line rather than a box: an input with a dashed rule under it and
 * the submit as a text action, matching the CTA language used everywhere else.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message ?? "That did not work. Try again.");
        return;
      }

      setStatus("done");
      setMessage(data.message ?? "You are on the list.");
      setEmail("");
      track({ name: "newsletter_signup", source: "footer" });
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div className="flex items-baseline gap-4">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          aria-describedby="newsletter-note"
          aria-invalid={status === "error"}
          className="min-w-0 flex-1 bg-transparent py-2 type-label text-[var(--figure)] placeholder:text-[var(--figure-muted)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex shrink-0 items-center gap-2.5 type-label text-[var(--figure)] disabled:opacity-50"
        >
          {status === "submitting" ? "Sending" : "Subscribe"}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
          >
            &#8594;
          </span>
        </button>
      </div>

      <div className="rule-dashed mt-1 text-[var(--figure)]" />

      <div id="newsletter-note" aria-live="polite" className="mt-3 min-h-[1rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={message ?? "default"}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast, ease: ease.outExpo }}
            className={
              status === "error"
                ? "type-micro text-[var(--color-alert)]"
                : status === "done"
                  ? "type-micro text-[var(--color-signal)]"
                  : "type-micro text-[var(--figure-muted)]"
            }
          >
            {message ?? "No spam. Drop announcements only."}
          </motion.p>
        </AnimatePresence>
      </div>
    </form>
  );
}
