import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep both prefixes during migration; remove CLOUDflare_R2_ once all environments are normalized.
  envPrefix: ['VITE_', 'CLOUDFLARE_R2_', 'CLOUDflare_R2_'],
})
