import {GenerateIcon, SortIcon} from '@sanity/icons'
import type {ConfigContext} from 'sanity'

import {ComponentType} from 'react'
import {StructureBuilder, type ListItem} from 'sanity/desk'
import OrderableDocumentList from '../OrderableDocumentList'

export interface OrderableListConfig {
  type: string
  id?: string
  title?: string
  icon?: ComponentType
  params?: Record<string, unknown>
  filter?: string
  context: ConfigContext
  S: StructureBuilder
}

export function orderableDocumentListDeskItem(config: OrderableListConfig): ListItem {
  if (!config?.type || !config.context || !config.S) {
    throw new Error(`
    type, context and S (StructureBuilder) must be provided.
    context and S are available when configuring structure.
    Example: orderableDocumentListDeskItem({type: 'category'})
    `)
  }

  const {type, filter, params, title, icon, id, context, S} = config
  const {schema, getClient} = context
  const client = getClient({apiVersion: '2021-09-01'})

  const listTitle = title ?? `Orderable ${type}`
  const listId = id ?? `orderable-${type}`
  const listIcon = icon ?? SortIcon
  const typeTitle = schema.get(type)?.title ?? type

  return S.listItem()
    .title(listTitle)
    .id(listId)
    .icon(listIcon)
    .child(
      Object.assign(S.documentTypeList(type).serialize(), {
        // Prevents the component from re-rendering when switching documents
        __preserveInstance: true,
        // Prevents the component from NOT re-rendering when switching listItems
        key: listId,

        type: 'component',
        component: OrderableDocumentList,
        options: {type, filter, params, client},
        menuItems: [
          S.menuItem()
            .title(`Create new ${typeTitle}`)
            .intent({type: 'create', params: {type}})
            .serialize(),
          S.menuItem().title(`Reset Order`).icon(GenerateIcon).action(`resetOrder`).serialize(),
          S.menuItem()
            .title(`Toggle Increments`)
            .icon(SortIcon)
            .action(`showIncrements`)
            .serialize(),
        ],
      })
    )
    .serialize()
}
