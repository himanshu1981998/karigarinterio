import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useOrderStore } from "@/store/orderStore"
import OrderDetailsModal from "@/components/OrderDetailsModal"

const OrdersPage = () => {
  const orders = useOrderStore((state) => state.orders)

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [openDetailsModal, setOpenDetailsModal] = useState(false)

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setOpenDetailsModal(true)
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <h1 className="mb-5 text-xl font-bold text-zinc-900 sm:mb-6 sm:text-2xl">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center shadow-sm sm:p-8">
            <p className="text-sm text-zinc-600 sm:text-base">
              No orders placed yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 sm:text-sm">
                      Order Number
                    </p>
                    <h2 className="break-all text-base font-semibold text-zinc-900 sm:text-lg">
                      {order.orderNumber}
                    </h2>
                  </div>

                  <div className="text-xs text-zinc-500 sm:text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 sm:text-sm capitalize">
                    {order.status}
                  </span>

                  <span className="text-xs text-zinc-600 sm:text-sm">
                    {order.items.length} items
                  </span>

                  <span className="text-sm font-semibold text-zinc-900">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(order)}
                    className="rounded-full"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <OrderDetailsModal
          order={selectedOrder}
          open={openDetailsModal}
          onOpenChange={setOpenDetailsModal}
        />
      </div>
    </div>
  )
}

export default OrdersPage