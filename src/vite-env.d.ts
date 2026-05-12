/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROFILE_IMAGE_URL?: string
  readonly VITE_PROJECT_ONE_MEDIA_URL?: string
  readonly VITE_THESIS_PAPER_URL?: string
  readonly VITE_PROJECT_ONE_YOUTUBE_URL?: string
  readonly VITE_PROJECT_TWO_YOUTUBE_URL?: string
  readonly VITE_PROJECT_ONE_FACEBOOK_URL?: string
  readonly VITE_PROJECT_THREE_FACEBOOK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
