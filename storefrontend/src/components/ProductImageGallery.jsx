import { useRef, useState } from "react"

const ProductImageGallery = ({ images }) => {
  const [activeImage, setActiveImage] = useState(images[0] || "")
  const [showZoom, setShowZoom] = useState(false)
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 })
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 })

  const imageRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const width = rect.width
    const height = rect.height

    const clampedX = Math.max(0, Math.min(x, width))
    const clampedY = Math.max(0, Math.min(y, height))

    setLensPosition({ x: clampedX, y: clampedY })
    setBgPosition({
      x: (clampedX / width) * 100,
      y: (clampedY / height) * 100,
    })
  }

  if (!images.length) {
    return (
      <div className="rounded-2xl bg-zinc-100 p-10 text-center text-sm text-zinc-500">
        No images available
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* thumbnails */}
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:max-h-[420px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hover flex-shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveImage(img)}
            className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border transition-all duration-200 sm:h-20 sm:w-20 ${
              activeImage === img
                ? "border-black ring-2 ring-black/20"
                : "border-zinc-200 hover:border-black"
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </button>
        ))}
      </div>

      {/* main image + desktop zoom */}
      <div className="order-1 flex gap-6 lg:order-2">
        {/* main image */}
        <div
          ref={imageRef}
          className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 lg:w-[450px]"
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={activeImage}
            alt="Product"
            className="h-full w-full object-contain"
          />

          {/* lens */}
          {showZoom && (
            <div
              className="pointer-events-none absolute hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 border border-zinc-400/60 bg-white/20 lg:block"
              style={{
                left: `${lensPosition.x}px`,
                top: `${lensPosition.y}px`,
              }}
            />
          )}
        </div>

        {/* zoom preview */}
        {showZoom && (
          <div className="hidden h-[450px] w-[450px] flex-shrink-0 z-1 overflow-hidden rounded-2xl border bg-zinc-100 shadow-lg lg:block">
            <div
              className="h-full w-full bg-no-repeat"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundPosition: `${bgPosition.x}% ${bgPosition.y}%`,
                backgroundSize: "220%",
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductImageGallery