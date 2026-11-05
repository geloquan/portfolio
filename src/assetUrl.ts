const r2Host = (() => {
  try {
    return import.meta.env.VITE_R2_PUBLIC_URL ? new URL(import.meta.env.VITE_R2_PUBLIC_URL).host : null
  } catch {
    return null
  }
})()

export function resolveAssetUrl(reference: string | undefined): string | null {
  const value = reference?.trim()
  if (!value) return null

  if (/^[A-Za-z][A-Za-z\d+.-]*:/.test(value) || value.startsWith('//')) {
    try {
      const parsed = new URL(value)
      return r2Host && parsed.host === r2Host && parsed.protocol === 'https:' ? parsed.toString() : null
    } catch {
      return null
    }
  }

  const base = import.meta.env.VITE_R2_PUBLIC_URL?.trim().replace(/\/+$/, '')
  if (!base || !r2Host || value.startsWith('/') || value.split('/').some((segment) => segment === '..' || segment === '.')) return null
  try {
    return new URL(value.split('/').map(encodeURIComponent).join('/'), `${base}/`).toString()
  } catch {
    return null
  }
}
