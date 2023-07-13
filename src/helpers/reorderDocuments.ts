import {LexoRank} from 'lexorank'
import type {PatchOperations} from 'sanity'

import {SanityDocumentWithOrder} from '../types'
import {ORDER_FIELD_NAME} from './constants'

export interface MaifestArgs {
  entities: SanityDocumentWithOrder[]
  selectedItems: SanityDocumentWithOrder[]
  isMovingUp: boolean
  curIndex: number
  nextIndex: number
  prevIndex: number
}

export interface ReorderArgs {
  entities: SanityDocumentWithOrder[]
  selectedIds: string[]
  source: any
  destination: any
}

export interface ReorderReturn {
  newOrder: SanityDocumentWithOrder[]
  patches: [string, PatchOperations][]
  message: any
}

function lexicographicalSort(a: SanityDocumentWithOrder, b: SanityDocumentWithOrder) {
  if (!a[ORDER_FIELD_NAME] || !b[ORDER_FIELD_NAME]) {
    return 0
  } else if (a[ORDER_FIELD_NAME] < b[ORDER_FIELD_NAME]) {
    return -1
  } else if (a[ORDER_FIELD_NAME] > b[ORDER_FIELD_NAME]) {
    return 1
  }
  return 0
}

export const reorderDocuments = ({
  entities,
  selectedIds,
  source,
  destination,
}: ReorderArgs): ReorderReturn => {
  const startIndex = source.index
  const endIndex = destination.index
  const isMovingUp = startIndex > endIndex
  const selectedItems = entities.filter((item) => selectedIds.includes(item._id))
  const message = [
    `Moved`,
    selectedItems.length === 1 ? `1 document` : `${selectedItems.length} documents`,
    isMovingUp ? `up` : `down`,
    `from position`,
    `${startIndex + 1} to ${endIndex + 1}`,
  ].join(' ')

  const {all, selected} = entities.reduce<{
    all: SanityDocumentWithOrder[]
    selected: SanityDocumentWithOrder[]
  }>(
    (acc, cur, curIndex) => {
      // Selected items get spread in below, so skip them here
      if (selectedIds.includes(cur._id)) {
        return {all: acc.all, selected: acc.selected}
      }

      // Drop selected items in
      if (curIndex === endIndex) {
        const prevIndex = curIndex - 1
        const prevRank = entities[prevIndex]?.[ORDER_FIELD_NAME]
          ? LexoRank.parse(entities[prevIndex]?.[ORDER_FIELD_NAME] as string)
          : LexoRank.min()

        const curRank = LexoRank.parse(entities[curIndex][ORDER_FIELD_NAME] as string)

        const nextIndex = curIndex + 1
        const nextRank = entities[nextIndex]?.[ORDER_FIELD_NAME]
          ? LexoRank.parse(entities[nextIndex]?.[ORDER_FIELD_NAME] as string)
          : LexoRank.max()

        let betweenRank = isMovingUp ? prevRank.between(curRank) : curRank.between(nextRank)

        // For each selected item, assign a new orderRank between now and next
        for (let selectedIndex = 0; selectedIndex < selectedItems.length; selectedIndex += 1) {
          selectedItems[selectedIndex][ORDER_FIELD_NAME] = betweenRank.toString()
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

  const patches = selected.flatMap((doc) => {
    const docPatches: [string, PatchOperations][] = [
      [
        doc._id,
        {
          set: {
            [ORDER_FIELD_NAME]: doc[ORDER_FIELD_NAME],
          },
        },
      ],
    ]

    // If it's a draft, we need to patch the published document as well
    if (doc._id.startsWith(`drafts.`) && doc.hasPublished) {
      docPatches.push([
        doc._id.replace(`drafts.`, ``),
        {
          set: {
            [ORDER_FIELD_NAME]: doc[ORDER_FIELD_NAME],
          },
        },
      ])
    }

    return docPatches
  })

  // Safety-check to make sure everything is in order
  const allSorted = all.sort(lexicographicalSort)

  return {newOrder: allSorted, patches, message}
}
