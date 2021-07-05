import { join } from 'path';

import { exists, readFileContent, saveFileToPath } from '../fs-helpers';
import { findSourceMapping, getImportList } from './parsing';
import RequestGateway from './request-gateway';
import URLDispatcher from './dispatcher';
import { joinURL } from '../fomatting';

type SourceMapping = {
    sources: string[];
    sourcesContent: string[];
};

export default class OriginHandler {
    private requestedURIs: Set<string> = new Set();

    constructor(private origin: string, private baseDir: string, private gateway: RequestGateway) {}

    private async saveRaw(path: string, data: string): Promise<void> {
        return await saveFileToPath(join(this.baseDir, 'raw', path), data);
    }

    public async processScript(uri: string): Promise<void> {
        const mapping = await this.fetchSource(uri);
        if (mapping) {
            const mappingData = await this.fetchMapping(mapping);
            await this.saveRaw(uri, JSON.stringify(mappingData));
            await this.unpackScript(mappingData);
        }
    }

    private async fetchSource(uri: string): Promise<string | null> {
        if (uri === undefined || this.requestedURIs.has(uri)) return;
        this.requestedURIs.add(uri);
        const data = (await this.gateway.schedule(joinURL(this.origin, uri))).data;
        await this.saveRaw(uri, data);
        const mapping = findSourceMapping(data);
        if (mapping) {
            if (/https?:\/\//i.test(mapping)) {
                return mapping;
            }
            return joinURL(this.origin, uri.replace(/\/[^/]+$/, '/'), mapping);
        }
        return null;
    }

    private async fetchMapping(uri: string): Promise<SourceMapping> {
        const mappingData = (await this.gateway.schedule(uri)).data;
        return mappingData as SourceMapping;
    }

    private async unpackSourceMapSources(mapping: SourceMapping): Promise<void> {
        await Promise.all(
            (mapping.sources || []).map(async (value, index) => {
                const code = mapping.sourcesContent[index];
                await saveFileToPath(
                    join(this.baseDir, value.replace('webpack://', '').replaceAll(/\.\.\//g, '')),
                    code
                );
            })
        );
    }

    private async unpackScript(mapping: SourceMapping): Promise<void> {
        await this.unpackSourceMapSources(mapping);
        const bootstrapPath = joinURL(this.baseDir, 'webpack/bootstrap');
        if (await exists(bootstrapPath)) {
            const bootstrapContent = await readFileContent(bootstrapPath);
            const chunks = getImportList(bootstrapContent) || [];
            const dispatcher = URLDispatcher.getInstance();
            await Promise.all(chunks.map((chunk) => dispatcher.dispatchURI(chunk, this.origin)));
        }
    }
}
