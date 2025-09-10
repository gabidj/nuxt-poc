// server/api/process/[id]/frames.ts
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

const checkFramesExist = async (framesDir: string): Promise<boolean> => {
    try {
        const files = await fs.readdir(framesDir)
        const frameFiles = files.filter(file => file.match(/^frame_\d{5}\.jpg$/))
        return frameFiles.length > 0
    } catch {
        return false
    }
}

const getFirstAndLastFrames = async (framesDir: string): Promise<{ firstFrame: string | null; lastFrame: string | null }> => {
    try {
        const files = await fs.readdir(framesDir)
        const frameFiles = files.filter(file => file.match(/^frame_\d{5}\.jpg$/)).sort()

        if (frameFiles.length === 0) {
            return { firstFrame: null, lastFrame: null }
        }

        return {
            firstFrame: frameFiles[0],
            lastFrame: frameFiles[frameFiles.length - 1]
        }
    } catch {
        return { firstFrame: null, lastFrame: null }
    }
}

export default defineEventHandler(async (event) => {
    try {
        // Only allow GET requests
        if (getMethod(event) !== 'POST') {
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
        const framesDir = path.join(uploadsDir, id, 'frames')

        await fs.mkdir(framesDir, { recursive: true })

        // Find the video file with any supported extension
        const videoPath = await findVideoFile(uploadsDir, id)

        if (!videoPath) {
            throw createError({
                statusCode: 404,
                statusMessage: `Video file not found for ID: ${id} `
            })
        }

        // Check if frames already exist
        const framesExist = await checkFramesExist(framesDir)

        if (framesExist) {
            const existingFrames = await fs.readdir(framesDir)
            const frameFiles = existingFrames.filter(file => file.match(/^frame_\d{5}\.jpg$/))
            const { firstFrame, lastFrame } = await getFirstAndLastFrames(framesDir)

            return {
                success: true,
                message: 'Frames already exist, skipping processing',
                id,
                framesCount: frameFiles.length,
                framesPath: `/data/uploads/${id}/frames/`,
                firstFrame,
                lastFrame
            }
        }

        // Run ffmpeg command
        const ffmpegArgs = [
            '-i', videoPath,
            '-vf', 'fps=2',
            '-q:v', '2',
            path.join(framesDir, 'frame_%05d.jpg')
        ]

        console.log(`Processing frames for video: ${videoPath}`)
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

        // if folder does not exist create it
        await fs.mkdir(framesDir, { recursive: true })

        // Verify frames were created and get first/last
        const processedFrames = await fs.readdir(framesDir)
        const frameFiles = processedFrames.filter(file => file.match(/^frame_\d{5}\.jpg$/))

        if (frameFiles.length === 0) {
            throw createError({
                statusCode: 500,
                statusMessage: 'No frames were generated'
            })
        }

        const { firstFrame, lastFrame } = await getFirstAndLastFrames(framesDir)

        return {
            success: true,
            message: 'Frames processed successfully',
            id,
            videoPath: path.basename(videoPath),
            framesCount: frameFiles.length,
            framesPath: `/data/uploads/${id}/frames/`,
            firstFrame,
            lastFrame
        }

    } catch (error: any) {
        console.error('Frame processing error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error during frame processing'
        })
    }
})
