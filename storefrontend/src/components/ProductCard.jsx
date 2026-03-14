import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const ProductCard = ({product}) => {


  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-sm ring-1 ring-zinc-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-950/10">

      {/* Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-50 aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* Category */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <CardContent className="flex grow flex-col justify-between gap-2 p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight text-zinc-900 transition-colors group-hover:text-zinc-600">
          {product.name}
        </h3>

        <p className="text-xl font-bold tracking-tight text-zinc-900">
          ₹{product.price}
        </p>
      </CardContent>

      {/* Button */}
      <CardFooter className="mt-auto p-5 pt-0">
        <Button className="w-full rounded-xl">
          Add to Basket
        </Button>
      </CardFooter>

    </Card>
  )
  
}

export default ProductCard