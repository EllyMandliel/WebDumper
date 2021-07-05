import cheerio from 'cheerio';
import { join } from 'path';

import { saveFileToPath } from '../fs-helpers';
import RequestGateway from './request-gateway';
import URLDispatcher from './dispatcher';
import { quoteString } from '../fomatting';

export class Unpacker {
    private gateway: RequestGateway = new RequestGateway();
    private dispatcher: URLDispatcher;

    constructor(private url: string, private outputDirectory: string) {
        this.dispatcher = new URLDispatcher(url, outputDirectory, this.gateway);
    }

    public async start(): Promise<void> {
        const page = await this.gateway.schedule(this.url);
        const $ = cheerio.load(page.data);
        const scriptPages = $('script')
            .toArray()
            .map((tag) => $(tag).attr('src'));
        await Promise.all(
            scriptPages.map((sourceURI) => this.dispatcher.dispatchURI(sourceURI, this.dispatcher.trivialOrigin))
        );

        await saveFileToPath(
            join(this.outputDirectory, quoteString(this.dispatcher.trivialOrigin), 'index.html'),
            page.data
        );
    }
}
