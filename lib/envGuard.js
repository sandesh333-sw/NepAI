export function assertClerkProdKeys() {
  if (process.env.NODE_ENV !== 'production') return

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
  const secretKey = process.env.CLERK_SECRET_KEY || ''

  const usingTestPublishable = publishableKey.startsWith('pk_test_')
  const usingTestSecret = secretKey.startsWith('sk_test_')

  if (usingTestPublishable || usingTestSecret) {
    throw new Error(
      'Clerk test keys detected in production. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to live keys.'
    )
  }
}
