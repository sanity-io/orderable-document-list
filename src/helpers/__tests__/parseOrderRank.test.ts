import {describe, expect, it} from 'vitest'
import {LexoRank} from 'lexorank'

import {parseOrderRank} from '../parseOrderRank'

describe('parseOrderRank', () => {
  it('parses valid lexorank strings', () => {
    const valid = '0|10000o:'
    const result = parseOrderRank(valid, LexoRank.min())

    expect(result).toEqual(LexoRank.parse(valid))
  })

  it('returns fallback for non-string values', () => {
    const fallback = LexoRank.max()

    expect(parseOrderRank(1, fallback)).toBe(fallback)
    expect(parseOrderRank(null, fallback)).toBe(fallback)
    expect(parseOrderRank(undefined, fallback)).toBe(fallback)
    expect(parseOrderRank({}, fallback)).toBe(fallback)
    expect(parseOrderRank([], fallback)).toBe(fallback)
  })

  it('returns fallback for invalid lexorank strings', () => {
    const fallback = LexoRank.min()

    expect(parseOrderRank('not-a-rank', fallback)).toBe(fallback)
    expect(parseOrderRank('invalid', fallback)).toBe(fallback)
    expect(parseOrderRank('', fallback)).toBe(fallback)
  })

  it('respects different fallback values', () => {
    const minFallback = LexoRank.min()
    const maxFallback = LexoRank.max()

    expect(parseOrderRank('invalid', minFallback)).toBe(minFallback)
    expect(parseOrderRank('invalid', maxFallback)).toBe(maxFallback)
  })
})
