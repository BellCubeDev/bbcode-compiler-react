import { renderToString } from 'react-dom/server'
import { validationTests } from '../data/validationTests.js'
import { xssTests } from '../data/xssTests.js'
import { generateReact } from '../../src/index.js'
import { describe, test, expect } from 'vitest'

describe('Generator', () => {
    describe('Validation Tests', () => {
        test.each(validationTests)('$name', (test) => {
            const output = renderToString(generateReact(test.input))
            expect(output).toBe(test.expectedOutput)
        })
    })

    describe('XSS Tests', () => {
        test.each(xssTests)('$name', (test) => {
            const output = renderToString(generateReact(test.input))
            for (const unexpectedSubstring of test.unexpectedSubstrings) {
                expect(output.includes(unexpectedSubstring)).toBe(false)
            }
        })
    })
})
