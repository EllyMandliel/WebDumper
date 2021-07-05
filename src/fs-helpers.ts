import { promisify } from 'util';
import { dirname } from 'path';
import { mkdir, rm, writeFile, readFile, access } from 'fs';

export const createDirectory = promisify(mkdir);

export async function saveFileToPath(filename: string, contents: string): Promise<void> {
    await createDirectory(dirname(filename), {
        recursive: true,
    });
    await promisify(writeFile)(filename, contents);
}

export async function readFileContent(fname: string): Promise<string> {
    return (await promisify(readFile)(fname)).toString();
}

export async function emptyDirectory(path: string): Promise<void> {
    if (await exists(path)) {
        await promisify(rm)(path, { recursive: true });
    }
    await createDirectory(path);
}

export async function exists(filename: string): Promise<boolean> {
    return await new Promise((resolve) =>
        access(filename, (err) => {
            if (err) resolve(false);
            resolve(true);
        })
    );
}
