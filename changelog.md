# 2.0.1
## Bug Fixes
Actually export `doNotRenderBBCodeComponent()` from `index.ts` this time

# 2.0.0
## Performance Impact
For full transparency, this update does have roughly a roughly 15% hit to performance on paper. In practice, this is likely to be completely negligible (especially given more real-world workloads than Stephen Li [Trinovantes]'s built-in benchmarking), but it is worth noting for full transparency.

## Breaking Changes
* Adjust handling of component children, including fixing a bug where `skipChildren` was not being honored (meaning excess renders were being performed)
* Adjust handling of render failing...
  * fixing a bug where components which would not be rendered would simply not appear (rather than displaying their raw text)
  * requiring that all render failures now either call `doNotRenderBBCodeComponent()` or throw `DoNotRenderBBCodeError` (see below)
* Rename `Transform.component` to `Transform.Component` to better satisfy React naming conventions and linters which rely on them

### `doNotRenderBBCodeComponent()` & `DoNotRenderBBCodeError`
These new exports are for use when a component should not be rendered (such as when an unsafe URL is detected). When encountered by the compiler, the component will not be rendered.

The `doNotRenderBBCodeComponent()` function returns the TypeScript type `never` which TS understands to be the same as throwing an error or returning. You therefore are not strictly required to use `return` after calling `doNotRenderBBCodeComponent()` (though it helps with readability in IDEs with syntax highlighting).

The `DoNotRenderBBCodeError` is a class which extends `Error` and is thrown when a component should not be rendered. While I can't think of much of a use case for this, it is provided for completeness under `bbcode-compiler-react/advanced`.

## Improvements
* Add optional `doDangerCheck` parameter to `parseMaybeRelativeUrl()` (defaults to true to mirror 1.0.0 behavior)
* Component keys are now the nodes stringified normally (rather than plain iterator indices) to make React happier
* Errors thrown during tag rendering will now append to the stack the tag that caused the error and a TagNode object for debugging passed passed through Json.stringify()
  * This behavior will only apply if the symbol `BBCodeOriginalStackTrace` is not set to the old stack trace on the error object. This is exported from `bbcode-compiler-react/advanced` if you wish to use it in your own error handling.
* Transform's Component method will now show the name `BBCode_${tagName}` (e.g. `BBCode_b` for [b]) if no custom function name is provided

## Bug Fixes
* In rare cases, the `children` parameter could be a two-dimensional array. This array is now flattened.
  * Important note - you should NOT be relying on the `children` parameter in your components; you should prefer to gather data from the `tagNode` property.

## TypeScript Types
* For transforms which have `skipChildren`, the `children` parameter will now always be `undefined`
* Added JSDoc to:
  * `parseMaybeRelativeUrl()`
  * `isDangerousUrl()`
* Revised JSDoc for:
  * `Transform.Component`

# 1.0.0
Initial release
