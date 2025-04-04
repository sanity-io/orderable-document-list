import {LexoRank} from 'lexorank'
import type {MultipleMutationResult, SanityClient} from '@sanity/client'
import {ORDER_FIELD_NAME} from './constants'
import {DocumentListQueryProps, getDocumentQuery} from './query'

export interface ResetOrderParams extends DocumentListQueryProps {
  client: SanityClient
}

// Function to wipe and re-do ordering with LexoRank
// Will at least attempt to start with the current order
export async function resetOrder(params: ResetOrderParams): Promise<MultipleMutationResult | null> {
  const {client, ...queryProps} = params
  const {query, queryParams} = getDocumentQuery(queryProps)
  const documents = await client.fetch<
    Array<{
      _id: string
      _type: string
      [ORDER_FIELD_NAME]: string
    }>
  >(query, queryParams, {
    tag: 'orderable-document-list.reset-order',
  })

  if (documents.length === 0) {
    return null
  }

  let aLexoRank = LexoRank.min()

  const transaction = documents
    .map((doc) => doc._id)
    .reduce((trx, documentId) => {
      // Generate next rank before even the first document so there's room to move!
      aLexoRank = aLexoRank.genNext().genNext()

      return trx.patch(documentId, {
        set: {[ORDER_FIELD_NAME]: aLexoRank.toString()},
      })
    }, client.transaction())

  return transaction.commit({
    visibility: 'async',
    tag: 'orderable-document-list.reset-order',
  })
}
