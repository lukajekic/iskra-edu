import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import Sitemap from 'vite-plugin-sitemap'
export default defineConfig({
  plugins: [react(), tailwindcss(),
    Sitemap({ 
      hostname: 'https://iskra-edu.vercel.app', // Zameni sa svojim domenom
      dynamicRoutes: ['/'] // Stavili smo samo početnu stranu
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})