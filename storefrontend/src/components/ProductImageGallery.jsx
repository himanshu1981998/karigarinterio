import { useState } from "react"

const ProductImageGallery = ({ images }) => {
  const [activeImage, setActiveImage] = useState(images[0])

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="overflow-hidden rounded-2xl bg-zinc-100">
        <img
          src={activeImage}
          className="w-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveImage(img)}
            className="h-20 w-20 overflow-hidden rounded-lg border"
          >
            <img src={img} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductImageGallery