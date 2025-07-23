import {type SanityClient, useClient, usePerspective} from 'sanity'
import {API_VERSION} from './constants'

export function useSanityClient(): SanityClient {
  const {perspectiveStack} = usePerspective()

  return useClient({apiVersion: API_VERSION}).withConfig({perspective: perspectiveStack})
}
