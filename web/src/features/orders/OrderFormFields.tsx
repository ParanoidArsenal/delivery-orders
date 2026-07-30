import { ErrorMessage, Input, Label } from '@heroui/react'
import type { ComponentProps } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
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
        {...inputProps}
      />
      {error ? <ErrorMessage id={errorId}>{error}</ErrorMessage> : null}
    </div>
  )
}

interface Props {
  register: UseFormRegister<OrderFormValues>
  errors: FieldErrors<OrderFormValues>
}

export function OrderFormFields({ register, errors }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field
        id="senderCity"
        label="Sender city"
        error={errors.senderCity?.message}
        {...register('senderCity')}
      />
      <Field
        id="senderAddress"
        label="Sender address"
        error={errors.senderAddress?.message}
        {...register('senderAddress')}
      />
      <Field
        id="receiverCity"
        label="Receiver city"
        error={errors.receiverCity?.message}
        {...register('receiverCity')}
      />
      <Field
        id="receiverAddress"
        label="Receiver address"
        error={errors.receiverAddress?.message}
        {...register('receiverAddress')}
      />
      <Field
        id="weightKg"
        label="Weight, kg"
        type="number"
        step="0.01"
        min="0.01"
        error={errors.weightKg?.message}
        {...register('weightKg', { valueAsNumber: true })}
      />
      <Field
        id="pickupDate"
        label="Pickup date"
        type="date"
        error={errors.pickupDate?.message}
        {...register('pickupDate')}
      />
    </div>
  )
}
