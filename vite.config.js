import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import jsconfigPaths from "vite-jsconfig-paths";

export default defineConfig({
  plugins: [react(), jsconfigPaths()],
  base: "/",
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), "node_modules/$1"),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), "src/$1"),
      },
    ],
  },
  server: {
    open: true,
    port: 3000,
    cors: true,
  },
  preview: {
    open: true,
    port: 3000,
  },
});
