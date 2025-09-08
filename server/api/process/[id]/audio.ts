// server/api/process/[id]/audio.ts
import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const execCommand = (command: string, args: string[], options: any = {}): Promise<{ stdout: string; stderr: string }> => {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, options)
        let stdout = ''
        let stderr = ''

        process.stdout?.on('data', (data) => {
            stdout += data.toString()
        })

        process.stderr?.on('data', (data) => {
            stderr += data.toString()
        })

        process.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr })
            } else {
                reject(new Error(`Command failed with code ${code}: ${stderr}`))
            }
        })

        process.on('error', (error) => {
            reject(error)
        })
    })
}

const findVideoFile = async (uploadsDir: string, id: string): Promise<string | null> => {
    const commonExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv']

    for (const ext of commonExtensions) {
        const videoPath = path.join(uploadsDir, `${id}`, `/video${ext}`)
        try {
            await fs.access(videoPath)
            return videoPath
        } catch {
            // File doesn't exist, try next extension
            continue
        }
    }

    return null
}

const checkAudioExists = async (audioPath: string): Promise<boolean> => {
    try {
        await fs.access(audioPath)
        return true
    } catch {
        return false
    }
}

const getAudioInfo = async (audioPath: string): Promise<{ duration: string | null; size: number | null }> => {
    try {
        const stats = await fs.stat(audioPath)

        // Get duration using ffprobe
        try {
            const result = await execCommand('ffprobe', [
                '-v', 'quiet',
                '-show_entries', 'format=duration',
                '-of', 'csv=p=0',
                audioPath
            ])
            const duration = parseFloat(result.stdout.trim())
            return {
                duration: isNaN(duration) ? null : `${duration.toFixed(2)}s`,
                size: stats.size
            }
        } catch {
            return {
                duration: null,
                size: stats.size
            }
        }
    } catch {
        return { duration: null, size: null }
    }
}

export default defineEventHandler(async (event) => {
    try {
        // Only allow GET requests
        if (getMethod(event) !== 'GET') {
            throw createError({
                statusCode: 405,
                statusMessage: 'Method not allowed'
            })
        }

        // Get the ID from the route parameter
        const id = getRouterParam(event, 'id')

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID parameter is required'
            })
        }

        // Validate ID format (UUID or alphanumeric)
        if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid ID format'
            })
        }

        const uploadsDir = path.join(process.cwd(), 'public', 'data', 'uploads')
        const audioDir = path.join(uploadsDir, id, 'audio')
        const audioPath = path.join(audioDir, 'audio.m4a')

        await fs.mkdir(audioDir, { recursive: true })

        // Find the video file with any supported extension
        const videoPath = await findVideoFile(uploadsDir, id)

        if (!videoPath) {
            throw createError({
                statusCode: 404,
                statusMessage: `Video file not found for ID: ${id}`
            })
        }

        // Check if audio already exists
        const audioExists = await checkAudioExists(audioPath)

        if (audioExists) {
            const audioInfo = await getAudioInfo(audioPath)

            return {
                success: true,
                message: 'Audio already exists, skipping processing',
                id,
                audioPath: `/data/uploads/${id}/audio/audio.m4a`,
                duration: audioInfo.duration,
                size: audioInfo.size,
                format: 'm4a',
                bitrate: '96kbps'
            }
        }

        // Run ffmpeg command to extract audio and convert to M4A at 96kbps
        const ffmpegArgs = [
            '-i', videoPath,
            '-vn', // No video
            '-acodec', 'aac', // AAC codec for M4A
            '-b:a', '96k', // Audio bitrate 96kbps
            '-f', 'mp4', // MP4 container (M4A is MP4 with audio only)
            '-y', // Overwrite output file if it exists
            audioPath
        ]

        console.log(`Processing audio for video: ${videoPath}`)
        console.log(`FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`)

        try {
            const result = await execCommand('ffmpeg', ffmpegArgs)
            console.log('FFmpeg output:', result.stderr) // ffmpeg outputs to stderr by default
        } catch (error: any) {
            console.error('FFmpeg error:', error.message)
            throw createError({
                statusCode: 500,
                statusMessage: `FFmpeg processing failed: ${error.message}`
            })
        }

        // Verify audio was created
        const audioCreated = await checkAudioExists(audioPath)

        if (!audioCreated) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Audio file was not generated'
            })
        }

        const audioInfo = await getAudioInfo(audioPath)

        return {
            success: true,
            message: 'Audio processed successfully',
            id,
            videoPath: path.basename(videoPath),
            audioPath: `/data/uploads/${id}/audio/audio.m4a`,
            duration: audioInfo.duration,
            size: audioInfo.size,
            format: 'm4a',
            bitrate: '96kbps'
        }

    } catch (error: any) {
        console.error('Audio processing error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error during audio processing'
        })
    }
})
