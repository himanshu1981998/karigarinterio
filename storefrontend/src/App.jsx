import { useEffect } from 'react'
import Home from './pages/Home'
import { Toaster } from "@/components/ui/sonner"
import ProductDetailPage from './pages/ProductDetailPage'
import Header from './components/Header'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import WhatsAppButton from './components/WhatsAppButton'
import { CartDrawer } from './components/CartDrawer'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import MyProfile from './components/MyProfile'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ProductsPage from './pages/ProductsPage'
import { useCartStore } from './store/cartStore'
import { useAuthStore } from "@/store/authStore"
import ServicesPage from './pages/ServicesPage'
import AdminDashboard from './pages/AdminDashboard'
import Footer from './components/Footer'
import StaticPage from './pages/StaticPage'

function App() {
  const loadCart = useCartStore((state) => state.loadCart)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  useEffect(() => {
    if (isLoggedIn) {
      loadCart()
    }
  }, [isLoggedIn, loadCart])
  
  return (
    <>
      <BrowserRouter>
         <Header/>
          <CartDrawer />
          <Toaster />
          <Routes>
               <Route path="/" element={<Home/>}/>
               <Route path="/product/:slug" element={<ProductDetailPage />} />
               <Route path="/products" element={<ProductsPage />} />
               <Route path="/services" element={<ServicesPage />} />
               <Route path="/:slug" element={<StaticPage />} />
               <Route path="/checkout" element={<ProtectedRoute><CheckoutPage/></ProtectedRoute>} />
               <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
               <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
               <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
               <Route path="/MyProfile"element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          </Routes>
          <Footer/>
          <WhatsAppButton/>
      </BrowserRouter>
    </>
  )
}

export default App
