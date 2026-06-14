import { ethers } from 'ethers'

/**
 * Build the message a requester signs to prove ownership of to_address
 * Format is deterministic — both client and server construct it identically
 */
export function buildIntentMessage(params: {
  amount: number | string
  reason: string
  to_address: string
  token: string
}): string {
  return `PayNote Payment Intent\nAmount: ${params.amount}\nReason: ${params.reason}\nRecipient: ${params.to_address.toLowerCase()}\nToken: ${params.token}`
}

/**
 * Verify that `signature` was produced by `to_address` signing the intent message.
 * Uses EIP-191 personal_sign recovery — no gas, no transaction.
 */
export function verifyIntentSignature(params: {
  amount: number | string
  reason: string
  to_address: string
  token: string
  signature: string
}): boolean {
  try {
    const message = buildIntentMessage(params)
    const recovered = ethers.verifyMessage(message, params.signature)
    return recovered.toLowerCase() === params.to_address.toLowerCase()
  } catch {
    return false
  }
}
