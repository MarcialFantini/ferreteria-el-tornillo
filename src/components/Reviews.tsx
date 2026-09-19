/**
 * Reviews.tsx — reseñas simples con localStorage.
 *
 * Persistencia por producto en `et:reviews:<slug>`. Si el storage está
 * vacío, sembramos dos reseñas editorial-curadas para que la sección
 * nunca arranque pelada.
 *
 * Validación:
 *   - nombre >= 2 chars
 *   - comentario >= 10 chars
 *   - rating entre 1 y 5
 *
 * UI: estrellas clickeables, lista de reseñas, count total, avg.
 * Optimista: la nueva reseña aparece sin esperar almacenamiento.
 */

import { useEffect, useMemo, useState } from "preact/hooks";

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: number;
}

interface Props {
  slug: string;
  productName: string;
  seedRating?: number;
}

const STORAGE_PREFIX = "et:reviews:";

const SEEDS: Record<string, Review[]> = {
  "amoladora-angular-4-bosch": [
    {
      id: "seed-1",
      name: "Mariano G.",
      rating: 5,
      comment:
        "La uso todos los fines de semana para cortar hierro en el taller de mi viejo. Ya tiene dos años y el carbón se consigue en el local sin problema.",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    },
    {
      id: "seed-2",
      name: "Carolina R.",
      rating: 4,
      comment:
        "Cómoda y viene con guarda. Hubiera preferido que el cable fuera un poco más largo, pero anduvo bien para mi obra chica.",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    },
  ],
  "martillo-carpintero-16oz-stanley": [
    {
      id: "seed-1",
      name: "Pedro L.",
      rating: 5,
      comment:
        "Compré dos: uno para mí y otro para mi hijo. Mango firme, no se mueve. Es el clásico que no falla.",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    },
  ],
};

function loadReviews(slug: string): Review[] {
  if (typeof window === "undefined") return SEEDS[slug] ?? [];
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + slug);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return SEEDS[slug] ?? [];
}

function saveReviews(slug: string, list: Review[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const day = 1000 * 60 * 60 * 24;
  if (diff < day) return "hoy";
  if (diff < day * 7) return `hace ${Math.floor(diff / day)} días`;
  if (diff < day * 30) return `hace ${Math.floor(diff / (day * 7))} sem`;
  if (diff < day * 365) return `hace ${Math.floor(diff / (day * 30))} meses`;
  return `hace ${Math.floor(diff / (day * 365))} años`;
}

export default function Reviews({ slug, productName, seedRating = 4.6 }: Props) {
  const [list, setList] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setList(loadReviews(slug));
    setIsHydrated(true);
  }, [slug]);

  const avg = useMemo(() => {
    if (list.length === 0) return seedRating;
    return list.reduce((s, r) => s + r.rating, 0) / list.length;
  }, [list, seedRating]);

  function handleSubmit(e: Event) {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    const trimmedComment = comment.trim();
    if (trimmedName.length < 2) {
      setError("Poné tu nombre (mínimo 2 letras).");
      return;
    }
    if (trimmedComment.length < 10) {
      setError("El comentario es muy corto. Contanos más (mín. 10 caracteres).");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Elegí una calificación entre 1 y 5 estrellas.");
      return;
    }
    const next: Review = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: trimmedName,
      rating,
      comment: trimmedComment,
      createdAt: Date.now(),
    };
    const updated = [next, ...list];
    setList(updated);
    saveReviews(slug, updated);
    setName("");
    setRating(5);
    setComment("");
    setShowForm(false);
  }

  return (
    <section aria-label="Reseñas" class="border-t border-[var(--color-navy)] pt-10">
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-line)] pb-4">
        <div>
          <p class="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-mustard-deep)]">
            Reseñas · {productName}
          </p>
          <h2 class="mt-1 font-display text-3xl font-bold tracking-tight text-[var(--color-navy)]">
            Lo que dicen quienes lo compraron
          </h2>
        </div>
        <div class="text-right">
          <p class="font-display text-4xl font-bold tabular-nums text-[var(--color-navy)]">
            {avg.toFixed(1)}<span class="text-[var(--color-mustard)]">★</span>
          </p>
          <p class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
            {list.length} {list.length === 1 ? "reseña" : "reseñas"}
          </p>
        </div>
      </header>

      <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul class="space-y-5">
          {list.length === 0 && (
            <li class="border border-dashed border-[var(--color-line)] bg-[var(--color-cream-deep)] p-6 text-center text-[14px] text-[var(--color-navy-muted)]">
              Sé el primero en dejar una reseña.
            </li>
          )}
          {list.map((r) => (
            <li
              key={r.id}
              class="border border-[var(--color-line)] bg-[var(--color-cream-soft)] p-5 transition-colors hover:border-[var(--color-navy)]"
            >
              <div class="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--color-line)] pb-2">
                <p class="font-display text-base font-bold text-[var(--color-navy)]">
                  {r.name}
                </p>
                <p class="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-navy-muted)]">
                  {timeAgo(r.createdAt)}
                </p>
              </div>
              <div class="mt-3 flex items-center gap-1 text-[var(--color-mustard-deep)]" aria-label={`${r.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    class={i < r.rating ? "opacity-100" : "opacity-20"}
                  >
                    ★
                  </span>
                ))}
                <span class="mono ml-2 text-[11px] tabular-nums text-[var(--color-navy)]">
                  {r.rating}/5
                </span>
              </div>
              <p class="mt-3 text-[14px] leading-relaxed text-[var(--color-navy)]">
                {r.comment}
              </p>
            </li>
          ))}
        </ul>

        <aside class="border border-[var(--color-navy)] bg-[var(--color-cream)]">
          <div class="border-b border-[var(--color-navy)] bg-[var(--color-navy)] p-4 text-[var(--color-cream)]">
            <p class="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-mustard)]">
              Tu opinión
            </p>
            <h3 class="font-display text-lg font-bold leading-tight">
              Dejar una reseña
            </h3>
          </div>
          <div class="p-4">
            {!showForm ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                class="mono w-full border border-[var(--color-navy)] bg-[var(--color-mustard)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-mustard-deep)]"
              >
                Escribir reseña
              </button>
            ) : (
              <form onSubmit={handleSubmit} class="space-y-3">
                <label class="block">
                  <span class="mono mb-1 block text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">Nombre</span>
                  <input
                    type="text"
                    value={name}
                    onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)}
                    placeholder="Cómo te llamás"
                    maxLength={40}
                    class="mono w-full border border-[var(--color-navy)] bg-[var(--color-cream)] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--color-mustard)]"
                  />
                </label>
                <fieldset>
                  <legend class="mono mb-1 block text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">Calificación</legend>
                  <div class="flex items-center gap-1 text-2xl text-[var(--color-mustard-deep)]">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        aria-label={`${n} estrella${n === 1 ? "" : "s"}`}
                        class={`transition-transform hover:scale-110 ${n <= rating ? "opacity-100" : "opacity-30"}`}
                      >
                        ★
                      </button>
                    ))}
                    <span class="mono ml-3 text-[11px] tabular-nums text-[var(--color-navy)]">
                      {rating}/5
                    </span>
                  </div>
                </fieldset>
                <label class="block">
                  <span class="mono mb-1 block text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">Comentario</span>
                  <textarea
                    rows={4}
                    value={comment}
                    onInput={(e) => setComment((e.currentTarget as HTMLTextAreaElement).value)}
                    placeholder="¿Qué te pareció? ¿Lo usarías de nuevo?"
                    maxLength={500}
                    class="w-full border border-[var(--color-navy)] bg-[var(--color-cream)] px-3 py-2 text-[13px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[var(--color-mustard)]"
                  />
                  <span class="mono mt-1 block text-right text-[10px] text-[var(--color-navy-muted)]">
                    {comment.length}/500
                  </span>
                </label>
                {error && (
                  <p class="border border-[var(--color-mark)] bg-[var(--color-mark)]/10 px-3 py-2 mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-mark)]">
                    {error}
                  </p>
                )}
                <div class="flex gap-2">
                  <button
                    type="submit"
                    class="mono flex-1 bg-[var(--color-navy)] py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-cream)] transition-colors hover:bg-[var(--color-mustard)] hover:text-[var(--color-navy)]"
                  >
                    Publicar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError(null);
                    }}
                    class="mono border border-[var(--color-navy)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
                  >
                    Cancelar
                  </button>
                </div>
                <p class="mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
                  * Se guarda en tu navegador; no se envía a ningún servidor.
                </p>
              </form>
            )}
            {isHydrated && (
              <noscript class="mono mt-3 block text-[10px] uppercase tracking-[0.16em] text-[var(--color-navy-muted)]">
                Las reseñas requieren JavaScript habilitado.
              </noscript>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}