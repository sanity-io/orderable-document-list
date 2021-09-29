# sanity-plugin-orderable-document-list

Drag-and-drop Document Ordering without leaving the Editing surface.

![2021-09-28 16 33 51](https://user-images.githubusercontent.com/9684022/135118990-5e20ac68-d010-40c2-a722-f596089c631a.gif)

This plugin aims to be OS-like in that you can select and move multiple documents by holding `shift` and clicking a second item, and toggling on/off selections by holding `command/control`.

## Requirements

A Sanity Studio with [Desk Structure](https://www.sanity.io/docs/structure-builder-introduction) configured.

## Installation

```
sanity install orderable-document-list
```

### 1. Import the Document List into your Desk Structure

The config parameter requires `type` and also accepts `title` and `icon`.

```js
// ./src/desk-structure/index.js (or similar)

import S from '@sanity/desk-tool/structure-builder'
import {orderableDocumentListDeskItem} from 'sanity-plugin-orderable-document-list'

export default () =>
  S.list()
    .title('Content')
    .items([
      // Minimum required configuration
      orderableDocumentListDeskItem({type: `category`}),

      // Optional configuration
      orderableDocumentListDeskItem({
        type: `project`,
        title: `Projects`,
        icon: Paint
      }),

      // ... all other desk items
```

### 2. Add the `orderRank` field to your schema(s).

You must pass in the `type` of the schema, to create an `initialValue` value.

Additionally, pass in overrides for the field, such as making it visible by passing `hidden: false`.

You cannot override the `name`, `type` or `initialValue` attributes.

Example:

```js
// ./src/schema/category.js (or similar)

import {
  orderRankField,
  orderRankOrdering,
} from "sanity-plugin-orderable-document-list";

export default {
  name: "category",
  title: "Category",
  type: "document",
  // Optional: The plugin also exports a set of `orderings` for use in other Document Lists
  orderings: [orderRankOrdering],
  fields: [
    // Minimum required configuration
    orderRankField({ type: "category" }),

    // OR you can override _some_ of the field settings
    orderRankField({ type: "category", hidden: false }),

    // ...all other fields
```

### 3. Generate initial Ranks

On first load, your Document list will not have any Order. You can select "Reset Order" from the menu in the top right of the list. You can also re-run this at any time.

The `orderRankField` will query the last Document to set an `initialValue` to come after it. New Documents always start at the end of the Ordered list.

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

Feedback and PRs welcome :)

## How it works

Uses [kvandakes](https://github.com/kvandake)'s [TypeScript implementation](https://github.com/kvandake/lexorank-ts) of [Jira's Lexorank](https://www.youtube.com/watch?v=OjQv9xMoFbg) to create a "lexographical" Document order.

Put simply it updates the position of an individual – or many – Documents in an ordered list without updating any others. It's fast.

## License

MIT © Simeon Griggs
See LICENSE
