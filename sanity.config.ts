import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {orderableDocumentListDeskItem, orderRankField, orderRankOrdering} from './src'
import {visionTool} from '@sanity/vision'

export default defineConfig({
  projectId: 'ppsg7ml5',
  dataset: 'test',
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([orderableDocumentListDeskItem({type: 'orderableCategory', S, context})]),
    }),
    visionTool(),
  ],
  schema: {
    types: [
      {
        name: 'orderableCategory',
        type: 'document',
        orderings: [orderRankOrdering],
        fields: [
          {name: 'title', type: 'string'},
          {
            name: 'address',
            type: 'object',
            fields: [
              {name: 'country', type: 'string'},
              {name: 'city', type: 'string'},
            ],
          },
          orderRankField({type: 'orderableCategory', newItemPosition: 'before'}),
        ],
      },
    ],
  },
  tasks: {
    enabled: false,
  },
  scheduledPublishing: {
    enabled: false,
  },
  announcements: {
    enabled: false,
  },
  beta: {
    create: {
      startInCreateEnabled: false,
    },
  },
})
