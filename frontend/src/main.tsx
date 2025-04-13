import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRoutes from './AppRoutes.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <>
        <header className='position-fixed w-100 top-0'>
        </header>

        <main className='d-flex flex-column justify-content-center'
          style={{ paddingTop: '9.0rem', paddingBottom: '9.0rem', minHeight: '100%' }} >
          <AppRoutes />
        </main>

        <footer className='position-fixed w-100 bottom-0 right-0'>
        </footer>
      </>
    </BrowserRouter>
  </StrictMode>,
)
