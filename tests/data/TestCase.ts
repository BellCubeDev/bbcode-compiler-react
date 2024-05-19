export interface ValidationTestCase {
    name: string
    input: string
    expectedOutput: string
}

export interface XssTestCase {
    name: string
    input: string
    unexpectedSubstrings: Array<string>
}
