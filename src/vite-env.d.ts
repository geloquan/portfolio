/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_R2_PUBLIC_URL?: string
  readonly VITE_PROJECT_MEDICAL_ARTS_MEDIA_URL?: string
  readonly VITE_PROJECT_AI_LEGAL_MEDIA_URL?: string
  readonly VITE_PROJECT_SEASHELL_MEDIA_URL?: string
  readonly VITE_PROJECT_DOCTOR_DIRECTORY_MEDIA_URL?: string
  readonly VITE_PROJECT_ONE_MEDIA_URL?: string
  readonly VITE_PROJECT_TWO_MEDIA_URL?: string
  readonly VITE_PROJECT_THREE_MEDIA_URL?: string
  readonly VITE_PROFILE_IMAGE_URL?: string
  readonly VITE_THESIS_PAPER_URL?: string
  readonly VITE_PROJECT_ONE_YOUTUBE_URL?: string
  readonly VITE_PROJECT_TWO_YOUTUBE_URL?: string
  readonly VITE_PROJECT_ONE_FACEBOOK_URL?: string
  readonly VITE_PROJECT_THREE_FACEBOOK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
