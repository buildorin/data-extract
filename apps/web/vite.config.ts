import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import runtimeEnv from "vite-plugin-runtime-env";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), runtimeEnv()],
    server: {
      fs: {
        allow: [
          "..",
          "node_modules/.pnpm",
          "../../node_modules/.pnpm",
          // Explicitly allow KaTeX fonts
          "../../node_modules/.pnpm/katex@0.16.21/node_modules/katex/dist/fonts",
        ],
      },
    },
    define: {
      'window.env': JSON.stringify({
        VITE_IS_SELF_HOST: env.VITE_IS_SELF_HOST || '',
        VITE_DOCS_URL: env.VITE_DOCS_URL || '',
        VITE_KEYCLOAK_URL: env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
        VITE_KEYCLOAK_REALM: env.VITE_KEYCLOAK_REALM || 'orin',
        VITE_KEYCLOAK_CLIENT_ID: env.VITE_KEYCLOAK_CLIENT_ID || 'orin',
        VITE_KEYCLOAK_REDIRECT_URI: env.VITE_KEYCLOAK_REDIRECT_URI || 'http://localhost:5173',
        VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI: env.VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI || 'http://localhost:5173',
        VITE_API_URL: env.VITE_API_URL || 'http://localhost:8000',
        VITE_CONTENTFUL_SPACE_ID: env.VITE_CONTENTFUL_SPACE_ID || '',
        VITE_CONTENTFUL_ACCESS_TOKEN: env.VITE_CONTENTFUL_ACCESS_TOKEN || '',
        VITE_FEATURE_FLAG_PIPELINE: env.VITE_FEATURE_FLAG_PIPELINE || 'true',
      }),
    },
  };
});
