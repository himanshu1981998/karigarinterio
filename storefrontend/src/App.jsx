
import Home from './pages/Home'
import { Toaster } from "@/components/ui/sonner"
import ProductCard from './components/ProductCard'
import LoginPage from './pages/LoginPage'
import ProductPage from './pages/ProductPage'
import Header from './components/Header'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import WhatsAppButton from './components/WhatsAppButton'
import { CartDrawer } from './components/CartDrawer'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
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
               <Route path="/checkout" element={<CheckoutPage />} />
               <Route path="/orders" element={<OrdersPage />} />
          </Routes>
          <WhatsAppButton/>
      </BrowserRouter>
    </>
  )
}

export default App
