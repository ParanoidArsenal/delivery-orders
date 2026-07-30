import { createBrowserRouter } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { OrderCreatePage } from './features/orders/OrderCreatePage'
import { OrderDetailPage } from './features/orders/OrderDetailPage'
import { OrderListPage } from './features/orders/OrderListPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <OrderListPage /> },
      { path: 'orders/new', element: <OrderCreatePage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
    ],
  },
])
