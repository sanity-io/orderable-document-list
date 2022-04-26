import {LexoRank} from 'lexorank'
import {ORDER_FIELD_NAME} from './constants'

function lexicographicalSort(a, b) {
  if (a[ORDER_FIELD_NAME] < b[ORDER_FIELD_NAME]) {
    return -1
  }
  if (a[ORDER_FIELD_NAME] > b[ORDER_FIELD_NAME]) {
    return 1
  }
  return 0
}

// In lieu of actual *tests*, this is a table
// to visualise the new order which if correct, shows:
// 1. The `before` field (or start of the list)
// 2. The inserted fields, in order
// 3. The `after` document (or end of the list)
// eslint-disable-next-line no-unused-vars
function createManifest({entities, selectedItems, isMovingUp, curIndex, nextIndex, prevIndex}) {
  const table = [
    {
      name: `Before`,
      title:
        curIndex === 0 ? `<<Start of List>>` : entities[isMovingUp ? prevIndex : curIndex]?.title,
      order: curIndex === 0 ? `000` : entities[isMovingUp ? prevIndex : curIndex][ORDER_FIELD_NAME],
    },
    ...selectedItems.map((item, itemIndex) => ({
      name: itemIndex,
      title: item?.title,
      order: item[ORDER_FIELD_NAME],
    })),
    {
      name: `After`,
      title:
        curIndex === entities.length - 1
          ? `<<End of List>>`
          : entities[isMovingUp ? curIndex : nextIndex]?.title,
      order:
        curIndex === entities.length - 1
          ? `zzz`
          : entities[isMovingUp ? curIndex : nextIndex][ORDER_FIELD_NAME],
    },
  ]

  return table.sort(lexicographicalSort)
}

export const reorderDocuments = ({entities, selectedIds, source, destination, debug = false}) => {
  const startIndex = source.index
  const endIndex = destination.index
  const isMovingUp = startIndex > endIndex
  const selectedItems = entities.filter((item) => selectedIds.includes(item._id))
  const message = [
    `Moved`,
    selectedItems.length === 1 ? `1 Document` : `${selectedItems.length} Documents`,
    isMovingUp ? `up` : `down`,
    `from position`,
    `${startIndex + 1} to ${endIndex + 1}`,
  ].join(' ')

  const {all, selected} = entities.reduce(
    (acc, cur, curIndex) => {
      // Selected items get spread in below, so skip them here
      if (selectedIds.includes(cur._id)) {
        return {all: acc.all, selected: acc.selected}
      }

      // Drop seleced items in
      if (curIndex === endIndex) {
        const prevIndex = curIndex - 1
        const prevRank = entities[prevIndex]?.[ORDER_FIELD_NAME]
          ? LexoRank.parse(entities[prevIndex]?.[ORDER_FIELD_NAME])
          : LexoRank.min()

        const curRank = LexoRank.parse(entities[curIndex][ORDER_FIELD_NAME])

        const nextIndex = curIndex + 1
        const nextRank = entities[nextIndex]?.[ORDER_FIELD_NAME]
          ? LexoRank.parse(entities[nextIndex]?.[ORDER_FIELD_NAME])
          : LexoRank.max()

        let betweenRank = isMovingUp ? prevRank.between(curRank) : curRank.between(nextRank)

        // For each selected item, assign a new orderRank between now and next
        for (let selectedIndex = 0; selectedIndex < selectedItems.length; selectedIndex += 1) {
          selectedItems[selectedIndex][ORDER_FIELD_NAME] = betweenRank.value
          betweenRank = isMovingUp ? betweenRank.between(curRank) : betweenRank.between(nextRank)
        }

        return {
          // The `all` array gets sorted by order field later anyway
          // so that this probably isn't necessary ¯\_(ツ)_/¯
          all: isMovingUp
            ? [...acc.all, ...selectedItems, cur]
            : [...acc.all, cur, ...selectedItems],
          selected: selectedItems,
        }
      }

      return {all: [...acc.all, cur], selected: acc.selected}
    },
    {all: [], selected: []}
  )

  const patches = selected.map((doc) => {
    return [
      doc._id,
      {
        set: {
          [ORDER_FIELD_NAME]: doc[ORDER_FIELD_NAME],
        },
      },
    ]
  })

  // Safety-check to make sure everything is in order
  const allSorted = all.sort(lexicographicalSort)

  return {newOrder: allSorted, patches, message}
}
