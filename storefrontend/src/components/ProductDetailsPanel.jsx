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
      return <Ruler className="h-5 w-5 text-zinc-600" />

    if (normalized.includes("material"))
      return <Leaf className="h-5 w-5 text-zinc-600" />

    if (normalized.includes("finish"))
      return <Paintbrush className="h-5 w-5 text-zinc-600" />

    if (normalized.includes("shipping") || normalized.includes("delivery"))
      return <Truck className="h-5 w-5 text-zinc-600" />

    if (normalized.includes("care"))
      return <Heart className="h-5 w-5 text-zinc-600" />

    return <Info className="h-5 w-5 text-zinc-600" />
  }

  return (
    <div className="space-y-8">
      {/* Description */}
      {product.description && (
        <div className="space-y-5 text-base leading-8 text-zinc-600 sm:text-lg sm:leading-10">
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
              className="border-b border-zinc-200"
            >
              <AccordionTrigger className="py-5 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  {getSpecIcon(spec.name)}
                  <span className="text-base font-medium text-zinc-800">
                    {spec.name}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pl-8 text-sm leading-6 text-zinc-600 sm:text-base">
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