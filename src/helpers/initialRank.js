import {LexoRank} from 'lexorank'

// Use in initial value field by passing in the rank value of the last document
// If not value passed, generate a sensibly low rank
export default function initialRank(lastRankValue = ``) {
  const lastRank = lastRankValue ? LexoRank.parse(lastRankValue) : LexoRank.min()
  const nextRank = lastRank.genNext().genNext()

  return nextRank.value
}
