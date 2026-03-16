import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const ProductTabs = ({ product }) => {
  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="description">

        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4 text-zinc-600">
          {product.description}
        </TabsContent>

        <TabsContent value="materials" className="mt-4 text-zinc-600">
          Solid wood with premium finish.
        </TabsContent>

        <TabsContent value="shipping" className="mt-4 text-zinc-600">
          Delivery within 5-7 business days across India.
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default ProductTabs