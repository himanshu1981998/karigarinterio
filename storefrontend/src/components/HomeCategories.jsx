import { useEffect, useState } from "react"
import { fetchCategories } from "@/lib/productApi.js"
import { Link } from "react-router-dom"
import { Skeleton } from "boneyard-js/react"
import { CategorySkeletonGrid } from "@/components/skeletons/BoneyardSkeletons"
import { categoryFixture } from "@/components/skeletons/fixtures"

const HomeCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories()

        // only top-level categories
        const topLevelCategories = data.filter((cat) => cat.parent === null)
        setCategories(topLevelCategories)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return (
    <div className="mb-12">
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold text-stone-950">
          Shop by Category
        </h2>
      </div>

      <Skeleton
        name="home-categories"
        loading={loading}
        fallback={<CategorySkeletonGrid />}
        fixture={<CategoryGrid categories={categoryFixture} />}
      >
        <CategoryGrid categories={loading ? categoryFixture : categories} />
      </Skeleton>
    </div>
  )
}

const CategoryGrid = ({ categories }) => (
  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-4">
    {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className="group min-w-[180px] sm:min-w-0"
          >
            <div className="ki-soft-card overflow-hidden rounded-xl p-0 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_42px_rgba(41,34,25,0.12)]">
              <div className="ki-image-surface aspect-[4/3] overflow-hidden rounded-xl">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-stone-500">
                    {cat.name}
                  </div>
                )}
              </div>
            </div>

            {/* Name below card */}
            <div className="mt-3 text-center">
              <h3 className="text-base font-semibold tracking-tight text-stone-950 sm:text-lg">
                {cat.name}
              </h3>
            </div>
          </Link>
    ))}
  </div>
)

export default HomeCategories 
