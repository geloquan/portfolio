/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CALENDLY_URL?: string
  readonly VITE_PROJECT_MEDICAL_ARTS_MEDIA_URL?: string
  readonly VITE_PROJECT_FLAGSHIP_MEDIA_URL?: string
  readonly VITE_PROJECT_SEASHELL_MEDIA_URL?: string
  readonly VITE_PROJECT_DOCTOR_DIRECTORY_MEDIA_URL?: string
  readonly VITE_PROFILE_IMAGE_URL?: string
  readonly VITE_PROJECT_FLAGSHIP_BENTO_ITEM_01_URL?: string
  readonly VITE_PROJECT_FLAGSHIP_BENTO_ITEM_02_URL?: string
  readonly VITE_PROJECT_FLAGSHIP_BENTO_ITEM_03_URL?: string
  readonly VITE_PROJECT_FLAGSHIP_BENTO_ITEM_04_URL?: string
  readonly VITE_PROJECT_FLAGSHIP_BENTO_ITEM_05_URL?: string
  readonly VITE_PROJECT_FLAGSHIP_BENTO_ITEM_06_URL?: string
  readonly VITE_PROJECT_FLAGSHIP_BENTO_ITEM_07_URL?: string
  readonly VITE_PROJECT_FLAGSHIP_BENTO_ITEM_08_URL?: string
  readonly VITE_THESIS_PAPER_URL?: string
  readonly VITE_PROJECT_ONE_YOUTUBE_URL?: string
  readonly VITE_PROJECT_TWO_YOUTUBE_URL?: string
  readonly VITE_PROJECT_ONE_FACEBOOK_URL?: string
  readonly VITE_PROJECT_THREE_FACEBOOK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
