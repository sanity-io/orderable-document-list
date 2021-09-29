import sanityClient from 'part:@sanity/base/client'
import {ORDER_FIELD_NAME} from '../helpers/constants'
import initialRank from '../helpers/initialRank'

const client = sanityClient.withConfig({apiVersion: `2021-05-19`})

export const orderRankField = (config = {}) => {
  if (!config?.type) {
    throw new Error(
      `
      "type" not defined in orderRankField parameter object. 
      Example: orderRankField({type: 'category'})
      `
    )
  }

  const {type} = config

  return {
    title: 'Order Rank',
    readOnly: true,
    hidden: true,
    ...config,
    name: ORDER_FIELD_NAME,
    type: 'string',
    initialValue: async () => {
      const lastDocOrderRank = await client.fetch(
        `*[_type == $type]|order(@[$order] desc)[0][$order]`,
        {type, order: ORDER_FIELD_NAME}
      )

      return initialRank(lastDocOrderRank)
    },
  }
}
