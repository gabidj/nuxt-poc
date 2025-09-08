import {isStringObject} from "node:util/types";
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function timeToSeconds(timeStr :string) : number {
    const [minutes, rest] = timeStr.split(":");
    const seconds = parseFloat(rest);
    return parseInt(minutes, 10) * 60 + parseInt(seconds);
}

function parseLine(line :string) {
    const regex = /^\[(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})\]\s+(.*)$/;
    const match = line.match(regex);
    if (match) {
        const [, startTime, endTime, content] = match;
        return {
            startTime,
            endTime,
            startSeconds: timeToSeconds(startTime),
            endSeconds: timeToSeconds(endTime),
            text: content.trim()
        }
    }
}

function parseTranscript(fileContents: string) {
    return fileContents.split('\n').map(line => parseLine(line)).filter(line => line !== undefined);
}

export default defineEventHandler((event) => {
    const id = getRouterParam(event, 'id')

    if (!id || isStringObject(id)) throw createError({})

    // if file exists data/{id}/output.txt
    const filePath = join(process.cwd(), 'data', id, 'output.txt');

    if (!existsSync(filePath)) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Output file not found'
        })
    }
    const fileContent = readFileSync(filePath, 'utf-8');
    parseTranscript(fileContent);

    try {
        const fileContent = readFileSync(filePath, 'utf-8');

        return {
            hello2: 'world',
            id,
            transcript: parseTranscript(fileContent),
            rawContent: fileContent
        }
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to read output file'
        })
    }
})
