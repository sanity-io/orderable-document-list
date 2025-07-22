import {getPublishedId, getVersionFromId, isDraftId, isPublishedId, isVersionId} from 'sanity'
import {type SanityDocumentWithOrder} from '../types'

const isVersionForCurrentPerspective = (
  document: SanityDocumentWithOrder,
  perspectiveName: string,
  publishedId: string,
) => {
  return (
    document._id &&
    isVersionId(document._id) &&
    getVersionFromId(document._id) === perspectiveName &&
    getPublishedId(document._id) === publishedId
  )
}

// this removes dedupped docs from the list and makes sure that it keeps the right docs
// in the list while preserving the order established by the orderRank field
export const getFilteredDedupedDocs = (
  documents: SanityDocumentWithOrder[],
  perspectiveName?: string,
): SanityDocumentWithOrder[] => {
  // Flatten the documents array in case it's nested (like in test data)
  const flatDocuments = documents.flat()

  return flatDocuments.reduce<SanityDocumentWithOrder[]>((acc, cur) => {
    if (!cur._id) {
      return acc
    }

    // Handle version-only documents
    if (isVersionId(cur._id)) {
      const versionFromId = getVersionFromId(cur._id)
      const isCorrectVersion = versionFromId === perspectiveName

      // Only include versions that match the current perspective
      if (
        perspectiveName &&
        perspectiveName !== 'drafts' &&
        perspectiveName !== 'published' &&
        isCorrectVersion
      ) {
        return [...acc, cur]
      }
      return acc
    }

    // Handle published perspective - only include published documents
    if (perspectiveName === 'published') {
      if (isPublishedId(cur._id)) {
        return [...acc, cur]
      }
      return acc
    }

    // in situations where the document is not a draft, we need to check if
    // the version should override a published document or a draft
    if (!isDraftId(cur._id)) {
      const publishedId = getPublishedId(cur._id)

      const countNrPublished = JSON.stringify(flatDocuments).match(`/${publishedId}/g`)

      // Check if there's a version that matches the perspectiveName
      const hasMatchingVersion =
        perspectiveName && perspectiveName !== 'drafts' && perspectiveName !== 'published'
          ? flatDocuments.some((doc) =>
              isVersionForCurrentPerspective(doc, perspectiveName, publishedId),
            )
          : false

      // Check if there's a draft
      const hasDraft = flatDocuments.some((doc) => doc._id === `drafts.${cur._id}`)

      // Priority: version > draft > published
      // If there's a matching version, skip published
      if (hasMatchingVersion) {
        return acc
      }

      // eslint-disable-next-line max-nested-callbacks
      const alsoHasDraft = hasDraft || countNrPublished
      return alsoHasDraft ? acc : [...acc, cur]
    }

    // For drafts, check if there's a version for this document in version perspective
    if (perspectiveName && perspectiveName !== 'drafts' && perspectiveName !== 'published') {
      const baseId = getPublishedId(cur._id)
      const hasVersion = flatDocuments.some((doc) =>
        isVersionForCurrentPerspective(doc, perspectiveName, baseId),
      )

      // If there's a version for this document, skip the draft
      if (hasVersion) {
        return acc
      }
    }

    // Check if the draft has a published version
    cur.hasPublished = flatDocuments.some((doc) => doc._id === cur._id.replace(`drafts.`, ``))

    return [...acc, cur]
  }, [])
}
