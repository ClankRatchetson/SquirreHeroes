import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png"],
      manifest: {
        name: "Squirrel Heroes : les Justiciers de la Forêt",
        short_name: "Squirrel Heroes",
        description: "Deck builder solo hors-ligne — des écureuils costumés défendent leur forêt.",
        theme_color: "#1c1917",
        background_color: "#1c1917",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,webp,png,svg,woff2}"],
      },
    }),
  ],
});
