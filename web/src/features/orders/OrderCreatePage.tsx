import { Button } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { ApiError, useCreateOrder } from '../../api/orders'
import { ErrorView } from '../../components/StateViews'
import { OrderFormFields } from './OrderFormFields'
import { orderSchema, type OrderFormValues } from './orderSchema'

export function OrderCreatePage() {
  const navigate = useNavigate()
  const createOrder = useCreateOrder()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      senderCity: '',
      senderAddress: '',
      receiverCity: '',
      receiverAddress: '',
      pickupDate: '',
    },
  })

  // Only surface a headline error when the failure was not attributable to fields.
  const formError =
    createOrder.error instanceof ApiError &&
    Object.keys(createOrder.error.fieldErrors).length === 0
      ? createOrder.error.message
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
      <h1 className="mb-6 text-2xl font-semibold">New delivery order</h1>
      {formError ? (
        <div className="mb-4">
          <ErrorView message={formError} />
        </div>
      ) : null}
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <OrderFormFields register={register} errors={errors} />
        <div className="flex gap-3">
          <Button type="submit" variant="primary" isDisabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create order'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void navigate('/')}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  )
}
