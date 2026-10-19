import { solidStart } from "@solidjs/start/config";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{js,ts,jsx,tsx}": "vp check --fix",
  },
  fmt: { sortImports: true, printWidth: 80 },
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [solidStart() as any, nitro() as any, tailwindcss() as any],
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: {
      clientPort: 3000,
    },
  },
});
