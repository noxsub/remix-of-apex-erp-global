import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // @ts-ignore
  nitro: {
    preset: "cloudflare-pages"
  }
});