import {LexoRank} from 'lexorank'
import {NewItemPosition} from '../types'
import {parseOrderRank} from './parseOrderRank'

// Use in initial value field by passing in the rank value of the last document
// If not value passed, generate a sensibly low rank
export function initialRank(
  compareRankValue = ``,
  newItemPosition: NewItemPosition = 'after',
): string {
  const compareRank = parseOrderRank(compareRankValue, LexoRank.min())
  const rank =
    newItemPosition === 'before' ? compareRank.genPrev().genPrev() : compareRank.genNext().genNext()

  return rank.toString()
}
