import { DoNotRenderBBCodeError } from '../DoNotRenderBBCodeError.js'

/** When called in the `Component` method of a `Transform` object, this will cause the raw text to be rendered instead of the children.
 *
 * Throws an error (which is then caught by the generator) under the hood. TypeScript understands this thanks to the `never` type. While you do not strictly need to use the `return` keyword here, it is recommended for readability with IDEs which implement syntax highlighting.
 */
export function doNotRenderBBCodeComponent(): never {
    throw new DoNotRenderBBCodeError()
}
