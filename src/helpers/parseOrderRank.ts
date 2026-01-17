import {LexoRank} from 'lexorank'

// Safely parse a LexoRank string; fall back if invalid
export function parseOrderRank(value: unknown, fallback: LexoRank): LexoRank {
  if (typeof value !== 'string') {
    console.warn('[orderable-document-list] Invalid orderRank value (expected string):', value)
    return fallback
  }

  try {
    return LexoRank.parse(value)
  } catch (err) {
    console.warn(
      '[orderable-document-list] Failed to parse orderRank value:',
      value,
      'Error:',
      err instanceof Error ? err.message : String(err),
    )
    return fallback
  }
}
