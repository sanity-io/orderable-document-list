import React, {PropsWithChildren} from 'react'
import {Box, Card, Text} from '@sanity/ui'

export default function Feedback({children}: PropsWithChildren<{}>) {
  return (
    <Box padding={3}>
      <Card padding={4} radius={2} shadow={1} tone="caution">
        <Text>{children}</Text>
      </Card>
    </Box>
  )
}
