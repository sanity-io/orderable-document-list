import PropTypes from 'prop-types'
import React, {useEffect, useState, useMemo} from 'react'
import sanityClient from 'part:@sanity/base/client'
import {Stack, Box, Flex, Spinner} from '@sanity/ui'
import {usePaneRouter} from '@sanity/desk-tool'

import DraggableList from './DraggableList'
import {ORDER_FIELD_NAME} from './helpers/constants'
import Feedback from './Feedback'

const client = sanityClient.withConfig({
  apiVersion: '2021-09-01',
})

export default function DocumentListQuery({type}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [data, setData] = useState([])
  const router = usePaneRouter()

  useEffect(() => {
    const query = `*[_type == $type]|order(@[$order] asc)`
    const queryParams = {type, order: ORDER_FIELD_NAME}
    let subscription = null

    // eslint-disable-next-line require-await
    const fetchData = async () => {
      client.fetch(query, queryParams).then((documents) => {
        // Remove published document from list if draft also exists
        const filteredDocuments = documents.reduce((acc, cur) => {
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
    if (!isUpdating && !data.length) {
      prepareData()
    }

    return () => subscription?.unsubscribe()
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

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
    <Stack space={1} style={{overflow: `scroll`, height: `100%`}}>
      {unorderedDataCount > 0 && (
        <Feedback>
          {unorderedDataCount}/{data.length} Documents have no Order. Select{' '}
          <strong>Reset Order</strong> from the Menu above to fix.
        </Feedback>
      )}
      <Box padding={1}>
        <DraggableList data={data} isUpdating={isUpdating} setIsUpdating={setIsUpdating} />
      </Box>
    </Stack>
  )
}

DocumentListQuery.propTypes = {
  type: PropTypes.string.isRequired,
}
