'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '@/lib/theme'
import { ToastProvider } from '@/components/ui/Toast'
import { EmotionCacheProvider } from '@/lib/emotion-registry'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EmotionCacheProvider>
      <ChakraProvider theme={theme}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ChakraProvider>
    </EmotionCacheProvider>
  )
}
