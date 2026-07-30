import { z } from 'zod'

const MAX_CITY = 100
const MAX_ADDRESS = 250
const MAX_WEIGHT = 20000

const requiredText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be at most ${max} characters.`)

/** Today in the user's local timezone, as YYYY-MM-DD. */
export function today(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

/**
 * Mirrors the server's FluentValidation rules so the user gets immediate feedback.
 * The server remains the authority.
 */
export const orderSchema = z.object({
  senderCity: requiredText(MAX_CITY, 'Sender city'),
  senderAddress: requiredText(MAX_ADDRESS, 'Sender address'),
  receiverCity: requiredText(MAX_CITY, 'Receiver city'),
  receiverAddress: requiredText(MAX_ADDRESS, 'Receiver address'),
  weightKg: z
    .number({ error: 'Weight is required.' })
    .positive('Weight must be greater than 0 kg.')
    .max(MAX_WEIGHT, `Weight must not exceed ${MAX_WEIGHT} kg.`)
    .refine((v) => Math.round(v * 100) / 100 === v, {
      message: 'Weight must have at most 2 decimal places.',
    }),
  pickupDate: z
    .string()
    .min(1, 'Pickup date is required.')
    .refine((value) => value >= today(), { message: 'Pickup date must not be in the past.' }),
})

export type OrderFormValues = z.infer<typeof orderSchema>
