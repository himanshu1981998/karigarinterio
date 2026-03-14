
import Home from './pages/Home'

import Register from './components/RegisterForm'
import ProductCard from './components/ProductCard'
import LoginPage from './pages/LoginPage'
import  RegisterPage from './pages/RegisterPage'
import Header from './components/Header'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import WhatsAppButton from './components/WhatsAppButton'
import { CartDrawer } from './components/CartDrawer'

function App() {
  

  return (
    <>
      <BrowserRouter>
         <Header/>
          <CartDrawer />
          <Routes>
               <Route path="/" element={<Home/>}/>
          </Routes>
          <WhatsAppButton/>
      </BrowserRouter>
    </>
  )
}

export default App
