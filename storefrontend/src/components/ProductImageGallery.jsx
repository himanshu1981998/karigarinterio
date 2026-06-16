import { useMemo, useState } from "react"

const ImageTile = ({ src, alt, className = "", onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(src)}
    className={`group relative overflow-hidden bg-[#f3f1ec] ${className}`}
  >
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  </button>
)

const ProductImageGallery = ({ images = [] }) => {
  const validImages = useMemo(() => {
    if (!Array.isArray(images)) return []

    const normalized = images
      .map((img) => {
        if (!img) return null

        if (typeof img === "string") {
          return {
            src: img,
            isPrimary: false,
          }
        }

        return {
          src: img.image || img.src || "",
          isPrimary: Boolean(img.is_primary || img.isPrimary),
        }
      })
      .filter((img) => img?.src)

    const primaryImage = normalized.find((img) => img.isPrimary)
    const remainingImages = normalized.filter((img) => !img.isPrimary)

    return primaryImage ? [primaryImage, ...remainingImages] : normalized
  }, [images])

  const [modalImage, setModalImage] = useState(null)

  if (validImages.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
        No images available
      </div>
    )
  }

  const mainImage = validImages[0]?.src
  const secondRow = validImages.slice(1, 3)
  const thirdRow = validImages.slice(3, 5)

  return (
    <>
      {/* MOBILE: horizontal swipe */}
      <div className="lg:hidden">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide">
          {validImages.map((img, index) => (
            <button
              key={`mobile-image-${index}`}
              type="button"
              onClick={() => setModalImage(img.src)}
              className="group w-[88%] shrink-0 snap-center overflow-hidden rounded-sm bg-[#f3f1ec]"
            >
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img
                  src={img.src}
                  alt={`Product image ${index + 1}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP / LAPTOP */}
      <div className="hidden space-y-3 lg:block">
        {/* Primary image - slightly less dominant */}
        <div className="overflow-hidden rounded-sm bg-[#f3f1ec]">
          <ImageTile
            src={mainImage}
            alt="Product image 1"
            className="aspect-[5/4] w-full"
            onOpen={setModalImage}
          />
        </div>

        {/* Row 2 */}
        {secondRow.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {secondRow.map((img, index) => (
              <div
                key={`second-row-${index}`}
                className="overflow-hidden rounded-sm bg-[#f3f1ec]"
              >
                <ImageTile
                  src={img.src}
                  alt={`Product image ${index + 2}`}
                  className="aspect-[4/5] w-full"
                  onOpen={setModalImage}
                />
              </div>
            ))}
          </div>
        )}

        {/* Row 3 */}
        {thirdRow.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {thirdRow.map((img, index) => (
              <div
                key={`third-row-${index}`}
                className="overflow-hidden rounded-sm bg-[#f3f1ec]"
              >
                <ImageTile
                  src={img.src}
                  alt={`Product image ${index + 4}`}
                  className="aspect-[4/5] w-full"
                  onOpen={setModalImage}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-zinc-800 shadow"
            >
              Close
            </button>

            <img
              src={modalImage}
              alt="Expanded product"
              className="max-h-[90vh] w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ProductImageGallery
