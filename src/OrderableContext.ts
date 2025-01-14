import {createContext} from 'react'

export interface OrderableContextValue {
  showIncrements?: boolean
}

export const OrderableContext = createContext<OrderableContextValue>({})
