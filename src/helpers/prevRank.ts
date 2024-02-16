import {LexoRank} from 'lexorank'

// Use in initial value field by passing in the rank value of the last document
// If not value passed, generate a sensibly low rank
export default function prevRank(lastRankValue = ``): string {
  const lastRank = lastRankValue ? LexoRank.parse(lastRankValue) : LexoRank.min()
  const nextRank = lastRank.genPrev()

  return nextRank.toString()
}
