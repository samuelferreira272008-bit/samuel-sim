import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (
            id.includes("/node_modules/recharts/") ||
            id.includes("/node_modules/d3-") ||
            id.includes("/node_modules/victory-vendor/") ||
            id.includes("/node_modules/lodash/")
          ) {
            return "vendor-charts";
          }
          if (
            id.includes("/node_modules/react-markdown/") ||
            id.includes("/node_modules/remark-") ||
            id.includes("/node_modules/rehype-") ||
            id.includes("/node_modules/unified/") ||
            id.includes("/node_modules/mdast-") ||
            id.includes("/node_modules/hast-") ||
            id.includes("/node_modules/micromark")
          ) {
            return "vendor-markdown";
          }
          if (id.includes("/node_modules/@supabase/")) {
            return "vendor-supabase";
          }
          if (id.includes("/node_modules/framer-motion/") || id.includes("/node_modules/gsap/")) {
            return "vendor-motion";
          }
          if (id.includes("/node_modules/@tanstack/")) {
            return "vendor-query";
          }
          if (id.includes("/node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          if (id.includes("/node_modules/lucide-react/")) {
            return "vendor-icons";
          }
          if (
            id.includes("/node_modules/clsx/") ||
            id.includes("/node_modules/tailwind-merge/") ||
            id.includes("/node_modules/class-variance-authority/")
          ) {
            return "vendor-utils";
          }
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/react-router")
          ) {
            return "vendor-react";
          }
        },
      },
    },
  },
}));
