import {useEffect, useMemo, useState} from 'react'
import {Box, Flex, Container, Spinner, Stack, Text} from '@sanity/ui'

import {useListeningQuery, Feedback} from 'sanity-plugin-utils'
import DraggableList from './DraggableList'
import {ORDER_FIELD_NAME} from './helpers/constants'
import {SanityDocumentWithOrder} from './types'

export interface DocumentListQueryProps {
  type: string
  filter?: string
  params?: Record<string, unknown>
}

const DEFAULT_PARAMS = {}

export default function DocumentListQuery({
  type,
  filter,
  params = DEFAULT_PARAMS,
}: DocumentListQueryProps) {
  const [listIsUpdating, setListIsUpdating] = useState(false)
  const [data, setData] = useState<SanityDocumentWithOrder[] | null>([])

  const query = `*[_type == $type ${filter ? `&& ${filter}` : ''}]|order(@[$order] asc){
    _id, _type, ${ORDER_FIELD_NAME}
  }`
  const queryParams = {
    ...params,
    type,
    order: ORDER_FIELD_NAME,
  }

  const {
    data: queryData,
    loading,
    error,
  } = useListeningQuery<SanityDocumentWithOrder[]>(query, {
    params: queryParams,
    initialValue: [],
  })

  useEffect(() => {
    if (queryData) {
      const filteredDocuments = queryData.reduce<SanityDocumentWithOrder[]>((acc, cur) => {
        if (!cur._id.startsWith(`drafts.`)) {
          // eslint-disable-next-line max-nested-callbacks
          const alsoHasDraft = queryData.some((doc) => doc._id === `drafts.${cur._id}`)
          return alsoHasDraft ? acc : [...acc, cur]
        }

        // Check if the draft has a published version
        cur.hasPublished = queryData.some((doc) => doc._id === cur._id.replace(`drafts.`, ``))

        return [...acc, cur]
      }, [])

      setData(filteredDocuments)
    } else {
      setData([])
    }
  }, [queryData])

  const unorderedDataCount = useMemo(
    () => (data?.length ? data.filter((doc) => !doc[ORDER_FIELD_NAME]).length : 0),
    [data]
  )

  if (loading) {
    return (
      <Flex style={{width: `100%`, height: `100%`}} align="center" justify="center">
        <Spinner />
      </Flex>
    )
  }

  if (error) {
    return (
      <Box padding={2}>
        <Feedback tone="critical" title="There was an error" description="Please try again later" />
      </Box>
    )
  }

  if (!data || data?.length == 0)
    return (
      <Flex align="center" direction="column" height="fill" justify="center">
        <Container width={1}>
          <Box paddingX={4} paddingY={5}>
            <Text align="center" muted>
              No documents of this type
            </Text>
          </Box>
        </Container>
      </Flex>
    )

  return (
    <Stack space={1} style={{overflow: `auto`, height: `100%`}}>
      <Box padding={2}>
        {unorderedDataCount > 0 && (
          <Box marginBottom={2}>
            <Feedback
              tone="caution"
              description={
                <>
                  {unorderedDataCount}/{data?.length} documents have no order. Select{' '}
                  <strong>Reset Order</strong> from the menu above to fix.
                </>
              }
            />
          </Box>
        )}
        <DraggableList
          data={data}
          listIsUpdating={listIsUpdating}
          setListIsUpdating={setListIsUpdating}
        />
      </Box>
    </Stack>
  )
}
