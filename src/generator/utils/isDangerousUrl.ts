const safeDataUriRe = /^data:image\/(gif|png|jpeg|webp);/

/** Checks if the URl is potentially dangerous
 *
 * Allowed protocols:
 * - "http:"
 * - "https:"
 * - "mailto:"
 *
 * Allowed `data:` URI types:
 * - "data:image/gif;"
 * - "data:image/png;"
 * - "data:image/jpeg;"
 * - "data:image/webp;"
 *
 * @param url
 *  a URL object to check
 * @returns
 *  `true` if the URL is potentially dangerous, `false` otherwise
 */
export function isDangerousUrl(url: URL): boolean {
    switch (url.protocol) {
        case 'http:':
        case 'https:':
        case 'mailto:':
            return false
        case 'data:':
            return !safeDataUriRe.test(url.href)
        default:
            return true
    }
}
