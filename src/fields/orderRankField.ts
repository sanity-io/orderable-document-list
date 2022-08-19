import {ConfigContext} from 'sanity'
import type {SanityClient} from '@sanity/client'
import {ORDER_FIELD_NAME} from '../helpers/constants'
import initialRank from '../helpers/initialRank'
import {subscribeSanityClient} from '../desk-structure/globalClientWorkaround'

export type SchemaContext = Omit<ConfigContext, 'schema' | 'currentUser' | 'client'>

export interface RankFieldConfig {
  type: string
  context: SchemaContext
}

export const orderRankField = (config: RankFieldConfig) => {
  if (!config?.type || !config.context) {
    throw new Error(
      `
      type and context must be provided. context is available when configuring schema.
      Example: orderRankField({type: 'category', context})
      `
    )
  }

  const {type} = config

  let client: SanityClient | undefined
  subscribeSanityClient(config.context, (updatedClient) => {
    client = updatedClient
  })
  return {
    title: 'Order Rank',
    readOnly: true,
    hidden: true,
    ...config,
    name: ORDER_FIELD_NAME,
    type: 'string',
    initialValue: async () => {
      const lastDocOrderRank = await client?.fetch(
        `*[_type == $type]|order(@[$order] desc)[0][$order]`,
        {type, order: ORDER_FIELD_NAME}
      )
      return initialRank(lastDocOrderRank)
    },
  }
}
