import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const OrderDetailsModal = ({ order, open, onOpenChange }) => {
  if (!order) return null

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-[900px] max-h-[90vh] overflow-hidden rounded-2xl p-0">
        <div className="flex max-h-[90vh] flex-col bg-white">
          {/* Header */}
          <DialogHeader className="border-b px-4 py-4 sm:px-5">
            <DialogTitle className="pr-8 text-lg font-bold text-zinc-900 sm:text-2xl">
              Order Details - {order.orderNumber}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <div className="space-y-6">
              {/* Top info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-[#8B5E3C] sm:text-xl">
                    Order Information
                  </h3>

                  <div className="space-y-1 text-sm text-zinc-700">
                    <p>
                      <span className="font-medium text-zinc-900">Order ID:</span>{" "}
                      {order.orderNumber}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Date Placed:</span>{" "}
                      {formattedDate}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Status:</span>{" "}
                      <span className="capitalize">{order.status}</span>
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Payment Method:</span>{" "}
                      {order.customer?.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-[#8B5E3C] sm:text-xl">
                    Shipping Information
                  </h3>

                  <div className="space-y-1 text-sm text-zinc-700">
                    <p>
                      <span className="font-medium text-zinc-900">Name:</span>{" "}
                      {order.customer?.fullName}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Address:</span>{" "}
                      {order.customer?.address}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">City:</span>{" "}
                      {order.customer?.city}, {order.customer?.state}{" "}
                      {order.customer?.pincode}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Contact:</span>{" "}
                      {order.customer?.phone}
                    </p>
                    {order.customer?.email && (
                      <p>
                        <span className="font-medium text-zinc-900">Email:</span>{" "}
                        {order.customer.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t" />

              {/* Order summary */}
              <div>
                <h3 className="mb-4 text-xl font-semibold text-[#8B5E3C] sm:text-2xl">
                  Order Summary
                </h3>

                <div className="overflow-hidden rounded-xl border">
                  {/* Desktop header */}
                  <div className="hidden grid-cols-[1fr_100px_140px] border-b bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-600 sm:grid">
                    <div>Item</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Price</div>
                  </div>

                  {/* Items */}
                  <div className="divide-y">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {/* Desktop row */}
                        <div className="hidden grid-cols-[1fr_100px_140px] items-center px-4 py-4 sm:grid">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>

                            <div className="min-w-0">
                              <p className="line-clamp-2 font-medium text-zinc-900">
                                {item.name}
                              </p>
                            </div>
                          </div>

                          <div className="text-center text-zinc-700">
                            {item.quantity}
                          </div>

                          <div className="text-right font-semibold text-zinc-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>

                        {/* Mobile card row */}
                        <div className="flex gap-3 px-4 py-4 sm:hidden">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium text-zinc-900">
                              {item.name}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                              <span>Qty: {item.quantity}</span>
                              <span className="font-semibold text-zinc-900">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between border-t bg-zinc-50 px-4 py-4">
                    <span className="text-lg font-semibold text-zinc-900 sm:text-xl">
                      Total
                    </span>
                    <span className="text-xl font-bold text-[#8B5E3C] sm:text-2xl">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

   
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OrderDetailsModal