import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/chat": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
