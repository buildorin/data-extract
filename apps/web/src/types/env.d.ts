/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_SELF_HOST: string;
  readonly VITE_DOCS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 