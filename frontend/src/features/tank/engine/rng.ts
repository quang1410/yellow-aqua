/** Một bước mulberry32: trả về [giá trị trong [0,1), state kế tiếp]. */
export function nextRandom(state: number): [number, number] {
  const s = (state + 0x6d2b79f5) >>> 0
  let t = s
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s]
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    const [v, next] = nextRandom(state)
    state = next
    return v
  }
}
