import axios, { AxiosResponse } from 'axios';
import Bottleneck from 'bottleneck';
import { renderTQDM } from '../fomatting';

const defaultHeaders = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-language': 'en-US,en',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
};

export default class RequestGateway {
    private completed = 0;
    private errors = 0;
    private scheduled = 0;

    private scheduler = new Bottleneck({
        maxConcurrent: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 300,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async schedule(url: string): Promise<AxiosResponse<any>> {
        this.scheduled += 1;
        return this.scheduler.schedule(async () => {
            const reqPromise = axios.get(url, { headers: defaultHeaders });
            const result = await reqPromise.catch(async (err) => {
                this.errors += 1;
                throw err;
            });
            this.completed += 1;
            renderTQDM(this.completed, this.scheduled, this.errors);
            return result;
        });
    }
}
