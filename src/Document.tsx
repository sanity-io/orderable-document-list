import React, {useContext, useMemo, useCallback, useState, useEffect, type ReactNode} from 'react'
import {ChevronDownIcon, ChevronUpIcon, DragHandleIcon} from '@sanity/icons'
import {Box, Button, Flex, Text} from '@sanity/ui'
import {useSchema, SchemaType, PreviewCard, Preview} from 'sanity'
import {usePaneRouter} from 'sanity/desk'

import {OrderableContext} from './OrderableContext'
import {SanityDocumentWithOrder} from './types'

export interface DocumentProps {
  doc: SanityDocumentWithOrder
  entities: SanityDocumentWithOrder[]
  handleSelect: (docId: string, index: number, event: MouseEvent) => void
  increment: (
    index: number,
    nextIndex: number,
    docId: string,
    entities: SanityDocumentWithOrder[]
  ) => void
  index: number
  isFirst: boolean
  isLast: boolean
}

export default function Document({
  doc,
  increment,
  entities,
  handleSelect,
  index,
  isFirst,
  isLast,
}: DocumentProps) {
  const {showIncrements} = useContext(OrderableContext)
  const schema = useSchema()
  const router = usePaneRouter()
  const {ChildLink, groupIndex, routerPanesState} = router

  const [clicked, setClicked] = useState<boolean>(false)

  const currentDoc = routerPanesState[groupIndex + 1]?.[0]?.id || false
  const pressed = currentDoc === doc._id
  const selected = currentDoc === doc._id && routerPanesState.length === groupIndex + 2

  const Link = useMemo(
    () =>
      function LinkComponent(linkProps: {children: ReactNode}) {
        return <ChildLink {...linkProps} childId={doc._id} />
      },
    [ChildLink, doc._id]
  )

  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e.metaKey) {
      setClicked(false)
      return
    }

    setClicked(true)
  }, [])

  // Reset `clicked` state when `selected` prop changes
  useEffect(() => setClicked(false), [selected])

  return (
    <>
      <PreviewCard
        __unstable_focusRing
        // @ts-expect-error
        as={Link}
        data-as="a"
        data-ui="PaneItem"
        onClick={handleClick}
        radius={2}
        pressed={pressed}
        selected={selected || clicked}
        sizing="border"
        tabIndex={-1}
        tone="inherit"
      >
        <Flex align="center">
          <Box paddingX={3} style={{flexShrink: 0}}>
            <Text size={4}>
              <DragHandleIcon cursor="grab" />
            </Text>
          </Box>
          {showIncrements && (
            <Flex style={{flexShrink: 0}} align="center" gap={1} paddingRight={1}>
              <Button
                padding={2}
                mode="ghost"
                // eslint-disable-next-line react/jsx-no-bind
                onClick={() => increment(index, index + -1, doc._id, entities)}
                disabled={isFirst}
                icon={ChevronUpIcon}
              />
              <Button
                padding={2}
                mode="ghost"
                disabled={isLast}
                // eslint-disable-next-line react/jsx-no-bind
                onClick={() => increment(index, index + 1, doc._id, entities)}
                icon={ChevronDownIcon}
              />
            </Flex>
          )}
          <Box
            style={{width: `100%`}}
            padding={2}
            // eslint-disable-next-line react/jsx-no-bind
            onClick={(e) => handleSelect(doc._id, index, e.nativeEvent)}
          >
            <Flex flex={1} align="center">
              <Preview
                layout="default"
                value={doc}
                schemaType={schema.get(doc._type) as SchemaType}
              />
            </Flex>
          </Box>
        </Flex>
      </PreviewCard>
    </>
  )
}
