import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const serverPort = 3000;
console.log(`api needs to run on ${serverPort} for vite server`);
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: path.resolve("../"),
  server: {
    proxy: {
      "/api": `http://localhost:${serverPort}`,
    },
  },
});
