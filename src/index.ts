import { ArgumentParser } from 'argparse';

import { emptyDirectory } from './fs-helpers';
import { Unpacker } from './unpacker/unpacker';

(async () => {
    const parser = new ArgumentParser({
        description: 'Web Unpacker - A webpack scraper & unpacker.',
    });
    parser.add_argument('-o', '--out', {
        help: 'output directory',
        required: true,
    });
    parser.add_argument('-u', '--url', { help: 'Website URL', required: true });

    const { out, url } = parser.parse_args();
    await emptyDirectory(out);
    const unpacker = new Unpacker(url, out);
    await unpacker.start();
})();
