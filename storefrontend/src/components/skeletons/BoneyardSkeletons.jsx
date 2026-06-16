import ProductGrid from "@/components/ProductGrid"
import FeaturedCarousel from "@/components/FeaturedCarousel"
import { productGridFixture } from "@/components/skeletons/fixtures"

export const ProductGridFixture = () => (
  <ProductGrid products={productGridFixture} />
)

export const FeaturedCarouselFixture = () => (
  <FeaturedCarousel products={productGridFixture.slice(0, 3)} />
)

export const ProductCardSkeleton = () => (
  <div className="h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-950/5">
    <div className="aspect-[4/5] bg-zinc-200" />
    <div className="space-y-4 p-5">
      <div className="h-4 w-4/5 rounded bg-zinc-200" />
      <div className="h-4 w-3/5 rounded bg-zinc-200" />
      <div className="flex items-center gap-2">
        <div className="h-6 w-24 rounded bg-zinc-200" />
        <div className="h-4 w-16 rounded bg-zinc-200" />
      </div>
      <div className="h-10 rounded-xl bg-zinc-200" />
    </div>
  </div>
)

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="@container animate-pulse">
    <div className="grid grid-cols-1 gap-6 @md:grid-cols-2 @xl:grid-cols-3 @6xl:grid-cols-4 @md:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`product-card-skeleton-${index}`} />
      ))}
    </div>
  </div>
)

export const FeaturedCarouselSkeleton = () => (
  <section className="relative h-[340px] w-full overflow-hidden bg-zinc-950 md:h-[430px] lg:h-[500px] xl:h-[540px]">
    <div className="flex h-full animate-pulse flex-col md:flex-row">
      <div className="h-[210px] bg-zinc-800 md:h-full md:w-[62%]" />
      <div className="flex flex-1 items-center bg-zinc-900 px-6 py-7 md:w-[38%] md:px-10 lg:px-14">
        <div className="w-full max-w-xl space-y-5">
          <div className="h-5 w-28 rounded-full bg-zinc-700" />
          <div className="h-10 w-4/5 rounded bg-zinc-700" />
          <div className="h-10 w-2/3 rounded bg-zinc-700" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-zinc-800" />
            <div className="h-4 w-4/5 rounded bg-zinc-800" />
          </div>
          <div className="h-9 w-32 rounded bg-zinc-700" />
          <div className="h-11 w-36 rounded-full bg-zinc-700" />
        </div>
      </div>
    </div>
  </section>
)

export const CategorySkeletonGrid = ({ count = 4 }) => (
  <div className="flex animate-pulse gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={`category-skeleton-${index}`} className="min-w-[180px] sm:min-w-0">
        <div className="aspect-[4/3] rounded-2xl bg-zinc-200" />
        <div className="mx-auto mt-3 h-5 w-24 rounded bg-zinc-200" />
      </div>
    ))}
  </div>
)

export const SearchResultsSkeleton = ({ count = 5 }) => (
  <div className="animate-pulse p-2">
    {Array.from({ length: count }).map((_, index) => (
      <div key={`search-skeleton-${index}`} className="flex items-center gap-3 px-2 py-2">
        <div className="h-9 w-9 rounded bg-zinc-200" />
        <div className="h-4 flex-1 rounded bg-zinc-200" />
      </div>
    ))}
  </div>
)

export const CartItemsSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`cart-item-skeleton-${index}`}
        className="flex animate-pulse gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
      >
        <div className="h-20 w-20 shrink-0 rounded-lg bg-zinc-200" />
        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-4/5 rounded bg-zinc-200" />
            <div className="h-4 w-1/2 rounded bg-zinc-200" />
            <div className="h-5 w-24 rounded bg-zinc-200" />
          </div>
          <div className="ml-auto h-8 w-24 rounded-full bg-zinc-200" />
        </div>
      </div>
    ))}
  </div>
)

export const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-zinc-100">
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 h-4 w-72 rounded bg-zinc-200" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_420px] xl:grid-cols-[minmax(0,1.15fr)_440px] xl:gap-12">
        <div className="space-y-3">
          <div className="aspect-[5/4] rounded-sm bg-zinc-200" />
          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-[4/5] rounded-sm bg-zinc-200" />
            <div className="aspect-[4/5] rounded-sm bg-zinc-200" />
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="h-10 w-4/5 rounded bg-zinc-200" />
            <div className="h-4 w-32 rounded bg-zinc-200" />
            <div className="h-8 w-40 rounded bg-zinc-200" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-zinc-200" />
              <div className="h-4 w-3/4 rounded bg-zinc-200" />
            </div>
            <div className="flex gap-3">
              <div className="h-11 flex-1 rounded-full bg-zinc-200" />
              <div className="h-11 flex-1 rounded-full bg-zinc-200" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-full rounded bg-zinc-200" />
            <div className="h-4 w-5/6 rounded bg-zinc-200" />
            <div className="h-px bg-zinc-200" />
            <div className="h-12 rounded bg-zinc-200" />
            <div className="h-12 rounded bg-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const AddressListSkeleton = ({ count = 2 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`address-skeleton-${index}`}
        className="flex animate-pulse gap-3 rounded-xl border border-zinc-200 p-4"
      >
        <div className="mt-1 h-5 w-5 rounded-full bg-zinc-200" />
        <div className="mt-1 h-5 w-5 rounded bg-zinc-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-44 rounded bg-zinc-200" />
          <div className="h-4 w-full rounded bg-zinc-200" />
          <div className="h-3 w-28 rounded bg-zinc-200" />
        </div>
      </div>
    ))}
  </div>
)
