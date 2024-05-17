import { describe, test, expect } from 'vitest'
import { Generator, Transform, Lexer, getWidthHeightAttr, Parser, stringifyTokens, AstNodeType } from '@/index.js'
import React from 'react';
import { renderToString } from 'react-dom/server';

const input = '[youtube]https://www.youtube.com/watch?v=dQw4w9WgXcQ[/youtube]'
const customTransforms: Array<Transform> = [
    {
        name: 'youtube',
        skipChildren: true,

        component({ tagNode }) {
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

describe('Custom', () => {
    describe('Lexer', () => {
        test('tokens can reconstruct original test', () => {
            const tokens = new Lexer().tokenize(input)
            expect(stringifyTokens(input, tokens)).toBe(input)
        })
    })

    describe('Parser', () => {
        test('parses 1 TagNode', () => {
            const tokens = new Lexer().tokenize(input)
            const root = new Parser(customTransforms).parse(input, tokens)
            expect(root.children.length).toBe(1)

            const tagNode = root.children[0]
            expect(tagNode.nodeType).toBe(AstNodeType.TagNode)
            expect(tagNode.children.length).toBe(1)

            expect(tagNode.children[0].nodeType).toBe(AstNodeType.RootNode)
            expect(tagNode.children[0].children.length).toBe(1)
            expect(tagNode.children[0].children[0].nodeType).toBe(AstNodeType.TextNode)
        })
    })

    describe('Generator', () => {
        test('generates correct html', () => {
            const tokens = new Lexer().tokenize(input)
            const root = new Parser(customTransforms).parse(input, tokens)
            const output = renderToString(new Generator(customTransforms).generate(root))

            expect(output).toBe(`<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube Video Player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>`)
        })
    })
})
