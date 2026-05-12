/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CLOUDFLARE_R2_PROFILE_IMAGE_URL?: string
  readonly CLOUDFLARE_R2_PROJECT_ONE_MEDIA_URL?: string
  readonly CLOUDFLARE_R2_PROJECT_TWO_MEDIA_URL?: string
  readonly CLOUDFLARE_R2_PROJECT_THREE_MEDIA_URL?: string
  readonly CLOUDFLARE_R2_PROJECT_FOUR_MEDIA_URL?: string
  readonly CLOUDflare_R2_PROFILE_IMAGE_URL?: string
  readonly CLOUDflare_R2_PROJECT_ONE_MEDIA_URL?: string
  readonly CLOUDflare_R2_PROJECT_TWO_MEDIA_URL?: string
  readonly CLOUDflare_R2_PROJECT_THREE_MEDIA_URL?: string
  readonly CLOUDflare_R2_PROJECT_FOUR_MEDIA_URL?: string
  readonly VITE_PROJECT_ONE_YOUTUBE_URL?: string
  readonly VITE_PROJECT_TWO_YOUTUBE_URL?: string
  readonly VITE_PROJECT_ONE_FACEBOOK_URL?: string
  readonly VITE_PROJECT_THREE_FACEBOOK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
