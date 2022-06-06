import S from '@sanity/desk-tool/structure-builder'
import {SortIcon, GenerateIcon} from '@sanity/icons'
import schema from 'part:@sanity/base/schema'

import OrderableDocumentList from '../OrderableDocumentList'

export function orderableDocumentListDeskItem(config = {}) {
  if (!config?.type) {
    throw new Error(`
    "type" not defined in orderableDocumentListDeskItem parameters.
    \n\n
    Example: orderableDocumentListDeskItem({type: 'category'})
    `)
  }

  const {type, filter, params, title, icon, id} = config

  const listTitle = title ?? `Orderable ${type}`
  const listId = id ?? `orderable-${type}`
  const listIcon = icon ?? SortIcon
  const typeTitle = schema.get(type)?.title ?? type

  return S.listItem(type)
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
        options: {type, filter, params},
        menuItems: [
          S.menuItem()
            .title(`Create new ${typeTitle}`)
            .intent({type: 'create', params: {type}})
            .serialize(),
          S.menuItem().title(`Reset Order`).icon(GenerateIcon).action(`resetOrder`).serialize(),
          S.menuItem().title(`Show Increments`).icon(SortIcon).action(`showIncrements`).serialize(),
        ],
      })
    )
    .serialize()
}
