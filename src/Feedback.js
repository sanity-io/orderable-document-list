import PropTypes from 'prop-types'
import React from 'react'
import {Box, Card, Text} from '@sanity/ui'

export default function Feedback({children}) {
  return (
    <Box padding={3}>
      <Card padding={4} radius={2} shadow={1} tone="caution">
        <Text>{children}</Text>
      </Card>
    </Box>
  )
}

Feedback.propTypes = {
  children: PropTypes.node.isRequired,
}
