import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  optimizeDeps: {
    include: ["react-router-dom"],
  },
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background/index.ts"),
        tracker: resolve(__dirname, "src/content/tracker.ts"),
        blockSites: resolve(__dirname, "src/content/blockSites.tsx"),
        // The main HTML file for the UI, which uses React Router for navigation
        main: resolve(__dirname, "index.html"),
        options: resolve(__dirname, "options.html"), // Add options.html to the build
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Place background and content scripts in specific folders
          if (chunkInfo.name === "background") {
            return "background/index.js";
          }
          if (chunkInfo.name === "tracker") {
            return "content/tracker.js";
          }
          if (chunkInfo.name === "blockSites") {
            return "content/blockSites.js";
          }
          // Default for other entry points (like React components for popup/options)
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
