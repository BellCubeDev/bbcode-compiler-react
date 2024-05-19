export class DoNotRenderBBCodeError extends Error {
    constructor() {
        super('[Internal bbcode-compiler-react Utility Error] Do not render this BBCode')
        this.name = 'DoNotRenderBBCodeError'
    }
}
