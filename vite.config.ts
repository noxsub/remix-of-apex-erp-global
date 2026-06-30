import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Deixa esse campo aqui para a automação da Cloudflare não quebrar:
  plugins: [],
  // @ts-ignore
  nitro: {
    preset: "cloudflare-pages"
  }
});