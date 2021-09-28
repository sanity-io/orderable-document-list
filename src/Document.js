import PropTypes from 'prop-types'
// eslint-disable-next-line no-unused-vars
import React, {useCallback, useContext, useMemo} from 'react'
import {
  DragHandleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
} from '@sanity/icons'
import {Text, Flex, Box, Button} from '@sanity/ui'
import {usePaneRouter} from '@sanity/desk-tool'
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
      <Button
        style={{width: `100%`}}
        padding={2}
        mode="bleed"
        onClick={(e) => handleSelect(doc._id, index, e.nativeEvent)}
      >
        <Flex flex={1} align="center">
          {showIncrements && (
            <Flex style={{flexShrink: 0}} align="center" gap={1} paddingRight={2}>
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
          <Box flex={1}>
            <Preview value={doc} type={schema.get(doc._type)} />
          </Box>
        </Flex>
      </Button>
      <Box paddingX={3} style={{flexShrink: 0}}>
        <ChildEditLink id={doc._id}>
          <Text fontSize={4}>
            {doc._id.startsWith(`drafts.`) ? <EditIcon /> : <ChevronRightIcon />}
          </Text>
        </ChildEditLink>
      </Box>
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

const ChildEditLink = ({id, children}) => {
  const router = usePaneRouter()
  // console.log(router)

  if (!router) return null

  // const {ChildLink, routerPanesState} = router
  // console.log(ChildLink)

  // Is this document currently being edited
  // const isOpen = useMemo(
  //   () => routerPanesState.some((pane) => pane[0]?.id === id.replace(`drafts.`, ``)),
  //   [id, routerPanesState]
  // )

  // const Link = useCallback(
  //   (linkProps) => <ChildLink {...linkProps} childId={id.replace(`drafts.`, ``)} />,
  //   [ChildLink, id]
  // )

  return (
    <Button
      // as={Link}
      // mode={isOpen ? `default` : `ghost`}
      // tone={isOpen ? `primary` : `transparent`}
      padding={2}
    >
      {children}
    </Button>
  )
}

ChildEditLink.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}
