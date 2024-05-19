import { isDangerousUrl } from './isDangerousUrl.js'

/** Parse a URL that could be relative or absolute.
 *
 * @param rawUrl
 *  The URL string to parse.
 * @param doDangerCheck
 *  If true, check if the URL is dangerous. Defaults to true.
 * @returns
 *  An object with the URL and the path.
 *
 * If the URL is dangerous or could not be parsed, `path` will be `null`. If the URL is relative, `url` will be `undefined` as the URL spec does not support relative URLs.
 */
export function parseMaybeRelativeUrl(rawUrl: string, doDangerCheck = true): {url?: URL; path: string | null} {
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

    if (doDangerCheck && url && isDangerousUrl(url)) {
        return { path: null }
    }

    return { url, path }
}
