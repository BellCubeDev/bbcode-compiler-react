import type { TagNode } from '../../parser/AstNode.js'
import React from 'react'

export type Transform = {
    /**
     * The name of the tag. This is the string that appears between the square brackets in the BBCode.
     *
     * For example, [b]text[/b] has the tag name "b".
     */
    name: string

    /**
     * If true, then the children of this node will not be rendered (e.g. [img]https://example.com/image.jpg[/img] should not render the image URL).
     *
     * Defaults to false.
     */
    skipChildren?: boolean
    /**
     * If true, this tag only has a starting tag (e.g. [hr] or [br]).
     *
     * Defaults to false.
    */
    isStandalone?: boolean // Only has StartTag e.g. "[hr]"
    /**
     * If true, the tag should end when encountering a linebreak. For example, the [*] tag in a list.
     *
     * ```bbcode
     * [list]
     * [*] list entry
     * [*] list entry
     * [/list]
     * ```
     *
     * Defaults to false.
     */
    isLinebreakTerminated?: boolean

    /** React component that will be rendered when this tag is encountered */
    component: ({ tagNode, children }: {
        /** Tag node as parsed by the bbcode-compiler parser */
        tagNode: TagNode
        /** Rendered React children, if applicable */
        children?: React.ReactNode
    }) => React.ReactElement | false
}
