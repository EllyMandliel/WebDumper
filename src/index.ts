#!/usr/bin/env node
import yargs from 'yargs/yargs';

import { emptyDirectory } from './fs-helpers';
import { Unpacker } from './unpacker/unpacker';

(async () => {

    const { out, url } = await yargs(process.argv.slice(2)).options({
        url: { type: 'string', demandOption: true, alias: 'u' },
        out: { type: 'string', demandOption: true, alias: 'o' },
    }).argv;

    if(out !== '.')
        await emptyDirectory(out);
    const unpacker = new Unpacker(url, out);
    await unpacker.start();
})();
