/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOSTR_PRIVATE_KEY: string
}
 
interface ImportMeta {
  readonly env: ImportMetaEnv
} 