import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
//V's_new_start
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
//V's_new_end

createRoot(document.getElementById('root')!).render(
  //  <StrictMode>
  //    <App />
  //  </StrictMode>,
  //V's_new_start
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
  //V's_new_end
)
