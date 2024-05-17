# BBCode Compiler - React

A fast BBCode parser and React generator with TypeScript support. Forked from [Trinovantes/bbcode-compiler](https://github.com/Trinovantes/bbcode-compiler).

**Note:** This package is a [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

## Usage

```ts
import { generateReact } from 'bbcode-compiler-react'

// React: <b>Hello World</b>
const react = generateReact('[b]Hello World[/b]')
```

## Extending With Custom Tags

```tsx
import { generateReact, defaultTransforms, getWidthHeightAttr } from 'bbcode-compiler-react'

const customTransforms: typeof defaultTransforms = [
    // Default tags included with this package
    ...defaultTransforms,

    // You can override a default tag by including it after the original in the transforms array
    {
        name: 'b',
        component({ tagNode, children }) {
            return <b>
                {children}
            </b>
        }
    },

    // Create new tag
    // You should read the TypeScript interface for TagNode in src/parser/AstNode.ts
    // You can also use the included helper functions like getTagImmediateText and getWidthHeightAttr
    {
        name: 'youtube',
        skipChildren: true, // Do not actually render the "https://www.youtube.com/watch?v=dQw4w9WgXcQ" text
        component({ tagNode, children }) {
            const src = tagNode.getTagImmediateText()
            if (!src) {
                return false
            }

            const matches = /youtube.com\/watch\?v=(\w+)/.exec(src)
            if (!matches) {
                return false
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
