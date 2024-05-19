import { Generator } from './generator/Generator.js'
import { defaultTransforms } from './generator/transforms/defaultTransforms.js'
import { Lexer } from './lexer/Lexer.js'
import { Parser } from './parser/Parser.js'

/** Generate React elements from BBCode
 *
 * @param input
 *  BBCode to parse
 *
 * @param transforms
 *  A list of transforms. Defaults to the `defaultTransforms` exported from this package.
 *
 * @param errorIfNoTransform
 *  If true, throws an error when a tag is not in the transforms list. This is the default behavior.
 *
 *  If false, will only throw a warning and render the tag as plain text.
 *
 * @returns
 *  a React.ReactElement parsed from the `input` BBCode
 */
export function generateReact(
    input: string,
    transforms = defaultTransforms,
    errorIfNoTransform = true,
): React.ReactElement {
    const lexer = new Lexer()
    const tokens = lexer.tokenize(input)

    const parser = new Parser(transforms)
    const root = parser.parse(input, tokens)

    const generator = new Generator(transforms, errorIfNoTransform)
    return generator.generate(root)
}
