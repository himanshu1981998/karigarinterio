import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const OrderDetailsModal = ({ order, open, onOpenChange }) => {
  if (!order) return null

  const formattedDate = new Date(order.placed_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-[900px] max-h-[90vh] overflow-hidden rounded-2xl p-0">
        <div className="flex max-h-[90vh] flex-col bg-white">

          {/* HEADER */}
          <DialogHeader className="border-b px-4 py-4 sm:px-5">
            <DialogTitle className="pr-8 text-lg font-bold text-zinc-900 sm:text-2xl">
              Order Details - {order.order_number}
            </DialogTitle>
          </DialogHeader>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <div className="space-y-6">

              {/* TOP INFO */}
              <div className="grid gap-6 md:grid-cols-2">

                {/* ORDER INFO */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-[#8B5E3C]">
                    Order Information
                  </h3>

                  <div className="space-y-1 text-sm text-zinc-700">
                    <p>
                      <span className="font-medium text-zinc-900">Order ID:</span>{" "}
                      {order.order_number}
                    </p>

                    <p>
                      <span className="font-medium text-zinc-900">Date:</span>{" "}
                      {formattedDate}
                    </p>

                    <p>
                      <span className="font-medium text-zinc-900">Status:</span>{" "}
                      <span className="capitalize">{order.status}</span>
                    </p>

                    <p>
                      <span className="font-medium text-zinc-900">Payment:</span>{" "}
                      {order.payment_method === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>

                    <p>
                      <span className="font-medium text-zinc-900">Payment Status:</span>{" "}
                      <span className="capitalize">{order.payment_status}</span>
                    </p>

                    {order.razorpay_payment_id && (
                      <p className="break-all">
                        <span className="font-medium text-zinc-900">Razorpay Payment ID:</span>{" "}
                        {order.razorpay_payment_id}
                      </p>
                    )}

                    {order.razorpay_refund_id && (
                      <p className="break-all">
                        <span className="font-medium text-zinc-900">Refund ID:</span>{" "}
                        {order.razorpay_refund_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* SHIPPING INFO */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-[#8B5E3C]">
                    Shipping Information
                  </h3>

                  <div className="space-y-1 text-sm text-zinc-700">
                    <p>
                      <span className="font-medium text-zinc-900">Name:</span>{" "}
                      {order.shipping_full_name}
                    </p>

                    <p>
                      <span className="font-medium text-zinc-900">Address:</span>{" "}
                      {order.shipping_address_line}
                    </p>

                    <p>
                      <span className="font-medium text-zinc-900">City:</span>{" "}
                      {order.shipping_city}, {order.shipping_state}{" "}
                      {order.shipping_pincode}
                    </p>

                    <p>
                      <span className="font-medium text-zinc-900">Phone:</span>{" "}
                      {order.shipping_phone}
                    </p>

                    {order.shipping_landmark && (
                      <p>
                        <span className="font-medium text-zinc-900">Landmark:</span>{" "}
                        {order.shipping_landmark}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {(order.courier_name || order.tracking_number || order.tracking_url) && (
                <>
                  <div className="border-t" />
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-[#8B5E3C]">
                      Shipment Tracking
                    </h3>
                    <div className="space-y-1 text-sm text-zinc-700">
                      {order.courier_name && (
                        <p><span className="font-medium text-zinc-900">Courier:</span> {order.courier_name}</p>
                      )}
                      {order.tracking_number && (
                        <p><span className="font-medium text-zinc-900">Tracking Number:</span> {order.tracking_number}</p>
                      )}
                      {order.tracking_url && (
                        <a href={order.tracking_url} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                          Open tracking link
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}

              {(order.cancellation_status !== "none" || order.return_status !== "none") && (
                <>
                  <div className="border-t" />
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-[#8B5E3C]">
                      Requests
                    </h3>
                    <div className="space-y-2 text-sm text-zinc-700">
                      {order.cancellation_status !== "none" && (
                        <p>
                          <span className="font-medium text-zinc-900">Cancellation:</span>{" "}
                          <span className="capitalize">{order.cancellation_status}</span>
                          {order.cancellation_reason ? ` - ${order.cancellation_reason}` : ""}
                        </p>
                      )}
                      {order.return_status !== "none" && (
                        <p>
                          <span className="font-medium text-zinc-900">Return:</span>{" "}
                          <span className="capitalize">{order.return_status}</span>
                          {order.return_reason ? ` - ${order.return_reason}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="border-t" />

              {/* ORDER ITEMS */}
              <div>
                <h3 className="mb-4 text-xl font-semibold text-[#8B5E3C]">
                  Order Summary
                </h3>

                <div className="overflow-hidden rounded-xl border">

                  {/* DESKTOP HEADER */}
                  <div className="hidden grid-cols-[1fr_100px_140px] border-b bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-600 sm:grid">
                    <div>Item</div>
                    <div className="text-center">Qty</div>
                    <div className="text-right">Price</div>
                  </div>

                  {/* ITEMS */}
                  <div className="divide-y">
                    {order.items.map((item) => (
                      <div key={item.id}>

                        {/* DESKTOP */}
                        <div className="hidden grid-cols-[1fr_100px_140px] items-center px-4 py-4 sm:grid">
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-medium text-zinc-900">
                              {item.product_name}
                            </p>
                          </div>

                          <div className="text-center text-zinc-700">
                            {item.quantity}
                          </div>

                          <div className="text-right font-semibold text-zinc-900">
                            ₹{Number(item.line_total).toLocaleString()}
                          </div>
                        </div>

                        {/* MOBILE */}
                        <div className="flex gap-3 px-4 py-4 sm:hidden">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-zinc-900">
                              {item.product_name}
                            </p>

                            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
                              <span>Qty: {item.quantity}</span>

                              <span className="font-semibold text-zinc-900">
                                ₹{Number(item.line_total).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* TOTAL */}
                  <div className="flex items-center justify-between border-t bg-zinc-50 px-4 py-4">
                    <span className="text-lg font-semibold text-zinc-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-[#8B5E3C]">
                      ₹{Number(order.total).toLocaleString()}
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
