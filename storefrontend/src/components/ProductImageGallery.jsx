import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

const ProductImageGallery = ({ images }) => {
  const [activeImage, setActiveImage] = useState(images[0] || "")
  const [showZoom, setShowZoom] = useState(false)
  const [openModal, setOpenModal] = useState(false)
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

  if (!images?.length) {
    return (
      <div className="rounded-2xl bg-zinc-100 p-10 text-center text-sm text-zinc-500">
        No images available
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* thumbnails */}
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:max-h-[420px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden scrollbar-hover flex-shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onMouseEnter={() => setActiveImage(img)}
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
            className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-zinc-100 lg:w-[450px]"
            onClick={() => setOpenModal(true)}
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={activeImage}
              alt="Product"
              className="h-full w-full object-contain"
            />

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

          {/* desktop zoom preview */}
          {showZoom && (
            <div className="hidden h-[450px] w-[450px] z-10 flex-shrink-0 overflow-hidden rounded-2xl border bg-zinc-100 shadow-lg lg:block">
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

      {/* image modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="!w-[1200px] !max-w-[95vw] !h-[90vh]  overflow-hidden p-0">
          <div className="grid gap-4 p-4 md:grid-cols-[100px_1fr] md:p-6">
            {/* modal thumbnails */}
            <div className="flex gap-3 overflow-x-auto md:max-h-[75vh] md:flex-col md:overflow-y-auto md:overflow-x-hidden scrollbar-hover">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border transition-all duration-200 md:h-20 md:w-20 ${
                    activeImage === img
                      ? "border-black ring-2 ring-black/20"
                      : "border-zinc-200 hover:border-black"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Modal thumbnail ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* modal main image */}
            <div className="flex items-center justify-center rounded-xl bg-zinc-100 p-4">
              <img
                src={activeImage}
                alt="Large product"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProductImageGallery