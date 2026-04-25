import { z } from 'zod'

// MongoDB ObjectId validation
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID')

// Message validation - trim, sanitize, enforce max length
export const messageSchema = z.string()
  .trim()
  .min(1, 'Message required')
  .max(2000, 'Message too long (max 2000 chars)')
  .transform(str => 
    str.replace(/\0/g, '').replace(/[${}]/g, '')
  )

// Chat request body
export const chatBodySchema = z.object({
  threadId: objectIdSchema.optional(),
  message: messageSchema,
})

// Simple helper
export function validate(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstIssue =
      result.error?.issues?.[0] ||
      result.error?.errors?.[0]

    return { ok: false, error: firstIssue?.message || 'Invalid request payload' }
  }
  return { ok: true, data: result.data }
}