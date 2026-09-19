/**
 * Toast — feedback no modal usado para confirmar add-to-cart
 * y mostrar el comparador lleno. Se monta al final del body.
 */

import { useState, useEffect } from "preact/hooks";

interface Props {
  message: string;
  tone?: "mustard" | "navy" | "mark";
  duration?: number;
  onDismiss?: () => void;
}

export default function Toast({
  message,
  tone = "mustard",
  duration = 2400,
  onDismiss,
}: Props) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => {
      setShow(false);
      onDismiss?.();
    }, duration);
    return () => window.clearTimeout(t);
  }, [duration, onDismiss]);

  const bg =
    tone === "navy"
      ? "bg-[var(--color-navy)] text-[var(--color-cream)]"
      : tone === "mark"
      ? "bg-[var(--color-mark)] text-[var(--color-cream)]"
      : "bg-[var(--color-mustard)] text-[var(--color-navy)]";

  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      class={`fixed bottom-6 left-1/2 z-50 toast-in -translate-x-1/2 ${bg} mono px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] shadow-[var(--shadow-ticket)]`}
    >
      {message}
    </div>
  );
}