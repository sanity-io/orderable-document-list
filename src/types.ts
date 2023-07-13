import type {SanityDocument} from 'sanity'

import {ORDER_FIELD_NAME} from './helpers/constants'

export interface SanityDocumentWithOrder extends SanityDocument {
  [ORDER_FIELD_NAME]?: string
  hasPublished?: boolean
}
