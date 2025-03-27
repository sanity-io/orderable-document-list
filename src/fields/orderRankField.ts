import {type ConfigContext, defineField, type StringDefinition} from 'sanity'
import {API_VERSION, ORDER_FIELD_NAME} from '../helpers/constants'
import {initialRank} from '../helpers/initialRank'
import type {NewItemPosition} from '../types'

export type SchemaContext = Omit<ConfigContext, 'schema' | 'currentUser' | 'client'>

export interface RankFieldConfig extends Omit<StringDefinition, 'name' | 'type' | 'initialValue'> {
  type: string
  newItemPosition?: NewItemPosition
}

export const orderRankField = (config: RankFieldConfig): StringDefinition => {
  if (!config?.type) {
    throw new Error(
      `
      type must be provided.
      Example: orderRankField({type: 'category'})
      `,
    )
  }

  const {type, newItemPosition = 'after', ...rest} = config
  return defineField({
    title: 'Order Rank',
    readOnly: true,
    hidden: true,
    ...rest,
    name: ORDER_FIELD_NAME,
    type: 'string',
    initialValue: async (p, {getClient}) => {
      const direction = newItemPosition === 'before' ? 'asc' : 'desc'

      const lastDocOrderRank = await getClient({apiVersion: API_VERSION}).fetch(
        `*[_type == $type]|order(@[$order] ${direction})[0][$order]`,
        {type, order: ORDER_FIELD_NAME},
        {tag: 'orderable-document-list.last-doc-order-rank'},
      )
      return initialRank(lastDocOrderRank, newItemPosition)
    },
  })
}
