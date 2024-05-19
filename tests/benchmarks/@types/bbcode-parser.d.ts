declare module 'bbcode-parser' {
    interface BBTag {
        createSimpleTag(tag: string): BBTag
    }

    class BBCodeParser {
        constructor(tags: Record<string, BBTag>)
        parseString(input: string): string

        static defaultTags(): Record<string, BBTag>
    }

    export default BBCodeParser
}
