# BBCode Compiler - React

Parses BBCode and generates React components with strong TypeScript support. Forked from [Trinovantes/bbcode-compiler](https://github.com/Trinovantes/bbcode-compiler).

**Note:** This package is a [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

## Usage

```ts
import { generateReact } from 'bbcode-compiler-react'

// React: <b>Hello World</b>
const react = generateReact('[b]Hello World[/b]')
```

<!--
    TODO: Touch on API capabilities a bit more, such as:
        * Built-in utils
        * DoNotRenderBBCodeError
        * Rendering performance & why you should use this anyway (~5x slower than bbcode-compiler)
        * Graceful error handling
-->

## Extending With Custom Tags

```tsx
import { generateReact, defaultTransforms, getWidthHeightAttr, doNotRenderBBCodeComponent } from 'bbcode-compiler-react'

const customTransforms: typeof defaultTransforms = [
    // Default tags included with this package
    ...defaultTransforms,

    // You can override a default tag by including it after the original in the transforms array
    {
        name: 'b',
        Component({ tagNode, children }) {
            return <b>
                {children}
            </b>
        }
    },

    // Create new tag
    // If you're writing an advanced tag, you may want to read the TypeScript interface for TagNode in src/parser/AstNode.ts
    // You can also use the included helper functions like getTagImmediateText and getWidthHeightAttr
    {
        name: 'youtube',
        skipChildren: true, // Do not actually render the "https://www.youtube.com/watch?v=dQw4w9WgXcQ" text
        Component({ tagNode, children }) { // Because we're in a `skipChildren` tag, TypeScript knows that `children` will always be `undefined`
            const src = tagNode.getTagImmediateText()
            if (!src) {
                return doNotRenderBBCodeComponent() // This method returns the type `never` which is as good as returning or throwing for TypeScript
            }

            const matches = /youtube.com\/watch\?v=(\w+)/.exec(src)
            if (!matches) {
                return doNotRenderBBCodeComponent()
            }

            const videoId = matches[1]
            const { width, height } = getWidthHeightAttr(tagNode)

            return <iframe
                width={width ?? 560}
                height={height ?? 315}
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube Video Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        },
    },
]

// <iframe
//     width="560"
//     height="315"
//     src="https://www.youtube.com/embed/dQw4w9WgXcQ"
//     title="YouTube Video Player"
//     frameBorder="0"
//     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//     allowFullScreen
// ></iframe>
const html = generateReact('[youtube]https://www.youtube.com/watch?v=dQw4w9WgXcQ[/youtube]', customTransforms)
```
