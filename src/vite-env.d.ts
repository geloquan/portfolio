/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_ONE_MEDIA_URL?: string
  readonly VITE_PROJECT_TWO_MEDIA_URL?: string
  readonly VITE_PROJECT_THREE_MEDIA_URL?: string
  readonly VITE_PROJECT_FOUR_MEDIA_URL?: string
  readonly VITE_PROJECT_ONE_YOUTUBE_URL?: string
  readonly VITE_PROJECT_TWO_YOUTUBE_URL?: string
  readonly VITE_PROJECT_ONE_FACEBOOK_URL?: string
  readonly VITE_PROJECT_THREE_FACEBOOK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
