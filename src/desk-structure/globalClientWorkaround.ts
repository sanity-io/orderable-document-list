import {SanityClient} from '@sanity/client'
import type {ConfigContext} from 'sanity'
import {SchemaContext} from '../fields/orderRankField'

type ClientSubscription = (client: SanityClient) => void
type ClientKey = `${string}:${string}`
const subscriptions: Record<ClientKey, ClientSubscription[]> = {}

/**
 * @internal
 *
 * v3 does not expose client in the schema API, which means no client for the initial value code.
 * This is a workaround for that; we update the global client from a place we _do_ have access to the client,
 * the use the global in schema-callbacks.
 *
 * Note: The code assumes sanityClientChanged is called AFTER all subscribeSanityClient calls are done.
 */
export function sanityClientChanged(context: ConfigContext) {
  ;(subscriptions[clientKey(context)] ?? []).forEach((subscriber) => subscriber(context.client))
}

/**
 * @internal
 */
export function subscribeSanityClient(context: SchemaContext, callback: ClientSubscription) {
  const key = clientKey(context)
  const existing = subscriptions[key] ?? []
  subscriptions[key] = [...existing, callback]
}

function clientKey(context: SchemaContext): ClientKey {
  return `${context.projectId}:${context.dataset}`
}
