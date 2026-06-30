import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/start/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" }
    })
  ],
  // Garante que o Nitro saiba que deve gerar arquivos para o Cloudflare
  nitro: {
    preset: "cloudflare-pages"
  }
});