import { randomUUID } from "crypto"

/**
 * Generate a new UUID
 */
export function generateId(): string {
  return randomUUID()
}

/**
 * Get current timestamp for createdAt/updatedAt fields
 */
export function getNow(): Date {
  return new Date()
}

