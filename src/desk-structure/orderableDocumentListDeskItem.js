import S from '@sanity/desk-tool/structure-builder'
import {SortIcon, ComposeIcon, GenerateIcon} from '@sanity/icons'
import OrderableDocumentList from '../OrderableDocumentList'

export function orderableDocumentListDeskItem(config = {}) {
  if (!config?.type) {
    throw new Error(`
    "type" not defined in orderableDocumentListDeskItem parameters.
    \n\n
    Example: orderableDocumentListDeskItem({type: 'category'})
    `)
  }

  const {type, title, icon} = config

  const listTitle = title ?? `Orderable ${type}`
  const listId = `orderable-${type}`
  const listIcon = icon ?? SortIcon

  return (
    S.listItem()
      .title(listTitle)
      .id(listId)
      .icon(listIcon)
      .child(
        S.component(OrderableDocumentList)
          .options({type})
          .title(listTitle)
          .id(listId)
          .child(() => S.editor())
          .menuItems([
            S.menuItem().title(`Reset Order`).icon(GenerateIcon).action(`resetOrder`),
            S.menuItem().title(`Show Increments`).icon(SortIcon).action(`showIncrements`),
            S.menuItem()
              .title(`New`)
              .icon(ComposeIcon)
              .intent({
                type: `create`,
                params: {template: type, type},
              })
              .showAsAction(true),
          ])
      )
      // .serialize() is necessary for export
      .serialize()
  )
}
