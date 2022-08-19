import React from 'react'

export interface OrderableContextValue {
  showIncrements?: boolean
}

export const OrderableContext = React.createContext<OrderableContextValue>({})
