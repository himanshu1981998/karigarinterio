
import Home from './pages/Home'
import { Toaster } from "@/components/ui/sonner"
import ProductPage from './pages/ProductPage'
import Header from './components/Header'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import WhatsAppButton from './components/WhatsAppButton'
import { CartDrawer } from './components/CartDrawer'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import MyProfile from './components/MyProfile'
import ProtectedRoute from './components/ProtectedRoute'
function App() {
  

  return (
    <>
      <BrowserRouter>
         <Header/>
          <CartDrawer />
          <Toaster />
          <Routes>
               <Route path="/" element={<Home/>}/>
               <Route path="/product/:slug" element={<ProductPage />} />
               <Route path="/checkout" element={<ProtectedRoute><CheckoutPage/></ProtectedRoute>} />
               <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
               <Route path="/MyProfile"element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          </Routes>
          <WhatsAppButton/>
      </BrowserRouter>
    </>
  )
}

export default App
