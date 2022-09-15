import {type ConfigContext, defineField} from 'sanity'
import {ORDER_FIELD_NAME} from '../helpers/constants'
import initialRank from '../helpers/initialRank'

export type SchemaContext = Omit<ConfigContext, 'schema' | 'currentUser' | 'client'>

export interface RankFieldConfig {
  type: string
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

  const {type} = config
  return defineField({
    title: 'Order Rank',
    readOnly: true,
    hidden: true,
    ...config,
    name: ORDER_FIELD_NAME,
    type: 'string',
    initialValue: async (p, {getClient}) => {
      const lastDocOrderRank = await getClient({apiVersion: '2021-09-01'}).fetch(
        `*[_type == $type]|order(@[$order] desc)[0][$order]`,
        {type, order: ORDER_FIELD_NAME}
      )
      return initialRank(lastDocOrderRank)
    },
  })
}
