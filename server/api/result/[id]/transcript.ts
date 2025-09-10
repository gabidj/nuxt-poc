import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toFixed(2).padStart(5, '0');
    return `${mins}:${secs}`;
}

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID parameter is required'
        })
    }

    const transcriptPath = path.join(process.cwd(), 'public', 'data', 'uploads', id, 'transcript', 'whisper.json')

    if (!existsSync(transcriptPath)) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Transcript file not found'
        })
    }

    try {
        const fileContent = await readFile(transcriptPath, 'utf-8')
        const whisperData = JSON.parse(fileContent)

        // Helper function to convert time format to seconds
        const timeToSeconds = (timeFloat) => {
            return Math.floor(timeFloat)
        }

        // Parse segments into the required format
        const transcript = whisperData.segments.map(segment => ({
            startTime: formatTime(segment.start),
            endTime: formatTime(segment.end),
            startSeconds: timeToSeconds(segment.start),
            endSeconds: timeToSeconds(segment.end),
            text: segment.text.trim()
        }))

        return {
            id,
            transcript,
            rawContent: whisperData
        }

    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to parse transcript file'
        })
    }
})
