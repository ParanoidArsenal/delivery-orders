import { Button } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { ApiError, useCreateOrder } from '../../api/orders'
import { ErrorView } from '../../components/StateViews'
import { OrderFormFields } from './OrderFormFields'
import { buildOrderSchema, type OrderFormValues } from './orderSchema'

export function OrderCreatePage() {
  const navigate = useNavigate()
  const createOrder = useCreateOrder()
  const { t, i18n } = useTranslation()
  const schema = useMemo(() => buildOrderSchema(t), [t])
  const {
    register,
    handleSubmit,
    setError,
    trigger,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      senderCity: '',
      senderAddress: '',
      receiverCity: '',
      receiverAddress: '',
      pickupDate: '',
    },
  })

  // react-hook-form keeps the resolved message strings in formState, so a language
  // change alone leaves messages already on screen in the previous language. Re-run
  // validation against the new schema, but only when the language actually changed —
  // re-validating on submit would wipe the field errors the server just returned.
  const renderedLanguage = useRef(i18n.language)
  useEffect(() => {
    if (renderedLanguage.current === i18n.language) return
    renderedLanguage.current = i18n.language
    if (isSubmitted) void trigger()
  }, [i18n.language, isSubmitted, trigger])

  // Only surface a headline error when the failure was not attributable to fields.
  const formError =
    createOrder.error instanceof ApiError &&
    Object.keys(createOrder.error.fieldErrors).length === 0
      ? createOrder.error.message || t('common.error')
      : null

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order = await createOrder.mutateAsync(values)
      await navigate(`/orders/${order.id}`)
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          setError(field as keyof OrderFormValues, { message: messages.join(' ') })
        }
      }
    }
  })

  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">{t('orders.form.title')}</h1>
      {formError ? (
        <div className="mb-4">
          <ErrorView message={formError} />
        </div>
      ) : null}
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <OrderFormFields register={register} errors={errors} />
        <div className="flex gap-3">
          <Button type="submit" variant="primary" isDisabled={isSubmitting}>
            {isSubmitting ? t('orders.form.submitting') : t('orders.form.submit')}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void navigate('/')}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </section>
  )
}
