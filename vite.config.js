import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/elephantorina/" : "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    allowedHosts: [
      ".lhr.life",     // разрешает любые поддомены localhost.run
      "localhost",
      "127.0.0.1",
    ],
    hmr: {
      port: 3000,
    },
  },
});
