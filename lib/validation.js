import { z } from 'zod'

/**
 * MongoDB ObjectId validation
 * JUSTIFICATION: OWASP - Whitelist validation prevents injection
 */
export const objectIdSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  'Invalid ID format'
)

/**
 * Message validation
 * JUSTIFICATION: OWASP - Sanitize input, enforce max length to prevent payload attacks
 */
export const messageSchema = z.string()
  .trim()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message too long. Max 2000 characters.')
  .transform((str) => 
    // Remove dangerous characters
    str
      .replace(/\0/g, '') // Null bytes
      .replace(/[${}]/g, '') // NoSQL injection chars
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Non-printable chars
  )

/**
 * Chat request body validation
 */
export const chatRequestSchema = z.object({
  threadId: objectIdSchema.optional(),
  message: messageSchema,
})

/**
 * Thread ID param validation
 */
export const threadIdParamSchema = z.object({
  id: objectIdSchema,
})

/**
 * Safe parse helper - returns { success, data, error }
 */
export function validateRequest(schema, data) {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const error = result.error.errors[0]?.message || 'Validation failed'
    return { success: false, error }
  }
  
  return { success: true, data: result.data }
}