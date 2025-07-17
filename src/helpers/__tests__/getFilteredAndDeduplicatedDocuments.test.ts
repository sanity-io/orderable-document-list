import {describe, it, expect} from 'vitest'
import type {SanityDocumentWithOrder} from '../../types'
import {getFilteredAndDeduplicatedDocuments} from '../getFilteredAndDeduplicatedDocuments'

describe('getFilteredAndDeduplicatedDocuments', () => {
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
    const result = getFilteredAndDeduplicatedDocuments(mockDocuments, 'drafts')

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

    const result = getFilteredAndDeduplicatedDocuments(documentsWithDuplicates, 'drafts')

    // Should only show the draft version
    expect(result).toHaveLength(1)
    expect(result[0]._id).toBe('drafts.123')
  })

  it('should filter and deduplicate documents in published perspective', () => {
    const result = getFilteredAndDeduplicatedDocuments(mockDocuments, 'published')

    // Should only include published documents
    expect(result).toHaveLength(3)
    expect(result.map((doc) => doc._id)).toEqual(['123', '456', '789'])
  })

  it('should filter and deduplicate documents in version perspective', () => {
    const result = getFilteredAndDeduplicatedDocuments(
      mockDocuments,
      {
        _id: '_.releases.EZnogJnx',
        _type: 'system.release',
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _rev: '123',
        name: 'rEZnogJnx',
        state: 'published',
        metadata: {
          title: 'release test',
          releaseType: 'asap',
        },
      },
      'rEZnogJnx',
    )

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

    const result = getFilteredAndDeduplicatedDocuments(
      documentsWithVersionAndDraft,
      {
        _id: '_.releases.EZnogJnx',
        _type: 'system.release',
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _rev: '123',
        name: 'rEZnogJnx',
        state: 'published',
        metadata: {
          title: 'release test',
          releaseType: 'asap',
        },
      },
      'rEZnogJnx',
    )

    // Should prioritize the version over the draft
    expect(result).toHaveLength(1)
    expect(result[0]._id).toBe('versions.rEZnogJnx.123')
  })

  it('should handle empty input', () => {
    const result = getFilteredAndDeduplicatedDocuments([], 'drafts')
    expect(result).toEqual([])
  })
})
