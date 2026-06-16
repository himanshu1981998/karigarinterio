import { useEffect, useState } from "react"
import { fetchCategories } from "@/lib/productApi"
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
        <h2 className="text-2xl font-bold text-zinc-900">
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
            <div className="overflow-hidden rounded-2xl bg-zinc-100 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-sm font-medium text-zinc-500">
                    {cat.name}
                  </div>
                )}
              </div>
            </div>

            {/* Name below card */}
            <div className="mt-3 text-center">
              <h3 className="text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
                {cat.name}
              </h3>
            </div>
          </Link>
    ))}
  </div>
)

export default HomeCategories 
