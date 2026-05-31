/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_AUTO_AUTH?: string
  readonly VITE_DEV_USER_EMAIL?: string
  readonly VITE_DEV_USER_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  /** Telegram Mini App haptic feedback injected by the native wrapper. */
  haptic?: () => void
}
