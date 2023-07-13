import {SortOrdering} from 'sanity'
import {ORDER_FIELD_NAME} from '../helpers/constants'

export const orderRankOrdering: SortOrdering = {
  title: 'Ordered',
  name: 'ordered',
  by: [{field: ORDER_FIELD_NAME, direction: 'asc'}],
}
