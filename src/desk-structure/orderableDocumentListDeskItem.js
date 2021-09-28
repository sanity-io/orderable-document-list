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

  return (
    S.listItem()
      .title(title ?? `Orderable ${type}`)
      .id(`orderable-${type}`)
      .icon(icon ?? SortIcon)
      .child(
        S.component(OrderableDocumentList)
          .options({type})
          .title(title ?? `Orderable ${type}`)
          .child(() => S.editor())
          .menuItems([
            S.menuItem().title(`Reset Order`).icon(GenerateIcon).action(`resetOrder`),
            S.menuItem().title(`Show Increments`).icon(SortIcon).action(`showIncrements`),
            S.menuItem()
              .title(`New`)
              .icon(ComposeIcon)
              .intent({
                type: `change`,
                params: {type: `change`, template: 'change'},
              })
              .showAsAction(true),
          ])
      )
      // .serialize() is necessary for export
      .serialize()
  )
}
