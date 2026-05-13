'use client'

import { forwardRef } from 'react'
import { Button as ChakraButton, ButtonProps as ChakraButtonProps, Spinner } from '@chakra-ui/react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, isDisabled, ...props }, ref) => {
    return (
      <ChakraButton
        ref={ref}
        variant={variant}
        size={size}
        isLoading={loading}
        isDisabled={isDisabled}
        spinner={<Spinner size="sm" />}
        {...props}
      >
        {children}
      </ChakraButton>
    )
  }
)

Button.displayName = 'Button'

export { Button }
