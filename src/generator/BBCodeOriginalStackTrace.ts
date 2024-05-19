export const BBCodeOriginalStackTrace = Symbol('hasErrorInBBCodeBeenAddressed')

// add as a key to Error
declare global {
    interface Error {
        [BBCodeOriginalStackTrace]?: string
    }
}
