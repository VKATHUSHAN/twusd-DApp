import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { mainnet } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'

// 2. Create wagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet],
  projectId,
  ssr: false
})

// 3. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
  projectId,
  metadata: {
    name: 'TWUSD Stablecoin',
    description: 'TWUSD Stablecoin dApp on Ethereum Mainnet',
    url: 'https://twusd.app',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  },
  features: {
    analytics: false
  }
})

export { WagmiProvider, QueryClient, QueryClientProvider, queryClient }
