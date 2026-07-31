import { ErrorMessage, Input, Label } from '@heroui/react'
import type { ComponentProps, ReactNode } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { OrderFormValues } from './orderSchema'

function Field({
  id,
  label,
  error,
  hint,
  ...inputProps
}: {
  id: string
  label: string
  error?: string
  hint?: string
} & ComponentProps<typeof Input>) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} isRequired isInvalid={!!error}>
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        data-invalid={error ? 'true' : undefined}
        {...inputProps}
      />
      {hint ? (
        <span id={hintId} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
      {error ? (
        <ErrorMessage id={errorId} className="text-danger-soft-foreground">
          {error}
        </ErrorMessage>
      ) : null}
    </div>
  )
}

function Group({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <legend className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted">
        <span
          aria-hidden="true"
          className="grid size-[18px] place-items-center rounded-full bg-background-tertiary text-[0.625rem] font-bold tracking-normal text-foreground"
        >
          {step}
        </span>
        {title}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

interface Props {
  register: UseFormRegister<OrderFormValues>
  errors: FieldErrors<OrderFormValues>
}

export function OrderFormFields({ register, errors }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      <Group step={1} title={t('orders.form.groups.sender')}>
        <Field
          id="senderCity"
          label={t('orders.form.city')}
          error={errors.senderCity?.message}
          {...register('senderCity')}
        />
        <Field
          id="senderAddress"
          label={t('orders.form.address')}
          error={errors.senderAddress?.message}
          {...register('senderAddress')}
        />
      </Group>

      <Group step={2} title={t('orders.form.groups.receiver')}>
        <Field
          id="receiverCity"
          label={t('orders.form.city')}
          error={errors.receiverCity?.message}
          {...register('receiverCity')}
        />
        <Field
          id="receiverAddress"
          label={t('orders.form.address')}
          error={errors.receiverAddress?.message}
          {...register('receiverAddress')}
        />
      </Group>

      <Group step={3} title={t('orders.form.groups.shipment')}>
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
          hint={t('orders.form.pickupHint')}
          error={errors.pickupDate?.message}
          {...register('pickupDate')}
        />
      </Group>
    </div>
  )
}
