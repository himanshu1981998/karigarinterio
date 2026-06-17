import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Ruler, Leaf, Paintbrush, Truck, Heart, Info } from "lucide-react"

const ProductDetailsPanel = ({ product }) => {
  const specifications = product.specifications || []

  // Always build dimensions from backend numeric fields
  const hasDimensions =
    product.width_cm || product.depth_cm || product.height_cm

  const dimensionsText = hasDimensions
    ? `Width: ${product.width_cm || "-"} cm; Depth: ${
        product.depth_cm || "-"
      } cm; Height: ${product.height_cm || "-"} cm`
    : ""

  //  Remove "Dimensions" if backend sends it in specifications
  const filteredSpecs = specifications.filter(
    (spec) => !spec.name.toLowerCase().includes("dimension")
  )

  // Build final accordion list
  const accordionItems = [
    ...(dimensionsText
      ? [
          {
            name: "Dimensions (Cms)",
            value: dimensionsText,
          },
        ]
      : []),
    ...filteredSpecs,
  ]

  if (!product.description && accordionItems.length === 0) {
    return null
  }

  // Icon mapping
  const getSpecIcon = (name) => {
    const normalized = name.toLowerCase()

    if (normalized.includes("dimension"))
      return <Ruler className="h-4 w-4 text-primary" />

    if (normalized.includes("material"))
      return <Leaf className="h-4 w-4 text-primary" />

    if (normalized.includes("finish"))
      return <Paintbrush className="h-4 w-4 text-primary" />

    if (normalized.includes("shipping") || normalized.includes("delivery"))
      return <Truck className="h-4 w-4 text-primary" />

    if (normalized.includes("care"))
      return <Heart className="h-4 w-4 text-primary" />

    return <Info className="h-4 w-4 text-primary" />
  }

  return (
    <div className="ki-panel rounded-2xl p-5 backdrop-blur sm:p-6">
      {/* Description */}
      {product.description && (
        <div className="mb-6 space-y-5 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
          <h2 className="font-display text-2xl font-bold text-stone-950">Product Story</h2>
          <p>{product.description}</p>
        </div>
      )}

      {/* Accordion */}
      {accordionItems.length > 0 && (
        <Accordion type="multiple" className="w-full" defaultValue={["item-0"]}>
          {accordionItems.map((spec, index) => (
            <AccordionItem
              key={`${spec.name}-${index}`}
              value={`item-${index}`}
              className="border-b border-stone-200 last:border-b-0"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100">
                  {getSpecIcon(spec.name)}
                  </span>
                  <span className="text-sm font-semibold text-stone-900 sm:text-base">
                    {spec.name}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pl-11 text-sm leading-7 text-stone-600">
                {spec.value}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export default ProductDetailsPanel
