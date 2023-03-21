import {LexoRank} from 'lexorank'
import {SanityClient} from '@sanity/client'
import {ORDER_FIELD_NAME} from './constants'
// Function to wipe and re-do ordering with LexoRank
// Will at least attempt to start with the current order
export async function resetOrder(type = ``, client: SanityClient) {
  const query = `*[_type == $type]|order(@[$order] asc)._id`
  const queryParams = {type, order: ORDER_FIELD_NAME}
  const documents = await client.fetch(query, queryParams)

  if (!documents.length) {
    return null
  }

  const transaction = client.transaction()
  let aLexoRank = LexoRank.min()

  for (let index = 0; index < documents.length; index += 1) {
    // Generate next rank before even the first document so there's room to move!
    aLexoRank = aLexoRank.genNext().genNext()

    transaction.patch(documents[index], {
      set: {[ORDER_FIELD_NAME]: aLexoRank.toString()},
    })
  }

  return transaction
    .commit()
    .then((update) => update)
    .catch((err) => err)
}
