import React from 'react';
import { AstNode, AstNodeType, RootNode } from '../parser/AstNode.js'
import { defaultTransforms } from './transforms/defaultTransforms.js'
import type { Transform } from './transforms/Transform.js'

export class Generator {
    transforms: ReadonlyMap<string, Transform>

    constructor(transforms = defaultTransforms, public errorIfNoTransform = true) {
        this.transforms = new Map(transforms.map((transform) => [transform.name, transform]))
    }

    private joinAdjacentStrings(children: Array<React.ReactNode>): Array<React.ReactNode> {
        return children.reduce((acc: Array<React.ReactNode>, child) => {
            if (typeof child === 'string' && typeof acc[acc.length - 1]! === 'string') {
                acc[acc.length - 1]! += child
            } else {
                acc.push(child)
            }
            return acc
        }, [] as Array<React.ReactNode>)
    }

    private generateForNode(this: Generator, node: AstNode, i: number): [number, React.ReactNode] {
        switch (node.nodeType) {
            case AstNodeType.LinebreakNode: {
                return [i + 1, <br key={i} />]
            } case AstNodeType.TextNode: {
                return [i, node.str]
            } case AstNodeType.TagNode: {
                const tagName = node.tagName
                const transform = this.transforms.get(tagName)
                if (!transform) {
                    if (this.errorIfNoTransform) {
                        throw new Error(`Unrecognized bbcode ${node.tagName}`)
                    } else {
                        console.warn(`Unrecognized bbcode ${node.tagName}`)
                    }
                    return [i, node.ogEndTag]
                }

                const renderedChildren = node.children.map((child, j) => {
                    const [newI, renderedChild] = this.generateForNode(child,  i)
                    i = newI
                    return renderedChild
                })

                const { component: Component } = transform
                const renderedTag = <Component tagNode={node} key={i}>
                    {this.joinAdjacentStrings(renderedChildren)}
                </Component>

                if ((renderedTag as any) === false) {
                    return [i, node.ogStartTag + renderedChildren + node.ogEndTag]
                }

                return [i + 1, renderedTag]
            } default: {
                const renderedChildren = node.children.map((child, j) => {
                    const [newI, renderedChild] = this.generateForNode(child, i)
                    i = newI
                    return renderedChild
                });

                return [i + 1, this.joinAdjacentStrings(renderedChildren)]
            }
        }
    }

    public generate(root: RootNode): React.ReactElement {
        return <>
            {this.generateForNode(root, 0)[1]}
        </>
    }
}
