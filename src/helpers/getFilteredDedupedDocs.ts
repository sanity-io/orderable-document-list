import {getPublishedId, getVersionFromId, isDraftId, isPublishedId, isVersionId} from 'sanity'
import {type SanityDocumentWithOrder} from '../types'

// this removes dedupped docs (specifically versions) from the list and makes sure that it keeps the right docs
// in the list
export const getFilteredDedupedDocs = (
  documents: SanityDocumentWithOrder[],
  perspectiveName?: string,
): SanityDocumentWithOrder[] => {
  return documents.reduce<SanityDocumentWithOrder[]>((acc, cur) => {
    const baseId = getPublishedId(cur._id)
    const existingIndex = acc.findIndex((doc) => getPublishedId(doc._id) === baseId)
    const existingDoc = existingIndex >= 0 ? acc[existingIndex] : null

    // Determine if this document should be included and if it should replace existing
    let shouldInclude = false
    let shouldReplace = false

    // where published and drafts will be shown
    if (perspectiveName === 'drafts') {
      // should include draft or published document that doesn't have a version
      shouldInclude = (isDraftId(cur._id) || isPublishedId(cur._id)) && !isVersionId(cur._id)
      // should be replaced if the existingDoc exists and the existing doc is not a draft but the current is
      // priority is draft > published
      shouldReplace = Boolean(existingDoc && isDraftId(cur._id) && !isDraftId(existingDoc._id))
    }
    // where only publisheddocs will be shown
    else if (perspectiveName === 'published') {
      // should include published document
      shouldInclude = !isDraftId(cur._id) && !isVersionId(cur._id)
      // should be replaced if the existingDoc exists and the existing doc is not a published
      // but the current one that is being evalualed is
      // priority is published
      shouldReplace = Boolean(
        existingDoc && isPublishedId(cur._id) && !isPublishedId(existingDoc._id),
      )
    } else {
      const versionFromId = getVersionFromId(cur._id)
      const isCorrectVersion = versionFromId === perspectiveName
      // should include if the version that is being evaluated exists in the release selected
      // or if the document is a draft or published (as fallbacks)
      shouldInclude = isCorrectVersion || isDraftId(cur._id) || isPublishedId(cur._id)
      // should be replaced if the existingDoc exists and the current doc has higher priority
      // priority is version > draft > published
      shouldReplace = Boolean(
        existingDoc &&
          ((isCorrectVersion && !isVersionId(existingDoc._id)) ||
            (isDraftId(cur._id) && !isDraftId(existingDoc._id) && !isVersionId(existingDoc._id)) ||
            (isPublishedId(cur._id) &&
              !isPublishedId(existingDoc._id) &&
              !isVersionId(existingDoc._id) &&
              !isDraftId(existingDoc._id))),
      )
    }

    if (shouldInclude) {
      if (!existingDoc) {
        acc.push(cur)
      } else if (shouldReplace) {
        acc[existingIndex] = cur
      }
    }

    return acc
  }, [])
}
