import type { TagNode } from '../../parser/AstNode.js'
import React from 'react'

interface TransformBase<TSkipChildren = false> {
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
    skipChildren?: TSkipChildren
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

    /** A React functional component that will be rendered when this tag is encountered
     *
     * If the raw text should be rendered (for example, if an image with a `javascript:` URL is encountered), you should call `doNotRenderBBCodeComponent()`.
     *
     * @param tagNode - The tag node as parsed by the bbcode-compiler parser
     * @param children - The rendered React children, if applicable
    */
    Component: ({ tagNode, children }: {
        /** The tag node as parsed by the bbcode-compiler parser */
        tagNode: TagNode
        /** The rendered React children for this tag */
        children: never
    }) => React.ReactNode
}

interface TransformSkipChildren extends TransformBase<true> {
    skipChildren: true

    /** A React functional component that will be rendered when this tag is encountered
     *
     * If the raw text should be rendered (for example, if an image with a `javascript:` URL is encountered), you should call `doNotRenderBBCodeComponent()`.
     *
     * @param tagNode - The tag node as parsed by the bbcode-compiler parser
     * @param children - As this is a `skipChildren` tag, this will always be `undefined`.
    */
    Component: ({ tagNode, children }: {
        /** The tag node as parsed by the bbcode-compiler parser */
        tagNode: TagNode
        /** As this is a `skipChildren` tag, this will always be `undefined`. */
        children?: undefined
    }) => React.ReactNode
}

interface TransformWithChildren extends TransformBase<false> {
    skipChildren?: false
    /** A React functional component that will be rendered when this tag is encountered
     *
     * If the raw text should be rendered (for example, if an image with a `javascript:` URL is encountered), you should call `doNotRenderBBCodeComponent()`.
     *
     * @param tagNode - The tag node as parsed by the bbcode-compiler parser
     * @returns The rendered React component
     */
    Component: ({ tagNode, children }: {
        /** The tag node as parsed by the bbcode-compiler parser */
        tagNode: TagNode
        /** The rendered React children for this tag */
        children: Array<React.ReactNode>
    }) => React.ReactNode
}

export type Transform = TransformSkipChildren | TransformWithChildren
