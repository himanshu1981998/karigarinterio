import { useState } from "react"
import { Home, MapPin, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const ShippingAddresses = () => {
  const [addresses] = useState([
    {
      id: 1,
      label: "Home",
      full_name: "Himanshu Chawla",
      phone: "9086699653",
      address_line: "Narayan Kripa, Indra Nagar",
      city: "Jodhpur",
      state: "Rajasthan",
      pincode: "342001",
      is_default: true,
    },
  ])

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            Shipping Addresses
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your saved delivery addresses.
          </p>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-zinc-400" />
          <p className="mt-3 text-sm text-zinc-500">
            No saved addresses yet.
          </p>

          <Button
            variant="outline"
            className="mt-4 rounded-xl border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify center mt-1 rounded-full bg-white p-2 shadow-sm">
                    <Home className="h-4 w-4 text-zinc-700" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-zinc-900">
                        {address.label}
                      </h3>

                      {address.is_default && (
                        <span className="rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm font-medium text-zinc-900">
                      {address.full_name}
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">
                      {address.address_line}, {address.city}, {address.state}{" "}
                      {address.pincode}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Contact: {address.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="rounded-lg p-2 text-zinc-600 transition hover:bg-white hover:text-zinc-900">
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button className="rounded-lg p-2 text-zinc-600 transition hover:bg-white hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Button
            
            className="w-full rounded-xl border border-dashed text-white hover:text-white bg-[#8B5E3C]  hover:bg-[#7A5234]"
          >
            <Plus className="mr-2 h-4 w-4 text-white" />
            Add Address
          </Button>
        </div>
      )}
    </section>
  )
}

export default ShippingAddresses