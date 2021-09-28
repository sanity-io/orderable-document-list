# sanity-plugin-orderable-document-list

Drag-and-drop Document Ordering without leaving the Editing surface.

Uses [kvandakes](https://github.com/kvandake)'s [TypeScript implementation](https://github.com/kvandake/lexorank-ts) of [Jira's Lexorank](https://www.youtube.com/watch?v=OjQv9xMoFbg) to create a "lexographical" Document order.

Put simply it can updates the position of an individual – or many – Documents in a list without updating any others. It's fast.

It also aims to be OS-like in that you can select and move multiple documents by holding `shift` and clicking a second item, and toggling on/off selections by holding `command/control`.

## Requirements

1. A Sanity Studio with [Desk Structure](https://www.sanity.io/docs/structure-builder-introduction) configured
2. The addition of a `orderRank` field to any schema you wish to make "orderable" (instructions below)

## Installation

```
sanity install orderable-document-list
```

### 1. Import the Document List into your Desk Structure

```js
// ./src/desk-structure/index.js (or similar)

import S from '@sanity/desk-tool/structure-builder'
import {orderableDocumentListDeskItem} from 'sanity-plugin-orderable-document-list'

export default () =>
  S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({type: `category`}),
      // ... all other desk items
```

### 2. Add the `orderRank` field, and ordering settings, to your schema(s).

You must pass in the `type` of the schema, to create an `initialValue` value.

Additionally, pass in overrides for the field, such as making it visible by passing `hidden: false`. You cannot override the `name`, `type` or `initialValue` attributes.

Example:

```js
// `./src/schema/category.js (or similar)

import {
  orderRankField,
  orderRankOrdering,
} from "sanity-plugin-orderable-document-list";

export default {
  name: "category",
  title: "Category",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    // Unfortunately because of a limitation with initialValue we need to pass in the `type` again
    orderRankField({ type: "category", hidden: false }),
    // ...all other fields
```

### 3. Generate initial Ranks

On first load, your Document list will not have any Order. You can select "Reset Order" from the menu in the top right of the list. You can also re-run this at any time.

## Querying Ordered Documents

Now when writing a GROQ Query for Documents, use the `orderRank` field value to return ordered results:

```groq
*[_type == "category"]|order(orderRank)
```

## Notes

To get this first version out the door there are few configuration settings and a lot of opinions. Such as:

- The `name` of the `orderRank` field is constant
- The ability to only sort across _all_ Documents of a `type`
- The absence of a `filter` configuration on the Document List
- The `initialValue` configuration searches for the _last_ ordered Document of the current `type` and creates a rank _after_ it

Feedback and PRs welcome :)

## License

MIT © Simeon Griggs
See LICENSE
