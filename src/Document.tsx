import {useContext, useMemo, type ReactNode} from 'react'
import {ChevronDownIcon, ChevronUpIcon, DragHandleIcon} from '@sanity/icons'
import {AvatarCounter, Card, Box, Button, Flex, Text, Tooltip} from '@sanity/ui'
import {
  useSchema,
  SchemaType,
  PreviewCard,
  Preview,
  DocumentStatusIndicator,
  DocumentStatus,
  useDocumentVersionInfo,
} from 'sanity'
import {usePaneRouter} from 'sanity/structure'

import {OrderableContext} from './OrderableContext'
import type {SanityDocumentWithOrder} from './types'

export interface DocumentProps {
  doc: SanityDocumentWithOrder
  entities: SanityDocumentWithOrder[]
  increment: (
    index: number,
    nextIndex: number,
    docId: string,
    entities: SanityDocumentWithOrder[],
  ) => void
  index: number
  isFirst: boolean
  isLast: boolean
  dragBadge: number | false
}

export function Document({
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
  const versionsInfo = useDocumentVersionInfo(doc._id)

  const {ChildLink, groupIndex, routerPanesState} = router

  const currentDoc = routerPanesState[groupIndex + 1]?.[0]?.id || false
  const pressed = currentDoc === doc._id || currentDoc === doc._id.replace(`drafts.`, ``)
  const selected = pressed && routerPanesState.length === groupIndex + 2

  const Link = useMemo(
    () =>
      function LinkComponent(linkProps: {children: ReactNode}) {
        return <ChildLink {...linkProps} childId={doc._id} />
      },
    [ChildLink, doc._id],
  )

  const tooltip = (
    <DocumentStatus
      draft={versionsInfo.draft}
      published={versionsInfo.published}
      versions={versionsInfo.versions}
    />
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
        <Box paddingX={2} style={{flexShrink: 0}}>
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
        <Box style={{width: `100%`}}>
          <Flex flex={1} align="center" justify="space-between" paddingRight={3}>
            <Preview
              layout="default"
              value={doc}
              schemaType={schema.get(doc._type) as SchemaType}
            />

            <Tooltip content={tooltip} portal placement="right" boundaryElement={null}>
              <Flex align="center">
                <DocumentStatusIndicator
                  draft={versionsInfo.draft}
                  published={versionsInfo.published}
                  versions={versionsInfo.versions}
                />
              </Flex>
            </Tooltip>
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
