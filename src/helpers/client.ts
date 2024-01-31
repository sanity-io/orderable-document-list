import {useClient} from 'sanity'
import {API_VERSION} from './constants'

export function useSanityClient() {
  return useClient({apiVersion: API_VERSION})
}
