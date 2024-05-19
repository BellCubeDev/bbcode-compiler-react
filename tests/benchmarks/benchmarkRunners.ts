import bbobHTML from '@bbob/html'
import presetHTML5 from '@bbob/preset-html5'
import bbcode from 'bbcode'
import BBCodeParser from 'bbcode-parser'
import bbcodejs from 'bbcodejs'
import MarkdownIt from 'markdown-it'
import TsBbcodeParser from 'ts-bbcode-parser'
import Yabbcode from 'ya-bbcode'
import { generateHtml } from 'bbcode-compiler'
import { generateReact } from '../../src/index.js'

interface BenchmarkRunner {
    name: string
    run: (input: string) => React.ReactNode
}

export const benchmarkRunners: Array<BenchmarkRunner> = [
    {
        name: 'bbcode-compiler-react',
        run: (input) => generateReact(input),
    },
    { // Mother?
        name: 'bbcode-compiler',
        run: (input) => generateHtml(input),
    },
    {
        name: 'markdown-it',
        run: (input) => new MarkdownIt().render(input),
    },
    {
        name: 'bbcode',
        run: (input) => bbcode.parse(input),
    },
    {
        name: 'bbcodejs',
        run: (input) => new bbcodejs.Parser().toHTML(input),
    },
    {
        name: 'bbcode-parser',
        run: (input) => new BBCodeParser(BBCodeParser.defaultTags()).parseString(input),
    },
    {
        name: 'ts-bbcode-parser',
        run: (input) => new TsBbcodeParser().parse(input),
    },
    {
        name: 'bbob',
        run: (input) => bbobHTML.default(input, presetHTML5.default()),
    },
    {
        name: 'yabbcode',
        run: (input) => new Yabbcode().parse(input),
    },
]
