# @sanity/orderable-document-list

> This is a **Sanity Studio v3** plugin.
> For the v2 version, please refer to the [v2-branch](https://github.com/sanity-io/orderable-document-list/tree/studio-v2).

# What is it?

Drag-and-drop Document Ordering without leaving the Editing surface.

![2022-04-26 12 23 39](https://user-images.githubusercontent.com/9684022/165289621-dbd9d841-028e-40c7-be14-7398fcdb1210.gif)

This plugin aims to be OS-like in that you can select and move multiple documents by holding `shift` and clicking a second item, and toggling on/off selections by holding `command/control`.

## Requirements

A Sanity Studio with [Desk Structure](https://www.sanity.io/docs/structure-builder-introduction) configured:

```ts
import {defineConfig} from 'sanity'
import {deskTool, StructureBuilder} from 'sanity/desk'

export default defineConfig({
  //...
  plugins: [
    deskTool({
      structure: (S, context) => {
        /* Structure code */
      },
    }),
  ],
})
```

## Installation

Run the following command in your studio directory

```sh
npm install --save @sanity/orderable-document-list
```

or

```sh
yarn add @sanity/orderable-document-list
```

## Usage

### 1. Import the Document List into your Desk Structure

The config parameter requires `type`, `S` and `context`. It also accepts `title`, `icon`, `filter` and `params`.
`S` and `context` are available in desk-tool structure callback, and should be forwarded as is:

```ts
import {defineConfig} from 'sanity'
import {deskTool, StructureBuilder} from 'sanity/desk'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

export default defineConfig({
  //...
  plugins: [
    deskTool({
      structure: (S, context) => {
        return S.list()
          .title('Content')
          .items([
            // Minimum required configuration
            orderableDocumentListDeskItem({type: 'category', S, context}),

            // Optional configuration
            orderableDocumentListDeskItem({
              type: 'project',
              title: 'Projects',
              icon: Paint,
              // Required if using multiple lists of the same 'type'
              id: 'orderable-en-projects',
              // See notes on adding a `filter` below
              filter: `__i18n_lang == $lang`,
              params: {
                lang: 'en_US',
              },
              // pass from the structure callback params above
              S,
              context,
            }),

            // ... all other desk items
          ])
      },
    }),
  ],
})
```

**Caution: Adding a `filter`**

By default, the plugin will display _all_ documents of the same `type`. However, you may wish to add a `filter` to reduce this down to a subset of documents. A typical usecase is for [internationalized document schema](https://github.com/sanity-io/document-internationalization) to order documents of just the base language version.

However, order ranks are still computed based on _all_ documents of the same `type`. Creating multiple lists with different `filter` settings could produce unexpected results.

### 2. Add the `orderRank` field to your schema(s).

You must pass in the `type` of the schema and the schema `context`, to create an `initialValue` value.
Context is available in the schema callback, and should be forwarded as is.

Additionally, pass in overrides for the field, such as making it visible by passing `hidden: false`.

You cannot override the `name`, `type` or `initialValue` attributes.

```js
// sanity.config.js
import {defineConfig} from "sanity";
import {deskTool, StructureBuilder} from "sanity/desk";
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export default defineConfig({
    //...
    plugins: [
        deskTool({structure: (S, context) => {/* snip */}})
    ],
    schema: {
        types: (previousTypes) => {
            return [
                ...previousTypes,
                {
                    name: "category",
                    title: "Category",
                    type: "document",
                    // Optional: The plugin also exports a set of 'orderings' for use in other Document Lists
                    // https://www.sanity.io/docs/sort-orders
                    orderings: [orderRankOrdering],
                    fields: [
                        // Minimum required configuration
                        orderRankField({ type: "category" }),

                        // OR you can override _some_ of the field settings
                        orderRankField({ type: 'category', hidden: false }),

                        // ...all other fields
                    ],
                },
            ]
        }
    }
}
```

### 3. Generate initial Ranks

On first load, your Document list will not have any Order. You can select "Reset Order" from the menu in the top right of the list.
You can also re-run this at any time.

The `orderRankField` will query the last Document to set an `initialValue` to come after it.
New Documents always start at the end of the Ordered list.

## Querying Ordered Documents

Now when writing a GROQ Query for Documents, use the `orderRank` field value to return ordered results:

```groq
*[_type == "category"]|order(orderRank)
```

If fetching documents using [the `document-internationalization` plugin](https://github.com/sanity-io/document-internationalization), you may want to sort by the rank of the base document when the document is not in the base language, so all locales share the same order. When changing the order of documents using this plugin, the `orderRank` field of documents in alternate locales won't be updated. The query below ensures a consistent order for documents in the base language and in alternate languages.

```groq
*[_type == "category" && __i18n_lang == $lang]|order(coalesce(__i18n_base->orderRank, orderRank))
```

## Notes

To get this first version out the door there are few configuration settings and a lot of opinions. Such as:

- The `name` of the `orderRank` field is constant
- The ability to only sort across _all_ Documents of a `type`

Feedback and PRs welcome :)

### Breaking change in the v3 version

`orderableDocumentListDeskItem` requires context from sanity config now.
See the examples above.

## How it works

Uses [kvandakes](https://github.com/kvandake)'s [TypeScript implementation](https://github.com/kvandake/lexorank-ts) of [Jira's Lexorank](https://www.youtube.com/watch?v=OjQv9xMoFbg) to create a "lexographical" Document order.

Put simply it updates the position of an individual – or many – Documents in an ordered list without updating any others. It's fast.

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.

### Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/orderable-document-list/actions/workflows/main.yml).
Make sure to select the v3 branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.

## License

[MIT](LICENSE) © Sanity.io
