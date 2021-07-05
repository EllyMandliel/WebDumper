import { join } from 'path';

import { quoteString, splitURL } from '../fomatting';
import OriginHandler from './origin-handler';
import RequestGateway from './request-gateway';

export default class URLDispatcher {
    private handlers: Record<string, OriginHandler> = {};
    public trivialOrigin: string;

    private static _instance: URLDispatcher = null;

    constructor(private url: string, private outputDirectory: string, private gateway: RequestGateway) {
        URLDispatcher._instance = this;
        this.trivialOrigin = splitURL(this.url).origin;
    }

    public static getInstance(): URLDispatcher {
        return URLDispatcher._instance;
    }

    public async dispatchURI(path: string, origin: string | undefined): Promise<void> {
        if (origin === undefined) {
            origin = splitURL(this.url).origin;
        }
        if (/https?:\/\//i.test(path)) {
            const splitted = splitURL(path);
            [origin, path] = [splitted.origin, splitted.uri];
        }
        if (this.handlers[origin] === undefined) {
            this.handlers[origin] = new OriginHandler(
                origin,
                join(this.outputDirectory, quoteString(origin)),
                this.gateway
            );
        }
        await this.handlers[origin].processScript(path).catch(() => undefined);
    }
}
