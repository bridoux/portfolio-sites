/**
 * Loads a numbered image sequence for scroll scrubbing: the first frame eagerly, then the
 * rest in order, so the hero paints fast and scrubbing fills in while the visitor reads.
 */
export interface FrameSequence {
  /** Nearest frame to `index` that has finished loading (or null before the first one). */
  nearest(index: number): HTMLImageElement | null
  dispose(): void
}

export function frameUrl(base: string, i: number): string {
  return `${base}${String(i).padStart(3, '0')}.webp`
}

export function loadFrameSequence(base: string, count: number, onFirst: () => void, concurrency = 6): FrameSequence {
  const frames: (HTMLImageElement | null)[] = new Array(count).fill(null)
  let disposed = false
  let next = 1

  const load = (i: number) => new Promise<void>((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (!disposed) frames[i] = img
      resolve()
    }
    img.onerror = () => resolve() // a missing frame falls back to its neighbours
    img.src = frameUrl(base, i)
  })

  const worker = async () => {
    while (!disposed && next < count) await load(next++)
  }

  load(0).then(() => {
    if (disposed) return
    onFirst()
    for (let k = 0; k < concurrency; k++) void worker()
  })

  return {
    nearest(index) {
      const i = Math.max(0, Math.min(count - 1, Math.round(index)))
      for (let d = 0; d < count; d++) {
        const lo = frames[i - d]
        if (lo) return lo
        const hi = frames[i + d]
        if (hi) return hi
      }
      return null
    },
    dispose() { disposed = true },
  }
}
