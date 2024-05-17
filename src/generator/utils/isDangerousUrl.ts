const safeDataUriRe = /^data:image\/(gif|png|jpeg|webp);/

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
