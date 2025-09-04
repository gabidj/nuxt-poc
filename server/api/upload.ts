// server/api/upload/video.post.js
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = 'uploads/videos'
const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1GB
const ALLOWED_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']

export default defineEventHandler(async (event) => {
    try {
        // Only allow POST requests
        if (getMethod(event) !== 'POST') {
            throw createError({
                statusCode: 405,
                statusMessage: 'Method not allowed'
            })
        }

        // Parse multipart form data
        const form = await readMultipartFormData(event)

        if (!form || form.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No file uploaded'
            })
        }

        const videoFile = form.find(item => item.name === 'video')

        if (!videoFile) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Video file is required'
            })
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(videoFile.type)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid file type. Only video files are allowed.'
            })
        }

        // Validate file size
        if (videoFile.data.length > MAX_FILE_SIZE) {
            throw createError({
                statusCode: 400,
                statusMessage: 'File too large. Maximum size is 100MB.'
            })
        }

        // Create upload directory if it doesn't exist
        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true })
        }

        // Generate unique filename
        const fileExtension = path.extname(videoFile.filename || '.mp4')
        const uniqueFilename = `${randomUUID()}${fileExtension}`
        const filePath = path.join(UPLOAD_DIR, uniqueFilename)

        // Save file
        await writeFile(filePath, videoFile.data)

        // Return success response
        return {
            success: true,
            message: 'Video uploaded successfully',
            data: {
                filename: uniqueFilename,
                originalName: videoFile.filename,
                size: videoFile.data.length,
                type: videoFile.type,
                path: filePath
            }
        }

    } catch (error) {
        console.error('Upload error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        })
    }
})
