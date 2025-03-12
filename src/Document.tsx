import {useContext, useMemo, type ReactNode} from 'react'
import {getPublishedId} from '@sanity/client/csm'
import {ChevronDownIcon, ChevronUpIcon, DragHandleIcon} from '@sanity/icons'
import {AvatarCounter, Box, Button, Card, Flex, Text} from '@sanity/ui'
import {useObservable} from 'react-rx'
import {combineLatest, of} from 'rxjs'
import {map} from 'rxjs/operators'
import {
  DocumentStatusIndicator,
  getDraftId,
  Preview,
  PreviewCard,
  SchemaType,
  useDocumentPreviewStore,
  useSchema,
} from 'sanity'
import {usePaneRouter} from 'sanity/structure'

/**
 * START
 * Code that we can replace by importing useDocumentVersionInfo from Sanity
 * once we upgrade to a more recent version of Sanity
 **/
interface VersionInfoDocumentStub {
  _id: string
  _rev: string
  _createdAt: string
  _updatedAt: string
}

function exists(value: any) {
  return value?._rev
}
const DOCUMENT_STUB_PATHS = ['_id', '_type', '_rev', '_createdAt', '_updatedAt']

function useDocumentVersionInfo(documentId: string) {
  const documentPreviewStore = useDocumentPreviewStore()
  const [draftId, publishedId] = [getDraftId(documentId), getPublishedId(documentId)]

  const observable = useMemo(() => {
    return combineLatest({
      isLoading: of(false),
      draft: documentPreviewStore
        .observePaths({_id: draftId}, DOCUMENT_STUB_PATHS)
        .pipe(map((value) => (exists(value) ? (value as VersionInfoDocumentStub) : undefined))),
      published: documentPreviewStore
        .observePaths({_id: publishedId}, DOCUMENT_STUB_PATHS)
        .pipe(map((value) => (exists(value) ? (value as VersionInfoDocumentStub) : undefined))),
    })
  }, [draftId, documentPreviewStore, publishedId])

  return useObservable(observable, {
    isLoading: true,
    draft: undefined,
    published: undefined,
  })
}

/**
 * END
 **/

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

  const versionsInfo = useDocumentVersionInfo(doc._id)

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
        <Box display={['none', 'block']} marginX={[2, 2, 3]} style={{flexShrink: 0}}>
          <DocumentStatusIndicator
            draft={versionsInfo.draft}
            published={versionsInfo.published}
            versions={undefined}
          />
        </Box>
      </Flex>
    </PreviewCard>
  )
}
