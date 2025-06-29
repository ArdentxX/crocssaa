import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDom from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './components/App'
import './css/index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <App/>
  </BrowserRouter>
);