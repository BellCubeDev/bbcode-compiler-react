import React from 'react'
import { getWidthHeightAttr } from '../utils/getWidthHeightAttr.js'
import { isOrderedList } from '../utils/isOrderedList.js'
import type { Transform } from './Transform.js'
import { parseMaybeRelativeUrl } from '../utils/parseMaybeRelativeUrl.js'
import { doNotRenderBBCodeComponent } from '../utils/doNotRenderBBCodeComponent.js'

export const defaultTransforms: ReadonlyArray<Transform> = [
    {
        name: 'b',
        Component({ children }) {
            return <b>
                {children}
            </b>
        },
    },
    {
        name: 'i',
        Component({ children }) {
            return <i>
                {children}
            </i>
        },
    },
    {
        name: 'u',
        Component({ children }) {
            return <u>
                {children}
            </u>
        },
    },
    {
        name: 's',
        Component({ children }) {
            return <del>
                {children}
            </del>
        },
    },
    {
        name: 'style',
        Component({ children, tagNode }) {
            const { size, color } = tagNode.getAttributesByName()

            let fontSize = size
            if (size && /^\d+$/.test(size)) {
                fontSize = `${size}%;` // When no units provided (i.e. just a number), then assume %
            }

            return <span style={{
                color,
                fontSize,
            }}>
                {children}
            </span>
        },
    },
    {
        name: 'color',
        Component({ children, tagNode }) {
            return <span style={{ color: tagNode.getTagImmediateAttrVal() }}>
                {children}
            </span>
        },
    },
    {
        name: 'hr',
        isStandalone: true,
        Component() {
            return <hr />
        },
    },
    {
        name: 'list',
        Component({ tagNode, children }) {
            return isOrderedList(tagNode)
                ? <ol>{children}</ol>
                : <ul>{children}</ul>
        },
    },
    {
        name: '*',
        isLinebreakTerminated: true,
        Component({ children }) {
            return <li>
                {children}
            </li>
        },
    },
    {
        name: 'img',
        skipChildren: true,
        Component({ tagNode }) {
            const src = tagNode.getTagImmediateText() || tagNode.attributes.find((a) => a.key === 'src')?.val || tagNode.getTagImmediateAttrVal()
            if (!src || typeof src !== 'string') {
                doNotRenderBBCodeComponent()
            }

            const { path } = parseMaybeRelativeUrl(src)
            if (!path) {
                doNotRenderBBCodeComponent()
            }

            const { width, height } = getWidthHeightAttr(tagNode)

            return <img src={path} width={width} height={height} />
        },
    },
    {
        name: 'url',
        Component({ children, tagNode }) {
            const rawUrl = tagNode.getTagImmediateAttrVal() || tagNode.getTagImmediateText()
            if (!rawUrl || typeof rawUrl !== 'string') {
                doNotRenderBBCodeComponent()
            }

            const { path } = parseMaybeRelativeUrl(rawUrl)
            if (!path) {
                doNotRenderBBCodeComponent()
            }

            return <a href={path}>
                {children}
            </a>
        },
    },
    {
        name: 'quote',
        Component({ children, tagNode }) {
            const immediateAttribute = tagNode.getTagImmediateAttrVal()
            return <blockquote>
                {immediateAttribute && <strong>{immediateAttribute}</strong>}
                {children}
            </blockquote>
        },
    },
    {
        name: 'table',
        Component({ children }) {
            return <table>
                {children}
            </table>
        },
    },
    {
        name: 'tr',
        Component({ children }) {
            return <tr>
                {children}
            </tr>
        },
    },
    {
        name: 'td',
        Component({ children }) {
            return <td>
                {children}
            </td>
        },
    },
    {
        name: 'code',
        Component({ children }) {
            return <code>
                {children}
            </code>
        },
    },
]
