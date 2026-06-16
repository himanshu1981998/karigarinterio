import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import OrderDetailsModal from "@/components/OrderDetailsModal"
import api from "@/lib/api"
import { requestOrderCancellation, requestOrderReturn } from "@/lib/orderApi"
import { toast } from "sonner"

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [openDetailsModal, setOpenDetailsModal] = useState(false)

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setOpenDetailsModal(true)
  }

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/orders/")
      setOrders(res.data)
    } catch (err) {
      console.error("Failed to fetch orders", err)
    } finally {
      setLoading(false)
    }
  }, [])

  //  FETCH ORDERS FROM BACKEND
  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleCancelRequest = async (order) => {
    const reason = window.prompt("Why do you want to cancel this order?")
    if (!reason?.trim()) return

    try {
      const updated = await requestOrderCancellation(order.order_number, reason.trim())
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      toast.success("Cancellation request sent", { position: "bottom-center" })
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to request cancellation", { position: "bottom-center" })
    }
  }

  const handleReturnRequest = async (order) => {
    const reason = window.prompt("Why do you want to return this order?")
    if (!reason?.trim()) return

    try {
      const updated = await requestOrderReturn(order.order_number, reason.trim())
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      toast.success("Return request sent", { position: "bottom-center" })
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to request return", { position: "bottom-center" })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        
        <h1 className="mb-5 text-xl font-bold text-zinc-900 sm:text-2xl">
          My Orders
        </h1>

        {/*  LOADING */}
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-zinc-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-zinc-600">
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
                {/* HEADER */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">
                      Order Number
                    </p>

                    <h2 className="break-all text-base font-semibold text-zinc-900 sm:text-lg">
                      {order.order_number}
                    </h2>
                  </div>

                  <div className="text-xs text-zinc-500 sm:text-sm">
                    {new Date(order.placed_at).toLocaleDateString()}
                  </div>
                </div>

                {/* INFO */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  
                  {/* STATUS */}
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                    {order.status}
                  </span>

                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                    Payment: {order.payment_status}
                  </span>

                  {/* ITEMS COUNT */}
                  <span className="text-xs text-zinc-600">
                    {order.items.length} items
                  </span>

                  {/* TOTAL */}
                  <span className="text-sm font-semibold text-zinc-900">
                    ₹{Number(order.total).toLocaleString()}
                  </span>

                </div>

                {(order.courier_name || order.tracking_number || order.tracking_url) && (
                  <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
                    {order.courier_name && <p>Courier: {order.courier_name}</p>}
                    {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}
                    {order.tracking_url && (
                      <a href={order.tracking_url} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                        Track shipment
                      </a>
                    )}
                  </div>
                )}

                {(order.cancellation_status !== "none" || order.return_status !== "none") && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {order.cancellation_status !== "none" && (
                      <span className="rounded-full bg-red-50 px-3 py-1 font-medium capitalize text-red-700">
                        Cancellation: {order.cancellation_status}
                      </span>
                    )}
                    {order.return_status !== "none" && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 font-medium capitalize text-blue-700">
                        Return: {order.return_status}
                      </span>
                    )}
                  </div>
                )}

                {/* BUTTON */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(order)}
                    className="rounded-full"
                  >
                    View Details
                  </Button>
                  {order.can_request_cancellation && (
                    <Button variant="outline" className="rounded-full" onClick={() => handleCancelRequest(order)}>
                      Request Cancellation
                    </Button>
                  )}
                  {order.can_request_return && (
                    <Button variant="outline" className="rounded-full" onClick={() => handleReturnRequest(order)}>
                      Request Return
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
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
