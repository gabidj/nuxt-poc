// server/api/upload.post.js
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1024MB in bytes
const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/x-ms-wmv',  // .wmv
    'video/webm'
]

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

        const fileData = form.find(item => item.name === 'video')

        if (!fileData) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No video file found in upload'
            })
        }

        // Check file size
        if (fileData.data.length > MAX_FILE_SIZE) {
            throw createError({
                statusCode: 413,
                statusMessage: 'File too large. Maximum size is 1024MB'
            })
        }

        // Check if it's a video file
        if (!ALLOWED_VIDEO_TYPES.includes(fileData.type)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Only video files are allowed'
            })
        }

        // Generate UUID
        const uuid = randomUUID()

        // Create directory path
        const uploadDir = path.join(process.cwd(), 'public', 'data', 'uploads', uuid)
        const filePath = path.join(uploadDir, 'video.mp4')

        // Create directory if it doesn't exist
        await fs.mkdir(uploadDir, { recursive: true })

        // Save the file
        await fs.writeFile(filePath, fileData.data)

        return {
            success: true,
            uuid,
            message: 'Video uploaded successfully',
            path: `/data/uploads/${uuid}/video.mp4`
        }

    } catch (error) {
        console.error('Upload error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error during upload'
        })
    }
})
