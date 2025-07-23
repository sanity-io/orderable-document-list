import {ORDER_FIELD_NAME} from './constants'

export interface DocumentListQueryProps {
  type: string
  filter?: string
  params?: Record<string, unknown>
  currentVersion?: string
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
  currentVersion,
}: DocumentListQueryProps): DocumentListQueryResult {
  let perspectiveFilter = null
  if (currentVersion === 'published') {
    perspectiveFilter = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))'
  } else if (currentVersion === 'drafts') {
    // Show drafts, and published when no draft exists
    perspectiveFilter = `
      (_id in path("drafts.**") || (!(_id in path("drafts.**")) && !(_id in path("versions.**"))))
    `
  } else {
    // Default behavior: prioritize drafts over published when both exist
    // the priority should be a version
    perspectiveFilter = `(sanity::partOfRelease($currentVersion) || (!(_id in path("drafts.**")) && !(_id in path("versions.**"))) || (_id in path("drafts.**")))`
  }

  const querySelect = `*[_type == $type ${perspectiveFilter ? `&& ${perspectiveFilter}` : ''}${filter ? `&& ${filter}` : ''}]`
  const queryOrder = `|order(@[$order] asc)`
  const queryFields = `{_id, _type, ${ORDER_FIELD_NAME}}`

  const query = `${querySelect}${queryOrder}${queryFields}`
  const queryParams = {
    ...params,
    type,
    order: ORDER_FIELD_NAME,
    ...(currentVersion && {currentVersion}),
  }

  return {query, queryParams}
}
