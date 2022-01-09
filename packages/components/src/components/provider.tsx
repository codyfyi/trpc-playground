import { ClientConfig } from '@trpc-playground/types'
import { createReactQueryHooks } from '@trpc/react'
import { AnyRouter } from '@trpc/server'
import { atom } from 'jotai'
import { Provider as JotaiProvider } from 'jotai'
import { ComponentChildren } from 'preact'
import { useMemo } from 'preact/hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { createInitialValues } from './utils'

// need to pass in AnyRouter to satisfy rollup-plugin-dts
export const trpc = createReactQueryHooks<AnyRouter>()

type PlaygroundProviderProps = {
  config: ClientConfig
  children: ComponentChildren
}

type TrpcClient = ReturnType<typeof trpc.createClient>
export const trpcClientAtom = atom<TrpcClient>(null!)
export const configAtom = atom<Required<ClientConfig>>(null!)

export const PlaygroundProvider = ({ config, children }: PlaygroundProviderProps) => {
  const queryClient = useMemo(() => new QueryClient(), [])
  const trpcClient = useMemo(() =>
    trpc.createClient({
      url: config.trpcApiEndpoint,
    }), [])

  const { get, set } = createInitialValues()
  set(trpcClientAtom, trpcClient)
  set(configAtom, config)

  return (
    <div className='trpc-playground'>
      <JotaiProvider
        initialValues={get()}
      >
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      </JotaiProvider>
    </div>
  )
}
