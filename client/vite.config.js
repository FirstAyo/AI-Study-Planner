import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    // allow Railway public URL
    allowedHosts: ["study-planner.up.railway.app"],
    host: true,
    port: process.env.PORT || 4173,
  },
});
