import {describe, it, expect} from 'vitest'
import {type SanityDocumentWithOrder} from '../../types'
import {getFilteredDedupedDocs} from '../getFilteredDedupedDocs'

describe('getFilteredDedupedDocs', () => {
  const mockDocumentsFromVersionPerspective: SanityDocumentWithOrder[] = [
    {
      _id: 'drafts.document-1',
      _type: 'orderableCategory',
      orderRank: '0|10000o:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'versions.rmWGG9z1W.document-2',
      _type: 'orderableCategory',
      orderRank: '0|100014:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'drafts.document-3',
      _type: 'orderableCategory',
      orderRank: '0|10001k:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'document-4',
      _type: 'orderableCategory',
      orderRank: '0|100020:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'versions.rmWGG9z1W.document-6',
      _type: 'orderableCategory',
      orderRank: '0|10002w:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'document-5',
      _type: 'orderableCategory',
      orderRank: '0|100034:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'drafts.document-5',
      _type: 'orderableCategory',
      orderRank: '0|100034:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'document-9',
      _type: 'orderableCategory',
      orderRank: '0|10003c:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'drafts.document-8',
      _type: 'orderableCategory',
      orderRank: '0|10003s:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'versions.rmWGG9z1W.document-3',
      _type: 'orderableCategory',
      orderRank: '0|100048:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
  ]

  const mockDocumentsInDraftsPerspective: SanityDocumentWithOrder[] = [
    {
      _id: 'drafts.document-1',
      _type: 'orderableCategory',
      orderRank: '0|10000o:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'drafts.document-3',
      _type: 'orderableCategory',
      orderRank: '0|10001k:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'document-4',
      _type: 'orderableCategory',
      orderRank: '0|100020:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'document-5',
      _type: 'orderableCategory',
      orderRank: '0|100034:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'drafts.document-5',
      _type: 'orderableCategory',
      orderRank: '0|100034:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'document-7',
      _type: 'orderableCategory',
      orderRank: '0|10003c:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'drafts.document-8',
      _type: 'orderableCategory',
      orderRank: '0|10003s:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
  ]

  const mockDocumentsPublishedPerspective: SanityDocumentWithOrder[] = [
    {
      _id: '123',
      _type: 'orderableCategory',
      orderRank: '0|100035:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: '456',
      _type: 'orderableCategory',
      orderRank: '0|100036:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: '789',
      _type: 'orderableCategory',
      orderRank: '0|10003h:',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
  ]

  it('should filter and deduplicate documents in draft perspective', () => {
    const result = getFilteredDedupedDocs(
      mockDocumentsInDraftsPerspective as SanityDocumentWithOrder[],
      'drafts',
    )

    // Should only include drafts and published (if it doesn't have a published)
    expect(result).toHaveLength(6)
    expect(result.map((doc) => doc._id)).toEqual([
      'drafts.document-1',
      'drafts.document-3',
      'document-4',
      'drafts.document-5',
      'document-7',
      'drafts.document-8',
    ])
  })

  it('should prioritize drafts over published in draft perspective', () => {
    const documentsWithDuplicates = [
      {
        _id: 'drafts.123',
        _type: 'test',
        orderRank: 'a',
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _rev: '123',
      },
      {
        _id: '123',
        _type: 'test',
        orderRank: 'b',
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _rev: '123',
      },
    ]

    const result = getFilteredDedupedDocs(documentsWithDuplicates, 'drafts')

    // Should only show the draft version
    expect(result).toHaveLength(1)
    expect(result[0]._id).toBe('drafts.123')
  })

  it('should filter and deduplicate documents in published perspective', () => {
    const result = getFilteredDedupedDocs(mockDocumentsPublishedPerspective, 'published')

    // Should only include published documents
    expect(result).toHaveLength(3)
    expect(result.map((doc) => doc._id)).toEqual(['123', '456', '789'])
  })

  it('should filter and deduplicate documents in version perspective', () => {
    const result = getFilteredDedupedDocs(
      mockDocumentsFromVersionPerspective as SanityDocumentWithOrder[],
      'rmWGG9z1W',
    )

    // Should include versions for the specific release, drafts, and published
    expect(result).toHaveLength(8)
    expect(result.map((doc) => doc._id)).toEqual([
      'drafts.document-1',
      'versions.rmWGG9z1W.document-2',
      'document-4',
      'versions.rmWGG9z1W.document-6',
      'drafts.document-5',
      'document-9',
      'drafts.document-8',
      'versions.rmWGG9z1W.document-3',
    ])
  })

  it('should prioritize versions over drafts in version perspective', () => {
    const documentsWithVersionAndDraft: SanityDocumentWithOrder[] = [
      {
        _id: 'drafts.document-1',
        _type: 'orderableCategory',
        orderRank: '0|10001k:',
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _rev: '123',
      },
      {
        _id: 'versions.rEZnogJnx.document-1',
        _type: 'orderableCategory',
        orderRank: '0|10000o:',
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _rev: '123',
      },
    ]

    const result = getFilteredDedupedDocs(documentsWithVersionAndDraft, 'rEZnogJnx')

    // Should prioritize the version over the draft
    expect(result).toHaveLength(1)
    expect(result.map((doc) => doc._id)).toEqual(['versions.rEZnogJnx.document-1'])
  })

  it('should show draft of other versions when the selected version doesnt exist for the document', () => {
    const result = getFilteredDedupedDocs(
      [
        {
          _id: 'drafts.123',
          _type: 'test',
          orderRank: 'a',
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          _rev: '123',
        },
        {
          _id: 'versions.rEZnogJnx.123',
          _type: 'test',
          orderRank: 'b',
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          _rev: '123',
        },
        {
          _id: 'versions.other-version.456',
          _type: 'test',
          orderRank: 'b',
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          _rev: '123',
        },
        {
          _id: '789',
          _type: 'test',
          orderRank: 'b',
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          _rev: '123',
        },
      ],
      'other-version',
    )

    // Should show the draft of the other version
    expect(result).toHaveLength(3)
    expect(result.map((doc) => doc._id)).toEqual([
      'drafts.123',
      'versions.other-version.456',
      '789',
    ])
  })

  it('should handle empty input', () => {
    const result = getFilteredDedupedDocs([], 'drafts')
    expect(result).toEqual([])
  })
})
