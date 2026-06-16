import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configureBoneyard } from "boneyard-js/react"
import "./bones/registry"
import './index.css'
import App from './App.jsx'

configureBoneyard({
  animate: "shimmer",
  color: "#e4e4e7",
  shimmerColor: "#f4f4f5",
  speed: "1.4s",
  transition: 180,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
