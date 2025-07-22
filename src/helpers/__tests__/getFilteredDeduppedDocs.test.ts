import {describe, it, expect} from 'vitest'
import type {SanityDocumentWithOrder} from '../../types'
import {getFilteredDedupedDocs} from '../getFilteredDedupedDocs'

describe('getFilteredDedupedDocs', () => {
  const mockDocuments: SanityDocumentWithOrder[] = [
    {
      _id: 'drafts.123',
      _type: 'test',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: '123',
      _type: 'test',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'versions.rEZnogJnx.123',
      _type: 'test',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'drafts.456',
      _type: 'test',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: '456',
      _type: 'test',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: '789',
      _type: 'test',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'versions.rOrphanVersion.789',
      _type: 'test',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
    {
      _id: 'drafts.only-draft-id',
      _type: 'test',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '123',
    },
  ]

  it('should filter and deduplicate documents in draft perspective', () => {
    const result = getFilteredDedupedDocs(mockDocuments, 'drafts')

    // Should only include drafts and published (if it doesn't have a published)
    expect(result).toHaveLength(4)
    expect(result.map((doc) => doc._id)).toEqual([
      'drafts.123',
      'drafts.456',
      '789',
      'drafts.only-draft-id',
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
    const result = getFilteredDedupedDocs(mockDocuments, 'published')

    // Should only include published documents
    expect(result).toHaveLength(3)
    expect(result.map((doc) => doc._id)).toEqual(['123', '456', '789'])
  })

  it('should filter and deduplicate documents in version perspective', () => {
    const result = getFilteredDedupedDocs(mockDocuments, 'rEZnogJnx')

    // Should include versions for the specific release, drafts, and published
    expect(result).toHaveLength(4)
    expect(result.map((doc) => doc._id)).toEqual([
      'versions.rEZnogJnx.123',
      'drafts.456',
      '789',
      'drafts.only-draft-id',
    ])
  })

  it('should prioritize versions over drafts in version perspective', () => {
    const documentsWithVersionAndDraft = [
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
    ]

    const result = getFilteredDedupedDocs(documentsWithVersionAndDraft, 'rEZnogJnx')

    // Should prioritize the version over the draft
    expect(result).toHaveLength(1)
    expect(result[0]._id).toBe('versions.rEZnogJnx.123')
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
