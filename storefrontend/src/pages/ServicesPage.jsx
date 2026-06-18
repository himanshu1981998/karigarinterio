import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  X,
  Wrench,
  Hammer,
  Zap,
  PanelsTopLeft,
  CookingPot,
  DoorOpen,
  Paintbrush,
  Drill,
  LayoutGrid,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createServiceEnquiry } from "@/lib/serviceApi"

const servicesList = [
  { id: "plumbing", label: "Plumbing", icon: Wrench },
  { id: "false-ceiling", label: "False Ceiling Work", icon: PanelsTopLeft },
  { id: "electrical", label: "Electrical Work", icon: Zap },
  { id: "window-installation", label: "Window Installation", icon: DoorOpen },
  { id: "modular-kitchen", label: "Modular Kitchen", icon: CookingPot },
  { id: "wardrobe-installation", label: "Wardrobe Installation", icon: LayoutGrid },
  { id: "painting", label: "Painting", icon: Paintbrush },
  { id: "carpentry", label: "Carpentry", icon: Hammer },
  { id: "tile-work", label: "Tile Work", icon: Drill },
  { id: "consultation", label: "Interior Consultation", icon: MessageSquare },
]

const initialForm = {
  full_name: "",
  phone: "",
  city: "",
  other_service: "",
  requirements: "",
}

const ServicesPage = () => {
  const [selectedServices, setSelectedServices] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)
  const serviceDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target)
      ) {
        setIsServiceDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((item) => item !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.full_name.trim() || !formData.phone.trim() || !formData.city.trim()) {
      toast.error("Please fill all required details", {
        position: "bottom-center",
      })
      return
    }

    if (selectedServices.length === 0 && !formData.other_service.trim()) {
      toast.error("Please select at least one service or write another service", {
        position: "bottom-center",
      })
      return
    }

    try {
      setLoading(true)

      await createServiceEnquiry({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        selected_services: selectedServices,
        other_service: formData.other_service.trim(),
        requirements: formData.requirements.trim(),
      })

      toast.success("Request submitted successfully", {
        description: "Our team will get in touch with you soon.",
        position: "bottom-center",
      })

      setSelectedServices([])
      setFormData(initialForm)
      setIsServiceDropdownOpen(false)
    } catch (error) {
      const data = error?.response?.data || {}

      const message =
        data?.detail ||
        data?.phone?.[0] ||
        data?.full_name?.[0] ||
        data?.city?.[0] ||
        data?.non_field_errors?.[0] ||
        (typeof data === "string" ? data : null) ||
        "Failed to submit request"

      toast.error(message, {
        position: "bottom-center",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedServiceLabels = servicesList
    .filter((service) => selectedServices.includes(service.id))
    .map((service) => service.label)

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
            Our Services
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Choose the services you need
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 sm:text-base">
            From plumbing and electrical work to false ceiling, windows, and
            custom interior solutions, tell us what you need and our team will
            connect with you.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-zinc-900">
              Select Services
            </h2>

            <div ref={serviceDropdownRef} className="relative mt-5 sm:hidden">
              <button
                type="button"
                onClick={() => setIsServiceDropdownOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-zinc-300"
                aria-expanded={isServiceDropdownOpen}
                aria-controls="mobile-service-options"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-zinc-900">
                    {selectedServices.length > 0
                      ? `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} selected`
                      : "Select services"}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">
                    {selectedServiceLabels.length > 0
                      ? selectedServiceLabels.join(", ")
                      : "Choose one or more services"}
                  </span>
                </span>

                <ChevronDown
                  className={`ml-3 h-4 w-4 shrink-0 text-zinc-500 transition-transform ${
                    isServiceDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {isServiceDropdownOpen && (
                <div
                  id="mobile-service-options"
                  role="listbox"
                  aria-multiselectable="true"
                  className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"
                >
                  {servicesList.map((service) => {
                    const isActive = selectedServices.includes(service.id)

                    return (
                      <button
                        key={service.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => toggleService(service.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          isActive
                            ? "bg-[#8B5E3C]/5 text-zinc-950"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            isActive
                              ? "border-[#8B5E3C] bg-[#8B5E3C]"
                              : "border-zinc-300 bg-white"
                          }`}
                        >
                          {isActive && (
                            <span className="h-2 w-2 rounded-sm bg-white" />
                          )}
                        </span>
                        <span className="text-sm font-medium">
                          {service.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedServiceLabels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {servicesList
                    .filter((service) => selectedServices.includes(service.id))
                    .map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggleService(service.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#8B5E3C]/10 px-2.5 py-1 text-xs font-medium text-[#7A5234]"
                      >
                        {service.label}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-3">
              {servicesList.map((service) => {
                const Icon = service.icon
                const isActive = selectedServices.includes(service.id)

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-[#8B5E3C] bg-[#8B5E3C]/5 shadow-sm"
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-[#8B5E3C] text-white"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="text-sm font-medium text-zinc-900">
                        {service.label}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-8">
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Need another service?
              </label>
              <Input
                name="other_service"
                value={formData.other_service}
                onChange={handleChange}
                placeholder="Write another service you need"
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-zinc-900">
              Request a Callback
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Full Name
                </label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="Enter your phone number"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  City
                </label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Project Requirements
                </label>
                <Textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Tell us more about your requirement, space, timeline, or any specific details"
                  className="min-h-[120px]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#8B5E3C] text-white hover:bg-[#7A5234]"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ServicesPage
