import {LexoRank} from 'lexorank'
import type {MultipleMutationResult, SanityClient} from '@sanity/client'
import {ORDER_FIELD_NAME} from './constants'

// Function to wipe and re-do ordering with LexoRank
// Will at least attempt to start with the current order
export async function resetOrder(
  type: string,
  client: SanityClient
): Promise<MultipleMutationResult | null> {
  const query = `*[_type == $type]|order(@[$order] asc)._id`
  const queryParams = {type, order: ORDER_FIELD_NAME}
  const documentIds = await client.fetch<Array<string>>(query, queryParams, {
    tag: 'orderable-document-list.reset-order',
  })

  if (documentIds.length === 0) {
    return null
  }

  let aLexoRank = LexoRank.min()

  const transaction = documentIds.reduce((trx, documentId) => {
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
