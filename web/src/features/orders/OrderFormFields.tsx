import { ErrorMessage, Input, Label } from '@heroui/react'
import type { ComponentProps } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { OrderFormValues } from './orderSchema'

/**
 * HeroUI v3 is composition-based (it wraps react-aria-components and has no
 * TextField wrapper), so label association is wired explicitly here: htmlFor/id
 * plus aria-describedby and aria-invalid. Screen readers and the tests both rely
 * on this being real, not visual.
 */
function Field({
  id,
  label,
  error,
  ...inputProps
}: {
  id: string
  label: string
  error?: string
} & ComponentProps<typeof Input>) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} isRequired isInvalid={!!error}>
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        // HeroUI styles the invalid state from data-invalid, which react-aria only
        // sets automatically inside a TextField context that v3 does not provide.
        data-invalid={error ? 'true' : undefined}
        {...inputProps}
      />
      {/* danger-soft-foreground rather than HeroUI's default --danger: plain danger on
          the page background is only 3.27:1 at this size, below WCAG AA. */}
      {error ? (
        <ErrorMessage id={errorId} className="text-danger-soft-foreground">
          {error}
        </ErrorMessage>
      ) : null}
    </div>
  )
}

interface Props {
  register: UseFormRegister<OrderFormValues>
  errors: FieldErrors<OrderFormValues>
}

export function OrderFormFields({ register, errors }: Props) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field
        id="senderCity"
        label={t('orders.form.senderCity')}
        error={errors.senderCity?.message}
        {...register('senderCity')}
      />
      <Field
        id="senderAddress"
        label={t('orders.form.senderAddress')}
        error={errors.senderAddress?.message}
        {...register('senderAddress')}
      />
      <Field
        id="receiverCity"
        label={t('orders.form.receiverCity')}
        error={errors.receiverCity?.message}
        {...register('receiverCity')}
      />
      <Field
        id="receiverAddress"
        label={t('orders.form.receiverAddress')}
        error={errors.receiverAddress?.message}
        {...register('receiverAddress')}
      />
      <Field
        id="weightKg"
        label={t('orders.form.weight')}
        type="number"
        step="0.01"
        min="0.01"
        error={errors.weightKg?.message}
        {...register('weightKg', { valueAsNumber: true })}
      />
      <Field
        id="pickupDate"
        label={t('orders.form.pickupDate')}
        type="date"
        error={errors.pickupDate?.message}
        {...register('pickupDate')}
      />
    </div>
  )
}
