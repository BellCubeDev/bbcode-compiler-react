import React from 'react';
import { getWidthHeightAttr } from '../utils/getWidthHeightAttr.js'
import { isOrderedList } from '../utils/isOrderedList.js'
import type { Transform } from './Transform.js'
import { parseMaybeRelativeUrl } from '../utils/parseMaybeRelativeUrl.js';

export const defaultTransforms: ReadonlyArray<Transform> = [
    {
        name: 'b',
        component({ children }) {
            return <b>
                {children}
            </b>
        }
    },
    {
        name: 'i',
        component({ children }) {
            return <i>
                {children}
            </i>
        }
    },
    {
        name: 'u',
        component({ children }) {
            return <u>
                {children}
            </u>
        }
    },
    {
        name: 's',
        component({ children }) {
            return <del>
                {children}
            </del>
        }
    },
    {
        name: 'style',
        component({ children, tagNode }) {
            const {size, color} = tagNode.getAttributesByName();

            let fontSize = size;
            if (size && /^\d+$/.test(size)) {
                fontSize = `${size}%;` // When no units provided (i.e. just a number), then assume %
            }

            return <span style={{
                color,
                fontSize,
            }}>
                {children}
            </span>
        }
    },
    {
        name: 'color',
        component({ children, tagNode }) {
            return <span style={{ color: tagNode.getTagImmediateAttrVal() }}>
                {children}
            </span>
        }
    },
    {
        name: 'hr',
        isStandalone: true,
        component() {
            return <hr />
        }
    },
    {
        name: 'list',
        component({ tagNode, children }) {
            return isOrderedList(tagNode)
                ? <ol>{children}</ol>
                : <ul>{children}</ul>
        }
    },
    {
        name: '*',
        isLinebreakTerminated: true,
        component({ children }) {
            return <li>
                {children}
            </li>
        }
    },
    {
        name: 'img',
        skipChildren: true,
        component({ tagNode }) {
            let src = tagNode.getTagImmediateText() || tagNode.attributes.find(a => a.key === 'src') || tagNode.getTagImmediateAttrVal();
            if (!src || typeof src !== 'string') {
                return false
            }

            const { path } = parseMaybeRelativeUrl(src)
            if (!path) {
                return false
            }

            const { width, height } = getWidthHeightAttr(tagNode)

            return <img src={path} width={width} height={height} />
        }
    },
    {
        name: 'url',
        component({ children, tagNode }) {
            const rawUrl = tagNode.getTagImmediateAttrVal() || tagNode.getTagImmediateText();
            if (!rawUrl || typeof rawUrl !== 'string') {
                return false
            }

            const { path } = parseMaybeRelativeUrl(rawUrl)
            if (!path) {
                return false
            }

            return <a href={path}>
                {children}
            </a>
        }
    },
    {
        name: 'quote',
        component({ children, tagNode }) {
            const immediateAttribute = tagNode.getTagImmediateAttrVal();
            return <blockquote>
                {immediateAttribute && <strong>{immediateAttribute}</strong>}
                {children}
            </blockquote>
        }
    },
    {
        name: 'table',
        component({ children }) {
            return <table>
                {children}
            </table>
        }
    },
    {
        name: 'tr',
        component({ children }) {
            return <tr>
                {children}
            </tr>
        }
    },
    {
        name: 'td',
        component({ children }) {
            return <td>
                {children}
            </td>
        }
    },
    {
        name: 'code',
        component({ children }) {
            return <code>
                {children}
            </code>
        }
    },
]
