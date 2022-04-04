import {LexoRank} from 'lexorank'
import sanityClient from 'part:@sanity/base/client'
import {ORDER_FIELD_NAME} from './constants'

const client = sanityClient.withConfig({
  apiVersion: '2021-09-01',
})

// Function to wipe and re-do ordering with LexoRank
// Will at least attempt to start with the current order
export async function resetOrder(type = ``) {
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
      set: {[ORDER_FIELD_NAME]: aLexoRank.value},
    })
  }

  return transaction
    .commit()
    .then((update) => update)
    .catch((err) => err)
}
