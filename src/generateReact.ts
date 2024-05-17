import { Generator } from './generator/Generator.js'
import { defaultTransforms } from './generator/transforms/defaultTransforms.js'
import { Lexer } from './lexer/Lexer.js'
import { Parser } from './parser/Parser.js'

export function generateReact(
    /** BBCode to parse */
    input: string,
    /** A list of transforms
     *
     * @see defaultTransforms
     */
    transforms = defaultTransforms,
    /** If true, throws an error when a tag is not in the transforms list. This is the default behavior.
     *
     * If false, will only throw a warning and render the tag as plain text.
    */
    errorIfNoTransform = true,
): React.ReactElement {
    const lexer = new Lexer()
    const tokens = lexer.tokenize(input)

    const parser = new Parser(transforms)
    const root = parser.parse(input, tokens)

    const generator = new Generator(transforms, errorIfNoTransform)
    return generator.generate(root)
}
