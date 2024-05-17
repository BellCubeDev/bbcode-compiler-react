export type ValidationTestCase = {
    name: string
    input: string
    expectedOutput: string
}

export type XssTestCase = {
    name: string
    input: string
    unexpectedSubstrings: Array<string>
}
