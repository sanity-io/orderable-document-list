import {type ConfigContext, defineField} from 'sanity'
import {API_VERSION, ORDER_FIELD_NAME} from '../helpers/constants'
import initialRank from '../helpers/initialRank'
import {NewItemPosition} from '../types'

export type SchemaContext = Omit<ConfigContext, 'schema' | 'currentUser' | 'client'>

export interface RankFieldConfig {
  type: string
  newItemPosition?: NewItemPosition
}

export const orderRankField = (config: RankFieldConfig) => {
  if (!config?.type) {
    throw new Error(
      `
      type must be provided.
      Example: orderRankField({type: 'category'})
      `
    )
  }

  const {type, newItemPosition = 'after'} = config
  return defineField({
    title: 'Order Rank',
    readOnly: true,
    hidden: true,
    ...config,
    name: ORDER_FIELD_NAME,
    type: 'string',
    initialValue: async (p, {getClient}) => {
      const direction = newItemPosition === 'before' ? 'asc' : 'desc'

      const lastDocOrderRank = await getClient({apiVersion: API_VERSION}).fetch(
        `*[_type == $type]|order(@[$order] ${direction})[0][$order]`,
        {type, order: ORDER_FIELD_NAME}
      )
      return initialRank(lastDocOrderRank, newItemPosition)
    },
  })
}
