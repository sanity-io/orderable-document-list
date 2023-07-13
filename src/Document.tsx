import {useContext, useMemo, type ReactNode} from 'react'
import {ChevronDownIcon, ChevronUpIcon, DragHandleIcon} from '@sanity/icons'
import {AvatarCounter, Card, Box, Button, Flex, Text} from '@sanity/ui'
import {useSchema, SchemaType, PreviewCard, Preview} from 'sanity'
import {usePaneRouter} from 'sanity/desk'

import {OrderableContext} from './OrderableContext'
import {SanityDocumentWithOrder} from './types'

export interface DocumentProps {
  doc: SanityDocumentWithOrder
  entities: SanityDocumentWithOrder[]
  increment: (
    index: number,
    nextIndex: number,
    docId: string,
    entities: SanityDocumentWithOrder[]
  ) => void
  index: number
  isFirst: boolean
  isLast: boolean
  dragBadge: number | false
}

export default function Document({
  doc,
  increment,
  entities,
  index,
  isFirst,
  isLast,
  dragBadge,
}: DocumentProps) {
  const {showIncrements} = useContext(OrderableContext)
  const schema = useSchema()
  const router = usePaneRouter()
  const {ChildLink, groupIndex, routerPanesState} = router

  const currentDoc = routerPanesState[groupIndex + 1]?.[0]?.id || false
  const pressed = currentDoc === doc._id || currentDoc === doc._id.replace(`drafts.`, ``)
  const selected = pressed && routerPanesState.length === groupIndex + 2

  const Link = useMemo(
    () =>
      function LinkComponent(linkProps: {children: ReactNode}) {
        return <ChildLink {...linkProps} childId={doc._id} />
      },
    [ChildLink, doc._id]
  )

  return (
    <PreviewCard
      __unstable_focusRing
      // @ts-expect-error
      as={Link}
      data-as="a"
      data-ui="PaneItem"
      radius={2}
      pressed={pressed}
      selected={selected}
      sizing="border"
      tabIndex={-1}
      tone="inherit"
      width="100%"
      flex={1}
    >
      <Flex align="center">
        <Box paddingX={3} style={{flexShrink: 0}}>
          <Text size={2}>
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
        <Box style={{width: `100%`}} padding={2}>
          <Flex flex={1} align="center">
            <Preview
              layout="default"
              value={doc}
              schemaType={schema.get(doc._type) as SchemaType}
            />
          </Flex>
        </Box>
        {dragBadge && (
          <Card tone="default" marginRight={4} radius={5}>
            <AvatarCounter count={dragBadge} />
          </Card>
        )}
      </Flex>
    </PreviewCard>
  )
}
