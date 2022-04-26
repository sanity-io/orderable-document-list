import PropTypes from 'prop-types'
// eslint-disable-next-line no-unused-vars
import React, {useContext} from 'react'
import {DragHandleIcon, ChevronUpIcon, ChevronDownIcon} from '@sanity/icons'
import {Text, Flex, Box, Button} from '@sanity/ui'
import Preview from 'part:@sanity/base/preview'
import schema from 'part:@sanity/base/schema'

import {OrderableContext} from './OrderableContext'

export default function Document({doc, increment, entities, handleSelect, index, isFirst, isLast}) {
  const {showIncrements} = useContext(OrderableContext)

  return (
    <Flex align="center">
      <Box paddingX={3} style={{flexShrink: 0}}>
        <Text fontSize={4}>
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
            <Preview value={doc} type={schema.get(doc._type)} />
          </Box>
        </Flex>
      </Button>
    </Flex>
  )
}

Document.propTypes = {
  doc: PropTypes.shape({
    _id: PropTypes.string,
    _type: PropTypes.string,
  }).isRequired,
  entities: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
    }).isRequired
  ).isRequired,
  handleSelect: PropTypes.func.isRequired,
  increment: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isFirst: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
}
