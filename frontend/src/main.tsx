import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRoutes from './AppRoutes.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <>
        <header >
        </header>

        <main >
          <AppRoutes />
        </main>

        <footer >
        </footer>
      </>
    </BrowserRouter>
  </StrictMode>
)
