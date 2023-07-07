import React, {useEffect, useMemo, useState} from 'react'
import {Box, Flex, Spinner, Stack} from '@sanity/ui'

import DraggableList from './DraggableList'
import {ORDER_FIELD_NAME} from './helpers/constants'
import Feedback from './Feedback'
import {useSanityClient} from './helpers/client'
import { SanityDocumentWithOrder } from './types'

export interface DocumentListQueryProps {
  type: string
  // eslint-disable-next-line react/require-default-props
  filter?: string
  // eslint-disable-next-line react/require-default-props
  params?: Record<string, unknown>
}

//rxjs Subscription does not seem to comply with sanity client subscribe anymore
type ClientSubscription = ReturnType<
  ReturnType<ReturnType<typeof useSanityClient>['listen']>['subscribe']
>

const DEFAULT_PARAMS = {}

export default function DocumentListQuery({
  type,
  filter,
  params = DEFAULT_PARAMS,
}: DocumentListQueryProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [listIsUpdating, setListIsUpdating] = useState(false)
  const [data, setData] = useState<SanityDocumentWithOrder[]>([])

  const client = useSanityClient()

  useEffect(() => {
    const query = `*[_type == $type ${filter ? `&& ${filter}` : ''}]|order(@[$order] asc){
      _id, _type, ${ORDER_FIELD_NAME}
    }`
    const queryParams = Object.assign(params, {type, order: ORDER_FIELD_NAME})
    let subscription: ClientSubscription | undefined

    // eslint-disable-next-line require-await
    const fetchData = async () => {
      client.fetch<SanityDocumentWithOrder[]>(query, queryParams).then((documents) => {
        // Remove published document from list if draft also exists
        const filteredDocuments = documents.reduce<SanityDocumentWithOrder[]>((acc, cur) => {
          if (!cur._id.startsWith(`drafts.`)) {
            // eslint-disable-next-line max-nested-callbacks
            const alsoHasDraft = documents.some((doc) => doc._id === `drafts.${cur._id}`)

            return alsoHasDraft ? acc : [...acc, cur]
          }

          return [...acc, cur]
        }, [])

        setData(filteredDocuments)

        if (isLoading) {
          setIsLoading(false)
        }
      })
    }

    const prepareData = async () => {
      setIsLoading(true)

      await fetchData()

      if (!subscription) {
        subscription = client.listen(query, queryParams).subscribe(() => fetchData())
      }
    }

    // Get data but only if a document isn't being patched or we don't yet have data
    if (!listIsUpdating && !data.length) {
      prepareData()
    }

    return () => subscription?.unsubscribe()
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [type])

  const unorderedDataCount = useMemo(
    () => (data.length ? data.filter((doc) => !doc[ORDER_FIELD_NAME]).length : 0),
    [data]
  )

  if (isLoading)
    return (
      <Flex style={{width: `100%`, height: `100%`}} align="center" justify="center">
        <Spinner />
      </Flex>
    )

  return (
    <Stack space={1} style={{overflow: `auto`, height: `100%`}}>
      {unorderedDataCount > 0 && (
        <Feedback>
          {unorderedDataCount}/{data.length} Documents have no Order. Select{' '}
          <strong>Reset Order</strong> from the Menu above to fix.
        </Feedback>
      )}
      <Box padding={2}>
        <DraggableList
          data={data}
          listIsUpdating={listIsUpdating}
          setListIsUpdating={setListIsUpdating}
        />
      </Box>
    </Stack>
  )
}
