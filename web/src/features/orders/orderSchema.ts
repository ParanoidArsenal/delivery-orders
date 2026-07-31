import type { TFunction } from 'i18next'
import { z } from 'zod'

const MAX_CITY = 100
const MAX_ADDRESS = 250
const MAX_WEIGHT = 20000

export function today(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function buildOrderSchema(t: TFunction) {
  const requiredText = (max: number, fieldKey: string) =>
    z
      .string()
      .trim()
      .min(1, t('validation.required', { field: t(fieldKey) }))
      .max(max, t('validation.maxLength', { field: t(fieldKey), max }))

  return z.object({
    senderCity: requiredText(MAX_CITY, 'orders.fields.senderCity'),
    senderAddress: requiredText(MAX_ADDRESS, 'orders.fields.senderAddress'),
    receiverCity: requiredText(MAX_CITY, 'orders.fields.receiverCity'),
    receiverAddress: requiredText(MAX_ADDRESS, 'orders.fields.receiverAddress'),
    weightKg: z
      .number({ error: t('validation.required', { field: t('orders.fields.weight') }) })
      .positive(t('validation.weightPositive'))
      .max(MAX_WEIGHT, t('validation.weightMax', { max: MAX_WEIGHT }))
      .refine((v) => Math.round(v * 100) / 100 === v, {
        message: t('validation.weightDecimals'),
      }),
    pickupDate: z
      .string()
      .min(1, t('validation.required', { field: t('orders.fields.pickupDate') }))
      .refine((value) => value >= today(), { message: t('validation.pickupDatePast') }),
  })
}

export type OrderFormValues = z.infer<ReturnType<typeof buildOrderSchema>>
