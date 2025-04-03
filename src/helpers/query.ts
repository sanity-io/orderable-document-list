import {ORDER_FIELD_NAME} from './constants'

export interface DocumentListQueryProps {
  type: string
  filter?: string
  params?: Record<string, unknown>
}

export interface DocumentListQueryResult {
  query: string
  queryParams: Record<string, string | number | boolean | string[]>
}

const DEFAULT_PARAMS = {}

export function getDocumentQuery({
  type,
  filter,
  params = DEFAULT_PARAMS,
}: DocumentListQueryProps): DocumentListQueryResult {
  const querySelect = `*[_type == $type ${filter ? `&& ${filter}` : ''}]`
  const queryOrder = `|order(@[$order] asc)`
  const queryFields = `{_id, _type, ${ORDER_FIELD_NAME}}`

  const query = `${querySelect}${queryOrder}${queryFields}`
  const queryParams = {
    ...params,
    type,
    order: ORDER_FIELD_NAME,
  }

  return {query, queryParams}
}
