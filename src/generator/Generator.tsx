import React from 'react'
import { type AstNode, AstNodeType, type RootNode, type TagNode } from '../parser/AstNode.js'
import { defaultTransforms } from './transforms/defaultTransforms.js'
import type { Transform } from './transforms/Transform.js'
import { DoNotRenderBBCodeError } from './DoNotRenderBBCodeError.js'
import { BBCodeOriginalStackTrace } from './BBCodeOriginalStackTrace.js'

export class Generator {
    transforms: ReadonlyMap<string, Transform>

    constructor(transforms = defaultTransforms, public errorIfNoTransform = true) {
        this.transforms = new Map(transforms.map((transform) => [transform.name, transform]))
    }

    private joinAdjacentStrings(children: Array<React.ReactNode>): Array<React.ReactNode> {
        return children.reduce<Array<React.ReactNode>>((acc: Array<React.ReactNode>, child) => {
            if (typeof child === 'string' && typeof acc[acc.length - 1] === 'string') {
                (acc[acc.length - 1] as string) += child
            } else {
                acc.push(child)
            }
            return acc
        }, [])
    }

    private createUnrenderedNodeWithRenderedChildren(tagNode: TagNode, children?: Array<React.ReactNode>): React.ReactNode {
        if (!children || children.length === 0) return [tagNode.ogStartTag, tagNode.ogEndTag]

        if (typeof children[0] === 'string') {
            children[0] = tagNode.ogStartTag + children[0]
        } else {
            children.unshift(tagNode.ogStartTag)
        }

        if (typeof children[children.length - 1] === 'string') {
            children[children.length - 1] = (children[children.length - 1] as string) + tagNode.ogEndTag
        } else {
            children.push(tagNode.ogEndTag)
        }

        return children
    }

    private generateForNode(this: Generator, node: AstNode, key: number): React.ReactNode {
        switch (node.nodeType) {
            case AstNodeType.LinebreakNode: {
                return <br key={key} />
            } case AstNodeType.TextNode: {
                return node.str
            } case AstNodeType.TagNode: {
                const tagName = node.tagName
                const transform = this.transforms.get(tagName)
                const renderedChildren =
                    transform && transform.skipChildren
                        ? undefined
                        : this.joinAdjacentStrings(node.children.map((child, i) => {
                            const renderedChild = this.generateForNode(child, i)
                            return renderedChild
                        })).flat()
                if (!transform) {
                    if (this.errorIfNoTransform) {
                        throw new Error(`Unrecognized bbcode ${node.tagName}`)
                    } else {
                        console.warn(`Unrecognized bbcode ${node.tagName}`)
                    }
                    return this.createUnrenderedNodeWithRenderedChildren(node)
                }

                // because error boundaries don't work compile-time smh
                const WrappedComponentFunction = ({ tagNode, children }: {tagNode: TagNode; children: typeof renderedChildren}) => {
                    try {
                        return transform.Component({ tagNode, children } as unknown as never)
                    } catch (e) {
                        if (!(e instanceof DoNotRenderBBCodeError)) {
                            if (e instanceof Error && e.stack && e[BBCodeOriginalStackTrace] === undefined) {
                                e[BBCodeOriginalStackTrace] = e.stack
                                e.stack += (`\n\nTag: [${node.tagName}]\n\n` + // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    `${this.createUnrenderedNodeWithRenderedChildren(node)}` +
                                    `\n\n${node.toString()}`).split('\n').map((line) => line.length ? `    ${line}` : '').join('\n')
                            }
                            throw e
                        }

                        return this.createUnrenderedNodeWithRenderedChildren(node, renderedChildren)
                    }
                }

                // 😱 readable component names in error traces FTW
                Object.defineProperty(WrappedComponentFunction, 'name', {
                    value: transform.Component.name !== '' && transform.Component.name !== 'Component'
                        ? transform.Component.name
                        : `BBCode_${tagName}`,
                })

                return <WrappedComponentFunction tagNode={node} key={key}>
                    {renderedChildren}
                </WrappedComponentFunction>
            } default: {
                const renderedChildren = node.children.map((child, i) => {
                    const renderedChild = this.generateForNode(child, i)
                    return renderedChild
                })

                return this.joinAdjacentStrings(renderedChildren)
            }
        }
    }

    public generate(root: RootNode): React.ReactElement {
        return <>
            {this.generateForNode(root, 0)}
        </>
    }
}
