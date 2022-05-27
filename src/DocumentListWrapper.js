import PropTypes from 'prop-types'
import React, {useMemo, useEffect} from 'react'
import schema from 'part:@sanity/base/schema'
import {useToast} from '@sanity/ui'
import {PaneRouterContext} from '@sanity/desk-tool'

import DocumentListQuery from './DocumentListQuery'
import {OrderableContext} from './OrderableContext'

import {ORDER_FIELD_NAME} from './helpers/constants'
import Feedback from './Feedback'

// 1. Validate first that the schema has been configured for ordering
// 2. Setup context for showIncrements
export default function DocumentListWrapper({
  type,
  filter,
  params,
  showIncrements,
  resetOrderTransaction,
}) {
  const toast = useToast()

  useEffect(() => {
    if (resetOrderTransaction?.title && resetOrderTransaction?.status) {
      toast.push(resetOrderTransaction)
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [resetOrderTransaction])

  const schemaIsInvalid = useMemo(() => {
    // Option not passed
    if (!type) {
      return (
        <>
          No <code>type</code> was configured
        </>
      )
    }

    const typeSchema = schema.get(type)

    // Schema not found
    if (!typeSchema) {
      return (
        <>
          Schema <code>{type}</code> not found
        </>
      )
    }

    // Schema lacks an order field
    if (!typeSchema.fields.some((field) => field?.name === ORDER_FIELD_NAME)) {
      return (
        <>
          Schema <code>{type}</code> must have an <code>order</code> field of type{' '}
          <code>string</code>
        </>
      )
    }

    // Schema's order field is not a string
    if (
      typeSchema.fields.some(
        (field) => field?.name === ORDER_FIELD_NAME && field?.type?.name !== 'string'
      )
    ) {
      return (
        <>
          <code>{ORDER_FIELD_NAME}</code> field on Schema <code>{type}</code> must be{' '}
          <code>string</code> type
        </>
      )
    }

    return ``
  }, [type])

  if (schemaIsInvalid) {
    return <Feedback>{schemaIsInvalid}</Feedback>
  }

  return (
    <OrderableContext.Provider value={{showIncrements}}>
      <DocumentListQuery type={type} filter={filter} params={params} />
    </OrderableContext.Provider>
  )
}

DocumentListWrapper.propTypes = {
  showIncrements: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  filter: PropTypes.string,
  params: PropTypes.object,
  resetOrderTransaction: PropTypes.shape({
    title: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
}

DocumentListWrapper.defaultProps = {
  filter: ``,
  params: {},
}
