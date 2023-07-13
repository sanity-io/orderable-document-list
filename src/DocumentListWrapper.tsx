import {useEffect, useMemo} from 'react'
import {useToast} from '@sanity/ui'

import {useSchema} from 'sanity'
import {Box, type ToastParams} from '@sanity/ui'
import {Feedback} from 'sanity-plugin-utils'
import DocumentListQuery from './DocumentListQuery'
import {OrderableContext} from './OrderableContext'

import {ORDER_FIELD_NAME} from './helpers/constants'

export interface DocumentListWrapperProps {
  showIncrements: boolean
  type: string
  resetOrderTransaction: ToastParams
  // eslint-disable-next-line react/require-default-props
  filter?: string
  // eslint-disable-next-line react/require-default-props
  params?: Record<string, unknown>
}

// 1. Validate first that the schema has been configured for ordering
// 2. Setup context for showIncrements
export default function DocumentListWrapper({
  type,
  showIncrements,
  resetOrderTransaction,
  filter,
  params,
}: DocumentListWrapperProps) {
  const toast = useToast()
  const schema = useSchema()

  useEffect(() => {
    if (resetOrderTransaction?.title && resetOrderTransaction?.status) {
      toast.push(resetOrderTransaction)
    }
  }, [resetOrderTransaction, toast])

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
    if (
      !('fields' in typeSchema) ||
      !typeSchema.fields.some((field) => field?.name === ORDER_FIELD_NAME)
    ) {
      return (
        <>
          Schema <code>{type}</code> must have an <code>{ORDER_FIELD_NAME}</code> field of type{' '}
          <code>string</code>
        </>
      )
    }

    // Schema's order field is not a string
    if (
      'fields' in typeSchema &&
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

    return ''
  }, [type, schema])

  if (schemaIsInvalid) {
    return (
      <Box padding={2}>
        <Feedback description={schemaIsInvalid} tone="caution" />
      </Box>
    )
  }

  return (
    <OrderableContext.Provider value={{showIncrements}}>
      <DocumentListQuery type={type} filter={filter} params={params} />
    </OrderableContext.Provider>
  )
}
