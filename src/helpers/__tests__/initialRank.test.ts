import {describe, expect, it} from 'vitest'
import {LexoRank} from 'lexorank'

import {initialRank} from '../initialRank'

describe('initialRank', () => {
  it('handles invalid/non-string compareRankValue without throwing', () => {
    const action = () => initialRank(1 as unknown as string)
    expect(action).not.toThrow()

    const rank = action()
    expect(typeof rank).toBe('string')
    expect(() => LexoRank.parse(rank)).not.toThrow()
  })

  it('falls back to LexoRank.min when parse fails', () => {
    const rank = initialRank('not-a-rank', 'after')
    expect(() => LexoRank.parse(rank)).not.toThrow()
  })
})
