import {useClient} from 'sanity'
import {useMemo} from 'react'

export function useSanityClient() {
  const baseClient = useClient()
  return useMemo(
    () =>
      baseClient.withConfig({
        apiVersion: '2021-09-01',
      }),
    [baseClient]
  )
}
