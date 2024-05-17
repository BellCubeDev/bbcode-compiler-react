/**

Haven't formally verified this grammar but it should be LL(2)

The root's intermediate state has StartTag/EndTag because it's easier to first parse them as independant nodes
than to parse a StartTag and find the matching EndTag since we can only lookahead by 1 token

Trying to lookahead by 4 tokens after each advancement to determine the end of the sub-root will greatly affect performance
    1 "["
    2 "/"
    3 "LABEL"
    4 "]"

---

Root <- (Text | Linebreak | Tag)*

Text <-
| {XSS Characters}.
| STR.

Linebreak <-
| LINEBREAK.

Tag      <- StartTag Root EndTag
StartTag <- L_BRACKET           Text Attr* R_BRACKET
EndTag   <- L_BRACKET BACKSLASH Text       R_BRACKET

Attr <-
| STR EQUALS STR
| EQUALS STR
| STR

*/

import { nodeIsType } from './nodeIsType.js'

// ----------------------------------------------------------------------------
// AstNode
// ----------------------------------------------------------------------------

export const enum AstNodeType {
    RootNode,
    TextNode,
    LinebreakNode,
    TagNode,
    StartTagNode,
    EndTagNode,
    AttrNode,
}

export function nodeTypeToString(nodeType: AstNodeType): string {
    switch (nodeType) {
        case AstNodeType.RootNode: return 'RootNode'
        case AstNodeType.TextNode: return 'TextNode'
        case AstNodeType.LinebreakNode: return 'LinebreakNode'
        case AstNodeType.TagNode: return 'TagNode'
        case AstNodeType.StartTagNode: return 'StartTagNode'
        case AstNodeType.EndTagNode: return 'EndTagNode'
        case AstNodeType.AttrNode: return 'AttrNode'
    }
}

export abstract class AstNodeBase {
    readonly abstract nodeType: AstNodeType

    // eslint-disable-next-line no-use-before-define
    readonly children: Array<AstNode>

    constructor(children: Array<AstNode> = []) {
        this.children = children
    }

    addChild(node: AstNode): void {
        this.children.push(node)
    }

    isValid(): boolean {
        for (const child of this.children) {
            if (!child.isValid()) {
                return false
            }
        }

        return true
    }

    toShortString(): string {
        return nodeTypeToString(this.nodeType)
    }

    // For debugging purposes only
    // Pretty-prints AST
    toString(depth = 0): string {
        let s = ' '.repeat(depth * 2) + this.toShortString()

        for (const child of this.children) {
            s += '\n' + child.toString(depth + 1)
        }

        return s
    }
}

// ----------------------------------------------------------------------------
// Root
// ----------------------------------------------------------------------------

export class RootNode extends AstNodeBase {
    readonly nodeType = AstNodeType.RootNode

    override isValid(): boolean {
        for (const child of this.children) {
            if (child.nodeType !== AstNodeType.TagNode &&
                child.nodeType !== AstNodeType.TextNode &&
                child.nodeType !== AstNodeType.LinebreakNode) {
                return false
            }
        }

        return super.isValid() && this.children.length > 0
    }
}

// ----------------------------------------------------------------------------
// Text
// ----------------------------------------------------------------------------

export class TextNode extends AstNodeBase {
    readonly nodeType = AstNodeType.TextNode
    readonly str: string

    constructor(str: string) {
        super()
        this.str = str
    }

    override isValid(): boolean {
        return super.isValid() && this.children.length === 0
    }

    override toShortString(): string {
        return `${super.toShortString()} "${this.str}"`
    }
}

export class LinebreakNode extends AstNodeBase {
    readonly nodeType = AstNodeType.LinebreakNode

    override toShortString(): string {
        return `${super.toShortString()} "\\n"`
    }
}

// ----------------------------------------------------------------------------
// Tag
// ----------------------------------------------------------------------------

export class StartTagNode extends AstNodeBase {
    readonly nodeType = AstNodeType.StartTagNode
    readonly tagName: string
    readonly ogTag: string

    constructor(tagName: string, ogTag: string, attrNodes: Array<AttrNode> = []) {
        super(attrNodes)
        this.tagName = tagName.toLowerCase()
        this.ogTag = ogTag
    }

    override isValid(): boolean {
        for (const child of this.children) {
            if (child.nodeType !== AstNodeType.AttrNode) {
                return false
            }
        }

        return super.isValid()
    }

    override toShortString(): string {
        return `${super.toShortString()} ${this.ogTag}`
    }
}

export class EndTagNode extends AstNodeBase {
    readonly nodeType = AstNodeType.EndTagNode
    readonly tagName: string
    readonly ogTag: string

    constructor(tagName: string, ogTag: string) {
        super()
        this.tagName = tagName
        this.ogTag = ogTag
    }

    override isValid(): boolean {
        return super.isValid() && this.children.length === 0
    }

    override toShortString(): string {
        return `${super.toShortString()} ${this.ogTag}`
    }
}

export class TagNode extends AstNodeBase {
    readonly nodeType = AstNodeType.TagNode
    private readonly _startTag: StartTagNode
    private readonly _endTag?: EndTagNode | LinebreakNode

    constructor(startTag: StartTagNode, endTag?: EndTagNode | LinebreakNode) {
        super()
        this._startTag = startTag
        this._endTag = endTag
    }

    get tagName(): string {
        return this._startTag.tagName
    }

    get attributes(): Array<AttrNode> {
        return this._startTag.children as Array<AttrNode>
    }

    public getAttributesByName(): Record<string, string> {
        const attrs: Record<string, string> = {}

        for (const attrNode of this.attributes) {
            attrs[attrNode.key] = attrNode.val
        }

        return attrs
    }

    get ogStartTag(): string {
        return this._startTag.ogTag
    }

    get ogEndTag(): string {
        if (!this._endTag) {
            return ''
        }

        if (nodeIsType(this._endTag, AstNodeType.LinebreakNode)) {
            return '\n'
        } else {
            return this._endTag.ogTag
        }
    }

    override isValid(): boolean {
        if (this._endTag && nodeIsType(this._endTag, AstNodeType.EndTagNode) && this._startTag.tagName !== this._endTag.tagName) {
            return false
        }

        if (this.children.length === 1 && this.children[0].nodeType !== AstNodeType.RootNode) {
            return false
        }

        if (this.children.length > 2) {
            return false
        }

        return super.isValid() && this._startTag.isValid() && (this._endTag?.isValid() ?? true)
    }

    override toString(depth = 0): string {
        let s = ' '.repeat(depth * 2) + this.toShortString() + ` [${this.tagName}]`

        for (const attrNode of this._startTag.children) {
            s += '\n' + attrNode.toString(depth + 1)
        }

        for (const child of this.children) {
            s += '\n' + child.toString(depth + 1)
        }

        return s
    }

    /**
     * Gets the text of the immediate descendant of the current TagNode
     *
     * For example, would return "https://en.wikipedia.org/wiki/Markdown" for the following:
     * ```bbcode
     * [url]https://en.wikipedia.org/wiki/Markdown[/url]
     * ```
     */
    public getTagImmediateText(this: TagNode): string | undefined {
        if (this.children.length !== 1) {
            return undefined
        }

        const child = this.children[0]
        if (!nodeIsType(child, AstNodeType.RootNode)) {
            return undefined
        }

        if (child.children.length !== 1) {
            return undefined
        }

        const textNode = child.children[0]
        if (!nodeIsType(textNode, AstNodeType.TextNode)) {
            return undefined
        }

        return textNode.str
    }

    /**
     * Gets the value of the immediate attribute of the current TagNode
     *
     * For example, would return "https://en.wikipedia.org/wiki/Markdown" for the following:
     * ```bbcode
     * [url=https://en.wikipedia.org/wiki/Markdown] Wikipedia's page on Markdown [/url]
     * ```
     */
    public getTagImmediateAttrVal(this: TagNode): string | undefined {
        if (this.attributes.length !== 1) {
            return undefined
        }

        const attrNode = this.attributes[0]
        return attrNode.val
    }
}

// ----------------------------------------------------------------------------
// Attr
// ----------------------------------------------------------------------------

export class AttrNode extends AstNodeBase {
    readonly nodeType = AstNodeType.AttrNode

    static readonly DEFAULT_KEY = 'default'

    get key(): string {
        switch (this.children.length) {
            case 1: {
                return AttrNode.DEFAULT_KEY
            }
            case 2: {
                if (!nodeIsType(this.children[0], AstNodeType.TextNode)) {
                    throw new Error('Invalid TextNode')
                }

                return this.children[0].str.trim()
            }
        }

        throw new Error('Invalid AttrNode')
    }

    get val(): string {
        switch (this.children.length) {
            case 1: {
                if (!nodeIsType(this.children[0], AstNodeType.TextNode)) {
                    throw new Error('Invalid TextNode')
                }

                return this.children[0].str.trim()
            }
            case 2: {
                if (!nodeIsType(this.children[1], AstNodeType.TextNode)) {
                    throw new Error('Invalid TextNode')
                }

                return this.children[1].str.trim()
            }
        }

        throw new Error('Invalid AttrNode')
    }

    override isValid(): boolean {
        return super.isValid() && (this.children.length >= 1 && this.children.length <= 2)
    }

    override toShortString(): string {
        let s = super.toShortString()

        switch (this.children.length) {
            case 1: {
                s += ` VAL="${this.val}"`
                break
            }
            case 2: {
                s += ` KEY="${this.key}" VAL="${this.val}"`
                break
            }
        }

        return s
    }
}

export type AstNode = RootNode | TextNode | LinebreakNode | TagNode | StartTagNode | EndTagNode | AttrNode
