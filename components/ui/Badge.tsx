import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from '@chakra-ui/react'

export type BadgeVariant = 'default' | 'success' | 'error' | 'interactive' | 'muted'

interface BadgeProps extends Omit<ChakraBadgeProps, 'variant'> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'default', children, ...props }: BadgeProps) {
  return (
    <ChakraBadge variant={variant} {...props}>
      {children}
    </ChakraBadge>
  )
}
