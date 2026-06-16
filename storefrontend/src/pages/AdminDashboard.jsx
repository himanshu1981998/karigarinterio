import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Users,
  Warehouse,
  X,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  createAdminProduct,
  createAdminCategory,
  deleteAdminCategory,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminDashboard,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminServices,
  fetchAdminUsers,
  fetchAdminWebhookEvents,
  fetchAdminNotifications,
  getAdminExportUrl,
  refundAdminOrder,
  resolveAdminOrderCancellation,
  resolveAdminOrderReturn,
  deleteAdminProductImage,
  updateAdminProductImage,
  updateAdminOrderStatus,
  updateAdminOrderFulfillment,
  updateAdminCategory,
  updateAdminProduct,
  updateAdminProductFeatured,
  updateAdminProductStock,
  updateAdminServiceStatus,
  uploadAdminProductImages,
} from "@/services/adminApi"
import { useAuthStore } from "@/store/authStore"

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Boxes },
  { id: "categories", label: "Categories", icon: PackageCheck },
  { id: "orders", label: "Orders", icon: Truck },
  { id: "services", label: "Services", icon: Wrench },
  { id: "users", label: "Users", icon: Users },
]

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
const paymentStatuses = ["pending", "paid", "failed", "refunded"]
const serviceStatuses = ["new", "contacted", "in-progress", "closed"]

const emptyProductForm = {
  id: null,
  name: "",
  sku: "",
  category_id: "",
  short_description: "",
  description: "",
  price: "",
  original_price: "",
  stock: 0,
  is_active: true,
  is_featured: false,
  material_summary: "",
  finish: "",
  width_cm: "",
  depth_cm: "",
  height_cm: "",
  estimated_shipping_text: "",
  images: [],
  image_files: [],
  image_alt_text: "",
  specifications: [{ name: "", value: "", sort_order: 0 }],
}

const emptyCategoryForm = {
  id: null,
  name: "",
  is_active: true,
  image: "",
  image_file: null,
  clear_image: false,
}

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`

const normalizeList = (data) => (Array.isArray(data) ? data : data?.results || [])

const AdminDashboard = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin)

  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [services, setServices] = useState([])
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [webhookEvents, setWebhookEvents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [productSearch, setProductSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  const [orderSearch, setOrderSearch] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)

  const loadAdminData = async () => {
    try {
      setLoading(true)

      const [
        dashboardData,
        categoryData,
        productData,
        orderData,
        serviceData,
        userData,
        webhookData,
        notificationData,
      ] =
        await Promise.all([
          fetchAdminDashboard(),
          fetchAdminCategories(),
          fetchAdminProducts(),
          fetchAdminOrders(),
          fetchAdminServices(),
          fetchAdminUsers(),
          fetchAdminWebhookEvents(),
          fetchAdminNotifications(),
        ])

      setDashboard(dashboardData)
      setCategories(normalizeList(categoryData))
      setProducts(normalizeList(productData))
      setOrders(normalizeList(orderData))
      setServices(normalizeList(serviceData))
      setUsers(normalizeList(userData))
      setWebhookEvents(normalizeList(webhookData))
      setNotifications(normalizeList(notificationData))
    } catch (error) {
      const message =
        error?.response?.status === 403
          ? "You do not have admin access."
          : error?.response?.data?.detail || "Failed to load admin dashboard"

      toast.error(message, { position: "bottom-center" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin])

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) =>
      [product.name, product.sku, product.category?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [products, productSearch])

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase()
    if (!query) return categories

    return categories.filter((category) =>
      [category.name, category.slug]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [categories, categorySearch])

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase()
    if (!query) return orders

    return orders.filter((order) =>
      [
        order.order_number,
        order.shipping_full_name,
        order.shipping_phone,
        order.shipping_city,
        order.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [orders, orderSearch])

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()
    if (!query) return users

    return users.filter((customer) =>
      [customer.phone, customer.full_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [users, userSearch])

  const filteredServices = useMemo(() => {
    const query = serviceSearch.trim().toLowerCase()
    if (!query) return services

    return services.filter((service) =>
      [
        service.full_name,
        service.phone,
        service.city,
        service.other_service,
        service.requirements,
        ...(service.selected_services || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [services, serviceSearch])

  const handleProductFormChange = (event) => {
    const { name, value, type, checked, files } = event.target

    if (type === "file") {
      setProductForm((prev) => ({
        ...prev,
        [name]: Array.from(files || []),
      }))
      return
    }

    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCategoryFormChange = (event) => {
    const { name, value, type, checked, files } = event.target

    if (type === "file") {
      setCategoryForm((prev) => ({
        ...prev,
        image_file: files?.[0] || null,
        clear_image: false,
      }))
      return
    }

    setCategoryForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm)
  }

  const handleEditCategory = (category) => {
    setCategoryForm({
      id: category.id,
      name: category.name || "",
      is_active: Boolean(category.is_active),
      image: category.image || "",
      image_file: null,
      clear_image: false,
    })
  }

  const handleClearCategoryImage = () => {
    setCategoryForm((prev) => ({
      ...prev,
      image: "",
      image_file: null,
      clear_image: Boolean(prev.id && prev.image),
    }))
  }

  const handleSaveCategory = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      const payload = {
        name: categoryForm.name,
        is_active: categoryForm.is_active,
        image_file: categoryForm.image_file,
        clear_image: categoryForm.clear_image,
      }

      if (categoryForm.id) {
        const updated = await updateAdminCategory(categoryForm.id, payload)
        setCategories((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        toast.success("Category updated", { position: "bottom-center" })
      } else {
        const created = await createAdminCategory(payload)
        setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
        toast.success("Category added", { position: "bottom-center" })
      }

      resetCategoryForm()
    } catch (error) {
      const data = error?.response?.data || {}
      toast.error(data?.detail || data?.name?.[0] || "Failed to save category", { position: "bottom-center" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (category) => {
    try {
      await deleteAdminCategory(category.id)
      setCategories((prev) => prev.filter((item) => item.id !== category.id))
      toast.success("Category removed", { position: "bottom-center" })
    } catch {
      toast.error("Failed to remove category", { position: "bottom-center" })
    }
  }

  const resetProductForm = () => {
    setProductForm(emptyProductForm)
  }

  const handleSpecificationChange = (index, field, value) => {
    setProductForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, specIndex) =>
        specIndex === index ? { ...spec, [field]: value } : spec
      ),
    }))
  }

  const handleAddSpecification = () => {
    setProductForm((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { name: "", value: "", sort_order: prev.specifications.length },
      ],
    }))
  }

  const handleRemoveSpecification = (index) => {
    setProductForm((prev) => ({
      ...prev,
      specifications:
        prev.specifications.length === 1
          ? [{ name: "", value: "", sort_order: 0 }]
          : prev.specifications.filter((_, specIndex) => specIndex !== index),
    }))
  }

  const syncProductEverywhere = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
    )

    setProductForm((prev) =>
      prev.id === updatedProduct.id
        ? {
            ...prev,
            images: updatedProduct.images || [],
            specifications:
              updatedProduct.specifications?.length > 0
                ? updatedProduct.specifications
                : prev.specifications,
          }
        : prev
    )
  }

  const handleEditProduct = (product) => {
    setActiveTab("products")
    setProductForm({
      id: product.id,
      name: product.name || "",
      sku: product.sku || "",
      category_id: product.category?.id || "",
      short_description: product.short_description || "",
      description: product.description || "",
      price: product.price || "",
      original_price: product.original_price || "",
      stock: product.stock || 0,
      is_active: Boolean(product.is_active),
      is_featured: Boolean(product.is_featured),
      material_summary: product.material_summary || "",
      finish: product.finish || "",
      width_cm: product.width_cm || "",
      depth_cm: product.depth_cm || "",
      height_cm: product.height_cm || "",
      estimated_shipping_text: product.estimated_shipping_text || "",
      images: product.images || [],
      image_files: [],
      image_alt_text: product.name || "",
      specifications:
        product.specifications?.length > 0
          ? product.specifications.map((spec, index) => ({
              name: spec.name || "",
              value: spec.value || "",
              sort_order: spec.sort_order ?? index,
            }))
          : [{ name: "", value: "", sort_order: 0 }],
    })
  }

  const buildProductPayload = () => {
    const payload = { ...productForm }
    delete payload.images
    delete payload.image_files
    delete payload.image_alt_text

    return {
      ...payload,
      specifications: productForm.specifications
        .filter((spec) => spec.name.trim() && spec.value.trim())
        .map((spec, index) => ({
          name: spec.name.trim(),
          value: spec.value.trim(),
          sort_order: Number(spec.sort_order ?? index),
        })),
      category_id: productForm.category_id || null,
      original_price: productForm.original_price || null,
      width_cm: productForm.width_cm || null,
      depth_cm: productForm.depth_cm || null,
      height_cm: productForm.height_cm || null,
      stock: Number(productForm.stock || 0),
    }
  }

  const handleSaveProduct = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)

      if (productForm.id) {
        let updated = await updateAdminProduct(productForm.id, buildProductPayload())

        if (productForm.image_files.length > 0) {
          const upload = await uploadAdminProductImages(updated.id, productForm.image_files, {
            alt_text: productForm.image_alt_text || updated.name,
            is_primary: !updated.images?.some((image) => image.is_primary),
          })
          updated = upload.product
        }

        syncProductEverywhere(updated)
        toast.success("Product updated", { position: "bottom-center" })
      } else {
        let created = await createAdminProduct(buildProductPayload())

        if (productForm.image_files.length > 0) {
          const upload = await uploadAdminProductImages(created.id, productForm.image_files, {
            alt_text: productForm.image_alt_text || created.name,
            is_primary: true,
          })
          created = upload.product
        }

        setProducts((prev) => [created, ...prev])
        toast.success("Product added", { position: "bottom-center" })
      }

      resetProductForm()
      const dashboardData = await fetchAdminDashboard()
      setDashboard(dashboardData)
    } catch (error) {
      const data = error?.response?.data || {}
      const firstKey = Object.keys(data)[0]
      const message =
        data?.detail ||
        (firstKey && Array.isArray(data[firstKey]) ? data[firstKey][0] : null) ||
        "Failed to save product"

      toast.error(message, { position: "bottom-center" })
    } finally {
      setSaving(false)
    }
  }

  const handleSetPrimaryImage = async (product, image) => {
    try {
      const data = await updateAdminProductImage(product.id, image.id, {
        is_primary: true,
      })
      syncProductEverywhere(data.product)
      toast.success("Primary image updated", { position: "bottom-center" })
    } catch {
      toast.error("Failed to update image", { position: "bottom-center" })
    }
  }

  const handleDeleteImage = async (product, image) => {
    try {
      const data = await deleteAdminProductImage(product.id, image.id)
      syncProductEverywhere(data.product)
      toast.success("Image removed", { position: "bottom-center" })
    } catch {
      toast.error("Failed to remove image", { position: "bottom-center" })
    }
  }

  const handleStockChange = async (product, stock) => {
    try {
      const updated = await updateAdminProductStock(product.id, stock)
      setProducts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      )
    } catch {
      toast.error("Failed to update stock", { position: "bottom-center" })
    }
  }

  const handleFeaturedChange = async (product, isFeatured) => {
    try {
      const updated = await updateAdminProductFeatured(product.id, isFeatured)
      setProducts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      )
    } catch {
      toast.error("Failed to update featured product", { position: "bottom-center" })
    }
  }

  const handleDeleteProduct = async (product) => {
    try {
      await deleteAdminProduct(product.id)
      setProducts((prev) => prev.filter((item) => item.id !== product.id))
      toast.success("Product removed", { position: "bottom-center" })
    } catch {
      toast.error("Failed to delete product", { position: "bottom-center" })
    }
  }

  const handleOrderUpdate = async (order, payload) => {
    try {
      const updated = await updateAdminOrderStatus(order.id, payload)
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      const dashboardData = await fetchAdminDashboard()
      setDashboard(dashboardData)
      toast.success("Order updated", { position: "bottom-center" })
    } catch {
      toast.error("Failed to update order", { position: "bottom-center" })
    }
  }

  const updateOrderInState = async (updated) => {
    setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    const dashboardData = await fetchAdminDashboard()
    setDashboard(dashboardData)
  }

  const handleOrderFulfillment = async (order, payload) => {
    try {
      const updated = await updateAdminOrderFulfillment(order.id, payload)
      await updateOrderInState(updated)
      toast.success("Fulfillment updated", { position: "bottom-center" })
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to update fulfillment", { position: "bottom-center" })
    }
  }

  const handleCancellationResolution = async (order, action) => {
    try {
      const updated = await resolveAdminOrderCancellation(order.id, { action })
      await updateOrderInState(updated)
      toast.success("Cancellation updated", { position: "bottom-center" })
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to update cancellation", { position: "bottom-center" })
    }
  }

  const handleReturnResolution = async (order, action) => {
    try {
      const updated = await resolveAdminOrderReturn(order.id, { action })
      await updateOrderInState(updated)
      toast.success("Return updated", { position: "bottom-center" })
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to update return", { position: "bottom-center" })
    }
  }

  const handleRefundOrder = async (order) => {
    try {
      const updated = await refundAdminOrder(order.id, { reason: "admin_refund" })
      await updateOrderInState(updated)
      toast.success("Refund initiated", { position: "bottom-center" })
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to refund order", { position: "bottom-center" })
    }
  }

  const handleServiceStatusUpdate = async (service, status) => {
    try {
      const updated = await updateAdminServiceStatus(service.id, { status })
      setServices((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      )
      toast.success("Service enquiry updated", { position: "bottom-center" })
    } catch {
      toast.error("Failed to update service enquiry", { position: "bottom-center" })
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-100 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-zinc-400" />
          <h1 className="mt-4 text-xl font-semibold text-zinc-900">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Sign in with a staff account to manage Karigar Interio.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
              Karigar Interio Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              Operations Dashboard
            </h1>
          </div>

          <Button
            onClick={loadAdminData}
            disabled={loading}
            variant="outline"
            className="w-fit rounded-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <AdminLoading />
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewPanel
                dashboard={dashboard}
                onEditProduct={handleEditProduct}
                onViewOrders={() => setActiveTab("orders")}
              />
            )}

            {activeTab === "products" && (
              <ProductsPanel
                categories={categories}
                productForm={productForm}
                products={filteredProducts}
                productSearch={productSearch}
                saving={saving}
                onDeleteProduct={handleDeleteProduct}
                onEditProduct={handleEditProduct}
                onFeaturedChange={handleFeaturedChange}
                onFormChange={handleProductFormChange}
                onSpecificationChange={handleSpecificationChange}
                onAddSpecification={handleAddSpecification}
                onRemoveSpecification={handleRemoveSpecification}
                onSetPrimaryImage={handleSetPrimaryImage}
                onDeleteImage={handleDeleteImage}
                onResetForm={resetProductForm}
                onSaveProduct={handleSaveProduct}
                onSearchChange={setProductSearch}
                onStockChange={handleStockChange}
              />
            )}

            {activeTab === "categories" && (
              <CategoriesPanel
                categories={filteredCategories}
                categoryForm={categoryForm}
                categorySearch={categorySearch}
                saving={saving}
                onDeleteCategory={handleDeleteCategory}
                onEditCategory={handleEditCategory}
                onClearImage={handleClearCategoryImage}
                onFormChange={handleCategoryFormChange}
                onResetForm={resetCategoryForm}
                onSaveCategory={handleSaveCategory}
                onSearchChange={setCategorySearch}
              />
            )}

            {activeTab === "orders" && (
              <OrdersPanel
                orders={filteredOrders}
                orderSearch={orderSearch}
                notifications={notifications}
                webhookEvents={webhookEvents}
                onCancellationResolution={handleCancellationResolution}
                onFulfillmentUpdate={handleOrderFulfillment}
                onOrderUpdate={handleOrderUpdate}
                onRefundOrder={handleRefundOrder}
                onReturnResolution={handleReturnResolution}
                onSearchChange={setOrderSearch}
              />
            )}

            {activeTab === "services" && (
              <ServicesPanel
                serviceSearch={serviceSearch}
                services={filteredServices}
                onSearchChange={setServiceSearch}
                onStatusUpdate={handleServiceStatusUpdate}
              />
            )}

            {activeTab === "users" && (
              <UsersPanel
                users={filteredUsers}
                userSearch={userSearch}
                onSearchChange={setUserSearch}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

const AdminLoading = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="h-32 animate-pulse rounded-lg bg-white shadow-sm" />
    ))}
  </div>
)

const OverviewPanel = ({ dashboard, onEditProduct, onViewOrders }) => {
  const totals = dashboard?.totals || {}
  const maxRevenue = Math.max(
    ...((dashboard?.sales_trend || []).map((item) => Number(item.revenue)) || [1]),
    1
  )

  const metrics = [
    { label: "Total Revenue", value: formatCurrency(totals.revenue), icon: IndianRupee },
    { label: "Orders", value: totals.orders || 0, icon: ShoppingBag },
    { label: "Active Products", value: totals.active_products || 0, icon: PackageCheck },
    { label: "Low Stock", value: totals.low_stock_products || 0, icon: Warehouse },
    { label: "Customers", value: totals.users || 0, icon: Users },
    { label: "Pending Orders", value: totals.pending_orders || 0, icon: Truck },
    { label: "New Service Leads", value: dashboard?.service_status_counts?.new || 0, icon: Wrench },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">{metric.label}</p>
                <Icon className="h-5 w-5 text-[#8B5E3C]" />
              </div>
              <p className="mt-3 text-2xl font-bold text-zinc-900">{metric.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">7 Day Sales</h2>
            <BarChart3 className="h-5 w-5 text-zinc-500" />
          </div>

          <div className="flex h-64 items-end gap-3">
            {(dashboard?.sales_trend || []).map((item) => {
              const height = Math.max((Number(item.revenue) / maxRevenue) * 100, item.orders ? 12 : 4)
              return (
                <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end rounded bg-zinc-100 px-2">
                    <div
                      className="w-full rounded-t bg-[#8B5E3C]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-zinc-500">
                    {new Date(item.date).toLocaleDateString("en-IN", { weekday: "short" })}
                  </p>
                  <p className="text-[11px] text-zinc-400">{item.orders} orders</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Order Status</h2>
            <Button variant="ghost" size="sm" onClick={onViewOrders}>
              View
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {orderStatuses.map((status) => (
              <div key={status} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
                <span className="text-sm font-medium capitalize text-zinc-700">{status}</span>
                <span className="text-sm font-semibold text-zinc-900">
                  {dashboard?.order_status_counts?.[status] || 0}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Low Stock Watchlist</h2>
          <Warehouse className="h-5 w-5 text-zinc-500" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(dashboard?.low_stock_products || []).map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onEditProduct(product)}
              className="rounded-lg border border-zinc-200 p-4 text-left transition hover:border-zinc-400"
            >
              <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{product.name}</p>
              <p className="mt-2 text-xs text-zinc-500">{product.sku}</p>
              <p className="mt-3 text-sm font-bold text-red-600">{product.stock} in stock</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

const ProductsPanel = ({
  categories,
  productForm,
  products,
  productSearch,
  saving,
  onDeleteProduct,
  onEditProduct,
  onFeaturedChange,
  onFormChange,
  onSpecificationChange,
  onAddSpecification,
  onRemoveSpecification,
  onSetPrimaryImage,
  onDeleteImage,
  onResetForm,
  onSaveProduct,
  onSearchChange,
  onStockChange,
}) => (
  <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
    <section className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Plus className="h-5 w-5 text-[#8B5E3C]" />
        <h2 className="text-lg font-semibold text-zinc-900">
          {productForm.id ? "Edit Product" : "Enlist Product"}
        </h2>
      </div>

      <form onSubmit={onSaveProduct} className="space-y-4">
        <Input name="name" placeholder="Product name" required value={productForm.name} onChange={onFormChange} />
        <Input name="sku" placeholder="SKU" required value={productForm.sku} onChange={onFormChange} />

        <select
          name="category_id"
          value={productForm.category_id}
          onChange={onFormChange}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <Input name="price" type="number" step="0.01" placeholder="Price" required value={productForm.price} onChange={onFormChange} />
          <Input name="original_price" type="number" step="0.01" placeholder="MRP" value={productForm.original_price || ""} onChange={onFormChange} />
        </div>

        <Input name="stock" type="number" placeholder="Stock" min="0" value={productForm.stock} onChange={onFormChange} />
        <Input name="short_description" placeholder="Short description" value={productForm.short_description || ""} onChange={onFormChange} />
        <textarea
          name="description"
          placeholder="Product description"
          required
          value={productForm.description}
          onChange={onFormChange}
          className="min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input name="material_summary" placeholder="Material" value={productForm.material_summary || ""} onChange={onFormChange} />
          <Input name="finish" placeholder="Finish" value={productForm.finish || ""} onChange={onFormChange} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input name="width_cm" type="number" step="0.01" placeholder="W cm" value={productForm.width_cm || ""} onChange={onFormChange} />
          <Input name="depth_cm" type="number" step="0.01" placeholder="D cm" value={productForm.depth_cm || ""} onChange={onFormChange} />
          <Input name="height_cm" type="number" step="0.01" placeholder="H cm" value={productForm.height_cm || ""} onChange={onFormChange} />
        </div>

        <Input name="estimated_shipping_text" placeholder="Shipping estimate" value={productForm.estimated_shipping_text || ""} onChange={onFormChange} />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700">
            Product images
          </label>
          <Input name="image_files" type="file" accept="image/*" multiple onChange={onFormChange} />
          <Input
            name="image_alt_text"
            placeholder="Image alt text"
            value={productForm.image_alt_text || ""}
            onChange={onFormChange}
          />
          {productForm.image_files.length > 0 && (
            <p className="text-xs text-zinc-500">
              {productForm.image_files.length} new image(s) selected
            </p>
          )}
          {productForm.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {productForm.images.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                  <img
                    src={image.image}
                    alt={image.alt_text || productForm.name}
                    className="aspect-square w-full object-cover"
                  />
                  {image.is_primary && (
                    <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Primary
                    </span>
                  )}
                  <div className="absolute inset-x-1 bottom-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                    {!image.is_primary && productForm.id && (
                      <button
                        type="button"
                        onClick={() => onSetPrimaryImage({ id: productForm.id }, image)}
                        className="flex-1 rounded bg-white/90 px-1.5 py-1 text-[10px] font-semibold text-zinc-900"
                      >
                        Set
                      </button>
                    )}
                    {productForm.id && (
                      <button
                        type="button"
                        onClick={() => onDeleteImage({ id: productForm.id }, image)}
                        className="rounded bg-red-600 px-1.5 py-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-md border border-zinc-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Product specifications</p>
              <p className="text-xs text-zinc-500">Shown on the product detail page.</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={onAddSpecification}>
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {productForm.specifications.map((spec, index) => (
              <div key={`specification-row-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                <Input
                  placeholder="Name"
                  value={spec.name}
                  onChange={(event) => onSpecificationChange(index, "name", event.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={spec.value}
                  onChange={(event) => onSpecificationChange(index, "value", event.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-600"
                  onClick={() => onRemoveSpecification(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-zinc-700">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_active" checked={productForm.is_active} onChange={onFormChange} />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_featured" checked={productForm.is_featured} onChange={onFormChange} />
            Featured
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="flex-1 bg-[#8B5E3C] text-white hover:bg-[#7A5234]">
            {saving ? "Saving..." : productForm.id ? "Update Product" : "Add Product"}
          </Button>
          <Button type="button" variant="outline" onClick={onResetForm}>
            Clear
          </Button>
        </div>
      </form>
    </section>

    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Products</h2>
          <p className="text-sm text-zinc-500">{products.length} listed products</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <a
            href={getAdminExportUrl("products")}
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Export Products
          </a>
          <SearchField value={productSearch} onChange={onSearchChange} placeholder="Search products or SKU" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Featured</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                      {product.primary_image ? (
                        <img
                          src={product.primary_image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.sku} · {product.category?.name || "Uncategorized"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-zinc-900">{formatCurrency(product.price)}</p>
                  {product.original_price && Number(product.original_price) > Number(product.price) && (
                    <p className="text-xs text-zinc-400 line-through">
                      MRP {formatCurrency(product.original_price)}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Input
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={(event) => onStockChange(product, event.target.value)}
                    className="h-9 w-24"
                  />
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onFeaturedChange(product, !product.is_featured)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      product.is_featured
                        ? "bg-amber-100 text-amber-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" />
                    {product.is_featured ? "Featured" : "Normal"}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <StatusPill status={product.is_active ? "active" : "inactive"} />
                  <p className="mt-1 text-xs text-zinc-500">
                    {product.images?.length || 0} image(s) · {product.specifications?.length || 0} spec(s)
                  </p>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEditProduct(product)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onDeleteProduct(product)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </div>
)

const CategoryImagePreview = ({ image, file, name }) => {
  const filePreview = useMemo(() => {
    if (!file) return ""
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  const preview = filePreview || image

  if (!preview) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
        No category image
      </div>
    )
  }

  return (
    <img
      src={preview}
      alt={name ? `${name} category` : "Category preview"}
      className="aspect-[4/3] w-full rounded-lg object-cover ring-1 ring-zinc-200"
    />
  )
}

const CategoriesPanel = ({
  categories,
  categoryForm,
  categorySearch,
  saving,
  onDeleteCategory,
  onEditCategory,
  onClearImage,
  onFormChange,
  onResetForm,
  onSaveCategory,
  onSearchChange,
}) => (
  <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
    <section className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">
        {categoryForm.id ? "Edit Category" : "Add Category"}
      </h2>
      <form onSubmit={onSaveCategory} className="mt-5 space-y-4">
        <Input
          name="name"
          placeholder="Category name"
          required
          value={categoryForm.name}
          onChange={onFormChange}
        />
        <div className="space-y-3">
          <CategoryImagePreview
            image={categoryForm.image}
            file={categoryForm.image_file}
            name={categoryForm.name}
          />
          <Input
            name="image"
            type="file"
            accept="image/*"
            onChange={onFormChange}
          />
          {(categoryForm.image || categoryForm.image_file) && (
            <Button type="button" variant="outline" className="w-full" onClick={onClearImage}>
              Remove Image
            </Button>
          )}
          {categoryForm.clear_image && (
            <p className="text-xs text-amber-700">
              Image will be removed when you save this category.
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="is_active"
            checked={categoryForm.is_active}
            onChange={onFormChange}
          />
          Active
        </label>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="flex-1 bg-[#8B5E3C] text-white hover:bg-[#7A5234]">
            {saving ? "Saving..." : categoryForm.id ? "Update" : "Add"}
          </Button>
          <Button type="button" variant="outline" onClick={onResetForm}>
            Clear
          </Button>
        </div>
      </form>
    </section>

    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Categories</h2>
          <p className="text-sm text-zinc-500">{categories.length} categories</p>
        </div>
        <SearchField value={categorySearch} onChange={onSearchChange} placeholder="Search categories" />
      </div>
      <div className="divide-y divide-zinc-100">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {category.image ? (
                <img
                  src={category.image}
                  alt={`${category.name} category`}
                  className="h-16 w-20 rounded-lg object-cover ring-1 ring-zinc-200"
                />
              ) : (
                <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400 ring-1 ring-zinc-200">
                  No image
                </div>
              )}
              <div>
                <p className="font-semibold text-zinc-900">{category.name}</p>
                <p className="text-xs text-zinc-500">{category.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={category.is_active ? "active" : "inactive"} />
              <Button size="sm" variant="outline" onClick={() => onEditCategory(category)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onDeleteCategory(category)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
)

const OrdersPanel = ({
  orders,
  orderSearch,
  notifications,
  webhookEvents,
  onCancellationResolution,
  onFulfillmentUpdate,
  onOrderUpdate,
  onRefundOrder,
  onReturnResolution,
  onSearchChange,
}) => (
  <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Order Tracking</h2>
        <p className="text-sm text-zinc-500">{orders.length} orders</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <a
          href={getAdminExportUrl("orders")}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Export Orders
        </a>
        <SearchField value={orderSearch} onChange={onSearchChange} placeholder="Search orders, phone, customer" />
      </div>
    </div>

    <div className="divide-y divide-zinc-100">
      {orders.map((order) => (
        <div key={order.id} className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-zinc-900">{order.order_number}</h3>
                <StatusPill status={order.status} />
                <StatusPill status={order.payment_status} subtle />
              </div>
              <p className="mt-2 text-sm text-zinc-600">
                {order.shipping_full_name} · {order.shipping_phone}
              </p>
              <p className="text-sm text-zinc-500">
                {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">
                {formatCurrency(order.total)} · {order.payment_method?.toUpperCase()}
              </p>
              {(order.courier_name || order.tracking_number || order.tracking_url) && (
                <div className="mt-2 rounded-md bg-zinc-50 p-2 text-xs text-zinc-600">
                  {order.courier_name && <p>Courier: {order.courier_name}</p>}
                  {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}
                  {order.tracking_url && (
                    <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Open tracking link
                    </a>
                  )}
                </div>
              )}
              {(order.cancellation_status !== "none" || order.return_status !== "none") && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {order.cancellation_status !== "none" && (
                    <span className="rounded-full bg-red-50 px-2 py-1 font-medium text-red-700">
                      Cancellation: {order.cancellation_status}
                    </span>
                  )}
                  {order.return_status !== "none" && (
                    <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700">
                      Return: {order.return_status}
                    </span>
                  )}
                </div>
              )}
              {(order.razorpay_payment_id || order.razorpay_order_id) && (
                <div className="mt-2 space-y-1 text-xs text-zinc-500">
                  {order.razorpay_payment_id && (
                    <p className="break-all">Payment ID: {order.razorpay_payment_id}</p>
                  )}
                  {order.razorpay_order_id && (
                    <p className="break-all">Razorpay Order: {order.razorpay_order_id}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={order.status}
                onChange={(event) => onFulfillmentUpdate(order, { status: event.target.value })}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={order.payment_status}
                onChange={(event) => onOrderUpdate(order, { payment_status: event.target.value })}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form
            className="mt-4 grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              onFulfillmentUpdate(order, {
                courier_name: formData.get("courier_name"),
                tracking_number: formData.get("tracking_number"),
                tracking_url: formData.get("tracking_url"),
              })
            }}
          >
            <Input name="courier_name" placeholder="Courier" defaultValue={order.courier_name || ""} />
            <Input name="tracking_number" placeholder="Tracking number" defaultValue={order.tracking_number || ""} />
            <Input name="tracking_url" placeholder="Tracking URL" defaultValue={order.tracking_url || ""} />
            <Button type="submit" variant="outline">Save Tracking</Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {order.cancellation_status === "requested" && (
              <>
                <Button size="sm" variant="outline" onClick={() => onCancellationResolution(order, "approve")}>
                  Approve Cancellation
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onCancellationResolution(order, "reject")}>
                  Reject Cancellation
                </Button>
              </>
            )}
            {order.return_status === "requested" && (
              <>
                <Button size="sm" variant="outline" onClick={() => onReturnResolution(order, "approve")}>
                  Approve Return
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onReturnResolution(order, "reject")}>
                  Reject Return
                </Button>
              </>
            )}
            {order.return_status === "approved" && (
              <Button size="sm" variant="outline" onClick={() => onReturnResolution(order, "received")}>
                Mark Return Received
              </Button>
            )}
            {order.payment_method === "online" && order.payment_status === "paid" && !order.refunded_at && (
              <Button size="sm" variant="outline" onClick={() => onRefundOrder(order)}>
                Refund Online Payment
              </Button>
            )}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {(order.items || []).map((item) => (
              <div key={item.id} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                <p className="font-medium text-zinc-900">{item.product_name}</p>
                <p className="text-xs text-zinc-500">
                  {item.product_sku} · Qty {item.quantity} · {formatCurrency(item.line_total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="grid gap-4 border-t border-zinc-200 p-5 lg:grid-cols-2">
      <LogPanel title="Recent Razorpay Webhooks" rows={webhookEvents} />
      <LogPanel title="Recent Notifications" rows={notifications} />
    </div>
  </section>
)

const ServicesPanel = ({ services, serviceSearch, onSearchChange, onStatusUpdate }) => (
  <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Service Enquiries</h2>
        <p className="text-sm text-zinc-500">{services.length} service requests</p>
      </div>
      <SearchField value={serviceSearch} onChange={onSearchChange} placeholder="Search name, phone, city, service" />
    </div>

    <div className="divide-y divide-zinc-100">
      {services.length === 0 ? (
        <div className="p-8 text-center text-sm text-zinc-500">
          No service enquiries found.
        </div>
      ) : (
        services.map((service) => (
          <div key={service.id} className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-zinc-900">{service.full_name}</h3>
                  <StatusPill status={service.status} />
                </div>

                <p className="mt-2 text-sm text-zinc-600">
                  {service.phone} · {service.city}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(service.selected_services || []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
                    >
                      {item.replace(/-/g, " ")}
                    </span>
                  ))}
                  {service.other_service && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {service.other_service}
                    </span>
                  )}
                </div>

                {service.requirements && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
                    {service.requirements}
                  </p>
                )}

                <p className="mt-3 text-xs text-zinc-400">
                  Requested {service.created_at ? new Date(service.created_at).toLocaleString("en-IN") : "-"}
                </p>
              </div>

              <select
                value={service.status}
                onChange={(event) => onStatusUpdate(service, event.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm capitalize"
              >
                {serviceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
)

const UsersPanel = ({ users, userSearch, onSearchChange }) => (
  <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Users</h2>
        <p className="text-sm text-zinc-500">{users.length} customer accounts</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <a
          href={getAdminExportUrl("users")}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Export Users
        </a>
        <SearchField value={userSearch} onChange={onSearchChange} placeholder="Search phone or name" />
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Role</th>
            <th className="px-5 py-3">Orders</th>
            <th className="px-5 py-3">Spent</th>
            <th className="px-5 py-3">Joined</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {users.map((customer) => (
            <tr key={customer.id}>
              <td className="px-5 py-4">
                <p className="font-semibold text-zinc-900">{customer.full_name || "Customer"}</p>
                <p className="text-xs text-zinc-500">{customer.phone}</p>
              </td>
              <td className="px-5 py-4">
                {customer.is_staff ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Staff
                  </span>
                ) : (
                  <span className="text-zinc-500">Customer</span>
                )}
              </td>
              <td className="px-5 py-4 font-semibold text-zinc-900">{customer.orders_count || 0}</td>
              <td className="px-5 py-4 font-semibold text-zinc-900">{formatCurrency(customer.total_spent)}</td>
              <td className="px-5 py-4 text-zinc-500">
                {customer.date_joined ? new Date(customer.date_joined).toLocaleDateString("en-IN") : "-"}
              </td>
              <td className="px-5 py-4">
                <StatusPill status={customer.is_active ? "active" : "inactive"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const LogPanel = ({ title, rows }) => (
  <section className="rounded-lg border border-zinc-200 bg-white p-4">
    <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
    <div className="mt-3 space-y-2">
      {(rows || []).slice(0, 6).map((row) => (
        <div key={row.id || row.event_id} className="rounded-md bg-zinc-50 p-2 text-xs text-zinc-600">
          <p className="font-semibold text-zinc-900">
            {row.event_name || row.event_type || row.subject || "Log"}
          </p>
          <p>{row.status || row.razorpay_order_id || row.order_number || "Recorded"}</p>
          <p className="text-zinc-400">
            {row.processed_at || row.created_at
              ? new Date(row.processed_at || row.created_at).toLocaleString("en-IN")
              : ""}
          </p>
        </div>
      ))}
      {(!rows || rows.length === 0) && (
        <p className="text-xs text-zinc-500">No logs yet.</p>
      )}
    </div>
  </section>
)

const SearchField = ({ value, onChange, placeholder }) => (
  <div className="relative w-full sm:max-w-xs">
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="pl-9"
    />
  </div>
)

const StatusPill = ({ status, subtle = false }) => {
  const colorMap = {
    active: "bg-green-50 text-green-700",
    inactive: "bg-zinc-100 text-zinc-600",
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-blue-50 text-blue-700",
    processing: "bg-purple-50 text-purple-700",
    shipped: "bg-cyan-50 text-cyan-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
    paid: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-700",
    refunded: "bg-zinc-100 text-zinc-700",
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        colorMap[status] || "bg-zinc-100 text-zinc-700"
      } ${subtle ? "opacity-80" : ""}`}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {status}
    </span>
  )
}

export default AdminDashboard
