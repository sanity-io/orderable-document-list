import React, {useContext} from 'react'
import {ChevronDownIcon, ChevronUpIcon, DragHandleIcon} from '@sanity/icons'
import {Box, Button, Flex, Text} from '@sanity/ui'
import {useSchema, SchemaType, Preview} from 'sanity'

import {OrderableContext} from './OrderableContext'
import { SanityDocumentWithOrder } from './types'

export interface DocumentProps {
  doc: SanityDocumentWithOrder
  entities: SanityDocumentWithOrder[]
  handleSelect: (docId: string, index: number, event: MouseEvent) => void
  increment: (index: number, nextIndex: number, docId: string, entities: SanityDocumentWithOrder[]) => void
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
  return (
    <Flex align="center">
      <Box paddingX={3} style={{flexShrink: 0}}>
        <Text size={4}>
          <DragHandleIcon />
        </Text>
      </Box>
      {showIncrements && (
        <Flex style={{flexShrink: 0}} align="center" gap={1} paddingRight={1}>
          <Button
            padding={2}
            mode="ghost"
            onClick={() => increment(index, index + -1, doc._id, entities)}
            disabled={isFirst}
            icon={ChevronUpIcon}
          />
          <Button
            padding={2}
            mode="ghost"
            disabled={isLast}
            onClick={() => increment(index, index + 1, doc._id, entities)}
            icon={ChevronDownIcon}
          />
        </Flex>
      )}
      <Button
        style={{width: `100%`}}
        padding={2}
        mode="bleed"
        onClick={(e) => handleSelect(doc._id, index, e.nativeEvent)}
      >
        <Flex flex={1} align="center">
          <Box flex={1}>
            <Preview
              layout="default"
              value={doc}
              schemaType={schema.get(doc._type) as SchemaType}
            />
          </Box>
        </Flex>
      </Button>
    </Flex>
  )
}
