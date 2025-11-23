import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace `Birthday` with your GitHub repo slug if you rename the repo.
export default defineConfig({
  base: '/Birthday/',
  plugins: [react()],
})
