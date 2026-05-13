import { Box, BoxProps, Text, TextProps, Divider } from '@chakra-ui/react'
import { forwardRef, HTMLAttributes } from 'react'

interface CardProps extends BoxProps {
  hoverable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        bg="surface"
        border="1px solid"
        borderColor="border.default"
        borderRadius="xl"
        p={4}
        transition={hoverable ? 'colors 0.15s' : undefined}
        _hover={hoverable ? { borderColor: '#D1D5DB', _dark: { borderColor: '#3D3D3D' }, cursor: 'pointer' } : undefined}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = ({ children, ...props }: BoxProps) => (
  <Box mb={3} {...props}>{children}</Box>
)

const CardTitle = ({ children, ...props }: BoxProps) => (
  <Box as="h3" fontSize="h4" color="text.primary" {...props}>{children}</Box>
)

const CardDescription = ({ children, ...props }: BoxProps) => (
  <Box as="p" fontSize="sm" color="text.secondary" mt={1} {...props}>{children}</Box>
)

const CardContent = ({ children, ...props }: BoxProps) => (
  <Box {...props}>{children}</Box>
)

const CardFooter = ({ children, ...props }: BoxProps) => (
  <Box mt={4} pt={3} borderTop="1px solid" borderColor="border.default" {...props}>{children}</Box>
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
