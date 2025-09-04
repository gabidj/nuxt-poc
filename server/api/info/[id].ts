import {isStringObject} from "node:util/types";
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export default defineEventHandler((event) => {
    const id = getRouterParam(event, 'id')

    if (!id || isStringObject(id)) throw createError({})

    const filePath = join(process.cwd(), 'data', id, 'processed-info.json');

    if (!existsSync(filePath)) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Output file not found'
        })
    }
    const fileContent = readFileSync(filePath, 'utf-8');

    try {
        const jsonData = JSON.parse(fileContent);

        // Option 1: return object (Nitro will set JSON automatically)
        return jsonData;
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to read output file'
        })
    }
})
