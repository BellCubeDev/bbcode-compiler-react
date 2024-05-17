import { isDangerousUrl } from './isDangerousUrl.js'

export function parseMaybeRelativeUrl(rawUrl: string): {url?: URL; path: string | null} {
    let url: URL | undefined
    let path: string
    try {
        url = new URL(rawUrl)
        path = url.href
    } catch (e) {
        // relative links
        if (rawUrl.startsWith('/') || !rawUrl.includes(':')) {
            path = rawUrl
        } else {
            return { path: null }
        }
    }

    if (url && isDangerousUrl(url)) {
        return { path: null }
    }

    return { url, path }
}
