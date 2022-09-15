import {useClient} from 'sanity'

export function useSanityClient() {
  return useClient({apiVersion: '2021-09-01'})
}
