import { renderToString } from 'react-dom/server'
import { validationTests } from '../data/validationTests.js'
import { xssTests } from '../data/xssTests.js'
import { generateReact } from '../../src/index.js'
import { describe, test, expect } from 'vitest'
import { throwErrorTestTransforms } from '../data/throwErrorTest.js'

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
                expect(output).not.toContain(unexpectedSubstring)
            }
        })
    })

    describe('DoNotRenderBBCodeError', () => {
        test('thrown errors propagate', () => {
            expect(() => {
                renderToString(generateReact('[throw_normal]some data[/throw_normal]', throwErrorTestTransforms))
            }).toThrow('This is an error for the test! hehe')
        })
        test('Manually thrown DoNotRenderBBCodeError stops tag rendering', () => {
            const input = '[throw_manually]some data[/throw_manually]'
            const output = renderToString(generateReact(input, throwErrorTestTransforms))
            expect(output).toBe(input)
        })
        test('doNotRenderBBCodeComponent stops tag rendering', () => {
            const input = '[throw_with_util]some data[/throw_with_util]'
            const output = renderToString(generateReact(input, throwErrorTestTransforms))
            expect(output).toBe(input)
        })
        test('Component renders normally if no error is thrown', () => {
            const input = '[do_nothing]some data[/do_nothing]'
            const output = renderToString(generateReact(input, throwErrorTestTransforms))
            expect(output).toBe('<span data-did-render-component="obviously">some data</span>')
        })
    })
})
