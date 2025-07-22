import {GenerateIcon, SortIcon} from '@sanity/icons'
import type {ConfigContext} from 'sanity'

import type {ComponentType} from 'react'
import {StructureBuilder, type ListItem, type MenuItem} from 'sanity/structure'
import {OrderableDocumentList} from '../OrderableDocumentList'
import {API_VERSION} from '../helpers/constants'

export interface OrderableListConfig {
  type: string
  id?: string
  title?: string
  icon?: ComponentType
  params?: Record<string, unknown>
  filter?: string
  menuItems?: MenuItem[]
  createIntent?: boolean
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

  const {type, filter, menuItems = [], createIntent, params, title, icon, id, context, S} = config
  const {schema, getClient} = context
  // 'perspectiveStack' may not exist on ConfigContext in some versions
  const perspectiveStack = (context as any).perspectiveStack || []
  const client = getClient({apiVersion: API_VERSION})
  // the first position in the perspective stack is the current version
  const currentVersion = perspectiveStack[0]

  const listTitle = title ?? `Orderable ${type}`
  const listId = id ?? `orderable-${type}`
  const listIcon = icon ?? SortIcon
  const typeTitle = schema.get(type)?.title ?? type

  if (createIntent !== false) {
    menuItems.push(
      S.menuItem()
        .title(`Create new ${typeTitle}`)
        .intent({type: 'create', params: {type}})
        .serialize(),
    )
  }
  return S.listItem()
    .title(listTitle)
    .id(listId)
    .icon(listIcon)
    .schemaType(type)
    .child(
      Object.assign(
        S.documentTypeList(type)
          .canHandleIntent(() => !!createIntent)
          .serialize(),
        {
          // Prevents the component from re-rendering when switching documents
          __preserveInstance: true,
          // Prevents the component from NOT re-rendering when switching listItems
          key: listId,

          type: 'component',
          component: OrderableDocumentList,
          options: {type, filter, params, client, currentVersion},
          menuItems: [
            ...menuItems,
            S.menuItem().title(`Reset Order`).icon(GenerateIcon).action(`resetOrder`).serialize(),
            S.menuItem()
              .title(`Toggle Increments`)
              .icon(SortIcon)
              .action(`showIncrements`)
              .serialize(),
          ],
        },
      ),
    )
    .serialize()
}
