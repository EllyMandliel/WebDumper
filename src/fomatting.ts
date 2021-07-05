import { join } from 'path';

function escapeRegex(string: string): string {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function renderTQDM(success: number, total: number, errors: number): void {
    const midpoint = success / total;
    const width = 60;
    let out = '|';
    for (let i = 0; i < width; i++) {
        if (i >= midpoint * width) {
            out += '-';
        } else {
            out += '#';
        }
    }
    out += '| ' + success + '/' + total + ' ' + Math.round(1000 * midpoint) / 10 + '% [';
    out += '\x1b[0mFailed: ' + errors + '\x1b[0m]\n';
    process.stdout.clearLine(1);
    process.stdout.write(out);
    process.stdout.moveCursor(0, -1);
}

export function splitURL(url: string): { origin: string; uri: string } {
    url = url.replaceAll(/ /g, '');
    const uri = url.match(/.*?\.[^.]*?(\/.*)/)[1];
    const origin = url.replace(new RegExp(escapeRegex(uri) + '$'), '');
    return { uri, origin };
}

export function quoteString(url: string): string {
    return (
        url
            .replace(/https?:*/, '')
            // eslint-disable-next-line no-useless-escape
            .replace((url.match(/.*?\.[^\.]*?(\/.*)/) || [''])[0], '')
    );
}

export function joinURL(...parts: string[]): string {
    try {
        return join(...parts)
            .replace(/\\/g, '/')
            .replace(':/', '://');
    } catch {
        console.log();
    }
}
